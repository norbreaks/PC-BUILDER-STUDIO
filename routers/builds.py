
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from typing import List, Dict, Any
from bson.objectid import ObjectId
from bson.errors import InvalidId
from datetime import datetime
from collections import defaultdict
from pydantic import BaseModel, Field
from models.build import PCBuild, BuildItem, UserBuildsOut
from models.part import PCPart
from models.user import PyObjectId
from database import get_builds_collection, get_parts_collection
from motor.motor_asyncio import AsyncIOMotorCollection
from auth_utils import get_current_user
from math import ceil # Used for power calculations
from utils import _normalize_part_doc

builds_router = APIRouter(tags=["PC Builds"])

# --- Helper Functions (Compatibility and Retrieval) ---

async def get_part_details_by_category(build: PCBuild, category: str, parts_collection: AsyncIOMotorCollection) -> List[PCPart]:
    """Helper to quickly fetch full details for all parts of a specific category in the build."""
    part_ids = [item.part_id for item in build.components if item.category == category]
    if not part_ids:
        return []

    cursor = parts_collection.find({"_id": {"$in": part_ids}})
    part_docs = await cursor.to_list(100)
    return [PCPart(**_normalize_part_doc(doc)) for doc in part_docs]


async def check_compatibility(current_build: PCBuild, new_part_doc: Dict, parts_collection: AsyncIOMotorCollection):
    """
    Implements core compatibility logic checks.
    Raises HTTPException if a rule is violated.
    """
    new_part_doc = _normalize_part_doc(new_part_doc)
    new_part = PCPart(**new_part_doc)

    # 1. CORE RULE: Check for duplicate single-instance categories
    single_instance_categories = ["CPU", "Motherboard", "GPU", "PSU", "Case"]
    if new_part.category in single_instance_categories:
        if any(item.category == new_part.category for item in current_build.components):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A {new_part.category} is already present in the build. Only one is allowed."
            )

    # 2. SOCKET COMPATIBILITY (CPU <--> Motherboard)
    motherboards = await get_part_details_by_category(current_build, "Motherboard", parts_collection)
    cpus = await get_part_details_by_category(current_build, "CPU", parts_collection)

    # Rule 2a: Adding CPU, check existing Motherboard
    if new_part.category == "CPU" and motherboards:
        if new_part.socket != motherboards[0].socket:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"CPU socket ({new_part.socket}) does not match Motherboard socket ({motherboards[0].socket}).")

    # Rule 2b: Adding Motherboard, check existing CPU
    if new_part.category == "Motherboard" and cpus:
        if new_part.socket != cpus[0].socket:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Motherboard socket ({new_part.socket}) does not match CPU socket ({cpus[0].socket}).")

    # 3. RAM COMPATIBILITY (RAM <--> Motherboard)
    rams = await get_part_details_by_category(current_build, "RAM", parts_collection)

    # Rule 3a: Check RAM type (DDR4 vs DDR5)
    if new_part.category == "RAM" and motherboards:
        if new_part.ram_type != motherboards[0].ram_type:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"RAM type ({new_part.ram_type}) does not match Motherboard's requirement ({motherboards[0].ram_type}).")

    # 4. CASE AND MOTHERBOARD FORM FACTOR (Case <--> Motherboard)
    cases = await get_part_details_by_category(current_build, "Case", parts_collection)

    # Rule 4a: Adding Motherboard, check existing Case compatibility
    if new_part.category == "Motherboard" and cases:
        case_support = cases[0].form_factor.split(',') # Assuming case form_factor is a comma-separated string of supported sizes (e.g., "ATX, Micro-ATX")
        if new_part.form_factor not in case_support:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Motherboard form factor ({new_part.form_factor}) is not supported by the selected Case.")

    # 5. GPU CLEARANCE (GPU <--> Case)
    # Rule 5a: Check GPU length against Case clearance
    if new_part.category == "GPU" and cases:
        if new_part.length_mm is not None and cases[0].max_gpu_length_mm is not None and new_part.length_mm > cases[0].max_gpu_length_mm:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"GPU length ({new_part.length_mm}mm) exceeds Case clearance ({cases[0].max_gpu_length_mm}mm).")

    # 6. PSU WATTAGE CHECK (PSU <--> All Components)
    if new_part.category == "PSU" or new_part.category in ["CPU", "GPU"]:
        # Recalculate total draw based on current build + new part
        all_parts = current_build.components + [BuildItem(part_id=new_part.id, category=new_part.category)]

        total_power_draw = 0
        for item in all_parts:
            # Skip if it's the PSU itself
            if item.category == "PSU":
                continue

            # Fetch TDP for power-consuming parts
            part_doc = await parts_collection.find_one({"_id": item.part_id})
            part_details = PCPart(**_normalize_part_doc(part_doc))
            if part_details.tdp is not None:
                total_power_draw += part_details.tdp * item.quantity

        # Add 15-20% buffer for peripherals/efficiency losses
        REQUIRED_WATTAGE = ceil(total_power_draw * 1.20)

        # Identify the PSU currently in the list
        psu = next((item for item in all_parts if item.category == "PSU"), None)

        if psu:
            psu_doc = await parts_collection.find_one({"_id": psu.part_id})
            psu_details = PCPart(**_normalize_part_doc(psu_doc))

            if psu_details.wattage is not None and psu_details.wattage < REQUIRED_WATTAGE:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"PSU wattage ({psu_details.wattage}W) is insufficient. Total required wattage (with 20% buffer) is at least {REQUIRED_WATTAGE}W.")

    return True # Compatibility check passed!


async def evaluate_build_compatibility(build: PCBuild, parts_collection: AsyncIOMotorCollection) -> Dict[str, Any]:
    """
    Runs compatibility checks across the existing build and returns a summarized report.
    """
    issues: List[Dict[str, str]] = []
    grouped: Dict[str, List[PCPart]] = defaultdict(list)

    # Fetch all part documents for reuse
    part_docs: Dict[ObjectId, PCPart] = {}
    for item in build.components:
        doc = await parts_collection.find_one({"_id": item.part_id})
        if not doc:
            issues.append({"type": "error", "message": f"Component {item.part_id} is missing from catalog."})
            continue
        part = PCPart(**_normalize_part_doc(doc))
        part_docs[item.part_id] = part
        grouped[part.category].append(part)

    single_instance_categories = {"CPU", "Motherboard", "GPU", "PSU", "Case"}
    for category in single_instance_categories:
        if len(grouped.get(category, [])) > 1:
            issues.append({"type": "error", "message": f"Multiple {category} components detected. Only one is allowed."})

    # Socket checks
    cpu = grouped.get("CPU", [None])[0]
    motherboard = grouped.get("Motherboard", [None])[0]
    if cpu and motherboard and cpu.socket != motherboard.socket:
        issues.append({"type": "error", "message": f"CPU socket ({cpu.socket}) does not match Motherboard socket ({motherboard.socket})."})

    # RAM type check
    ram = grouped.get("RAM", [])
    if ram and motherboard and ram[0].ram_type and motherboard.ram_type and ram[0].ram_type != motherboard.ram_type:
        issues.append({"type": "error", "message": f"RAM type ({ram[0].ram_type}) does not match Motherboard requirement ({motherboard.ram_type})."})

    # Case form factor
    case = grouped.get("Case", [None])[0]
    if case and motherboard and motherboard.form_factor:
        supported = [ff.strip() for ff in case.form_factor.split(",")]
        if motherboard.form_factor not in supported:
            issues.append({"type": "error", "message": f"Motherboard form factor ({motherboard.form_factor}) is not supported by selected Case."})

    # GPU length vs Case
    gpu = grouped.get("GPU", [None])[0]
    if gpu and case and gpu.length_mm and case.max_gpu_length_mm and gpu.length_mm > case.max_gpu_length_mm:
        issues.append({"type": "warning", "message": f"GPU length ({gpu.length_mm}mm) is close to/exceeds case clearance ({case.max_gpu_length_mm}mm)."})

    # PSU wattage
    psu = grouped.get("PSU", [None])[0]
    if psu:
        total_draw = 0
        for part in part_docs.values():
            if part.category == "PSU":
                continue
            if part.tdp:
                total_draw += part.tdp
        required = ceil(total_draw * 1.2)
        if psu.wattage and psu.wattage < required:
            issues.append({"type": "error", "message": f"PSU wattage ({psu.wattage}W) is below recommended {required}W for current parts."})

    status = "success"
    if any(i["type"] == "error" for i in issues):
        status = "error"
    elif any(i["type"] == "warning" for i in issues):
        status = "warning"

    return {"status": status, "issues": issues}


def _normalize_part_doc(part_doc: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure price is numeric and compatible with PCPart model."""
    if part_doc and isinstance(part_doc.get("price"), str):
        try:
            part_doc["price"] = float(part_doc["price"].replace("₹", "").replace(",", ""))
        except Exception:
            part_doc["price"] = 0.0
    return part_doc


class BuildItemIn(BaseModel):
    part_id: str = Field(..., description="Stringified ObjectId of the PC part.")
    category: str
    quantity: int = Field(1, ge=1)


async def hydrate_build(build_doc: Dict[str, Any], parts_collection: AsyncIOMotorCollection) -> Dict[str, Any]:
    """
    Returns a dict containing the build, full part details, compatibility summary and totals.
    """
    build = PCBuild(**build_doc)
    parts: List[PCPart] = []
    for item in build.components:
        part_doc = await parts_collection.find_one({"_id": item.part_id})
        if part_doc:
            parts.append(PCPart(**_normalize_part_doc(part_doc)))

    compatibility = await evaluate_build_compatibility(build, parts_collection)
    total_price = sum(part.price for part in parts if part.price)

    return {
        "build": build,
        "parts": parts,
        "compatibility": compatibility,
        "totals": {"price": total_price, "count": len(parts)}
    }

# --- CRUD ENDPOINTS ---

@builds_router.post("/builds", status_code=status.HTTP_201_CREATED)
async def create_build(
    build_data: PCBuild,
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds: AsyncIOMotorCollection = Depends(get_builds_collection)
):
    """Creates a new PC build for the authenticated user."""
    # Ensure the user_id in the payload matches the authenticated user
    if str(build_data.user_id) != current_user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot create a build for another user.")

    build_dict = build_data.model_dump(by_alias=True, exclude_unset=True)
    result = await builds.insert_one(build_dict)
    new_build = await builds.find_one({"_id": result.inserted_id})
    build = PCBuild(**new_build)
    encoded = jsonable_encoder(build, custom_encoder={ObjectId: str})
    return JSONResponse(content=encoded, status_code=status.HTTP_201_CREATED)



@builds_router.get("/builds/active")
async def get_user_builds(
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds: AsyncIOMotorCollection = Depends(get_builds_collection)
):
    """Retrieves the active build for the current user."""

    user_id_str = current_user.get("user_id")

    # Check if the ID is valid before trying to convert it
    if not user_id_str or user_id_str == 'None':
         raise HTTPException(status_code=401, detail="User ID not found in token payload.")

    try:
        user_id = ObjectId(user_id_str)
    except InvalidId:
        raise HTTPException(status_code=401, detail="Invalid user ID format in token.")

    # Find the active build (assuming "Draft" is active, or you could add an "is_active" field)
    active_build_doc = await builds.find_one({"user_id": user_id, "status": "Draft"})

    # Auto-create a draft build if one does not exist
    if not active_build_doc:
        new_build = PCBuild(user_id=user_id, name="My PC Build", status="Draft", components=[])
        inserted = await builds.insert_one(new_build.model_dump(by_alias=True, exclude_none=True))
        active_build_doc = await builds.find_one({"_id": inserted.inserted_id})

    active_build = PCBuild(**active_build_doc) if active_build_doc else None

    # Also get all builds for completeness
    build_cursor = builds.find({"user_id": user_id})
    builds_list_docs = await build_cursor.to_list(100)
    builds_list = []
    
    for build_doc in builds_list_docs:
        builds_list.append(PCBuild(**build_doc))

    result = UserBuildsOut(active_build=active_build, builds=builds_list)
    encoded = jsonable_encoder(result, custom_encoder={ObjectId: str})
    return JSONResponse(content=encoded)


@builds_router.post("/builds/{build_id}/add")
async def add_component_to_build(
    build_id: str,
    item: BuildItemIn,
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds: AsyncIOMotorCollection = Depends(get_builds_collection),
    parts_collection: AsyncIOMotorCollection = Depends(get_parts_collection)
):
    """Adds a part to a user's build, including compatibility checks."""

    # 1. Verify Build and User Ownership
    try:
        b_id = ObjectId(build_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid build id.")

    build_doc = await builds.find_one({"_id": b_id, "user_id": ObjectId(current_user["user_id"])})
    if not build_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found or user does not own it.")

    current_build = PCBuild(**build_doc)

    # 2. Verify Part Exists in Parts Catalog
    try:
        part_oid = ObjectId(item.part_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid part id.")

    part_doc = await parts_collection.find_one({"_id": part_oid})
    if not part_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found in catalog.")

    # 3. RUN COMPATIBILITY CHECK
    await check_compatibility(current_build, part_doc, parts_collection)

    # 4. Update MongoDB (Atomically add component)
    update_result = await builds.update_one(
        {"_id": b_id},
        {
            "$push": {"components": BuildItem(part_id=part_oid, category=item.category, quantity=item.quantity).model_dump()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add component.")

    updated_build_doc = await builds.find_one({"_id": b_id})
    build = PCBuild(**updated_build_doc)
    encoded = jsonable_encoder(build, custom_encoder={ObjectId: str})
    return JSONResponse(content=encoded)


@builds_router.delete("/builds/{build_id}/remove/{part_id}")
async def remove_component_from_build(
    build_id: str,
    part_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds: AsyncIOMotorCollection = Depends(get_builds_collection)
):
    """Removes a component from a user's build."""

    # 1. Verify Build and User Ownership
    try:
        b_id = ObjectId(build_id)
        p_id = ObjectId(part_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid ID format.")

    # 2. Update MongoDB (Atomically pull component)
    update_result = await builds.update_one(
        {"_id": b_id, "user_id": ObjectId(current_user["user_id"])},
        {
            "$pull": {"components": {"part_id": p_id}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found or user does not own it.")
    if update_result.modified_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Component not found in the build.")

    updated_build_doc = await builds.find_one({"_id": b_id})
    build = PCBuild(**updated_build_doc)
    encoded = jsonable_encoder(build, custom_encoder={ObjectId: str})
    return JSONResponse(content=encoded)


@builds_router.get("/builds/{build_id}/details")
async def get_build_details(
    build_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds: AsyncIOMotorCollection = Depends(get_builds_collection),
    parts_collection: AsyncIOMotorCollection = Depends(get_parts_collection)
):
    """
    Returns the selected build with hydrated part details, compatibility summary, and totals.
    """
    try:
        b_id = ObjectId(build_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid build id.")

    build_doc = await builds.find_one({"_id": b_id, "user_id": ObjectId(current_user["user_id"])})
    if not build_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found or not owned by user.")

    data = await hydrate_build(build_doc, parts_collection)
    encoded = jsonable_encoder(data, custom_encoder={ObjectId: str})
    return JSONResponse(content=encoded)
