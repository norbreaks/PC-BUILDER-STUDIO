# routers/parts.py
from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List
from models.part import PCPart, PartFilterParams
from database import get_parts_collection
from motor.motor_asyncio import AsyncIOMotorCollection
from utils import _normalize_part_doc

parts_router = APIRouter(tags=["PC Parts Catalog"])

@parts_router.get(
    "/parts",
    response_model=List[PCPart],
    summary="List PC parts with filtering, sorting, and pagination"
)
async def list_pc_parts(
    # Use Query parameters for complex filtering/sorting
    filters: PartFilterParams = Depends(),
    parts_collection: AsyncIOMotorCollection = Depends(get_parts_collection)
):
    # 1. Build the MongoDB Query ($match)
    query = {}
    if filters.category:
        query["category"] = filters.category
    if filters.min_price is not None or filters.max_price is not None:
        price_query = {}
        if filters.min_price is not None:
            price_query["$gte"] = filters.min_price
        if filters.max_price is not None:
            price_query["$lte"] = filters.max_price
        query["price"] = price_query
    
    # 2. Build the Sort criteria ($sort)
    sort_criteria = [(filters.sort_by, filters.sort_order)]
    
    # 3. Execute the Query
    parts_cursor = parts_collection.find(query).sort(sort_criteria).skip(filters.skip).limit(filters.limit)
    
    parts_list = await parts_cursor.to_list(length=filters.limit)

    # Process parts to clean price strings
    for part in parts_list:
        if 'price' in part and isinstance(part['price'], str):
            # Remove ₹ and commas, convert to float
            part['price'] = float(part['price'].replace('₹', '').replace(',', ''))

    return [PCPart(**part) for part in parts_list]


@parts_router.get(
    "/parts/categories",
    summary="Get a list of all distinct PC part categories"
)
async def get_part_categories(
    parts_collection: AsyncIOMotorCollection = Depends(get_parts_collection)
):
    # Use MongoDB's distinct command to get unique values from the 'category' field
    categories = await parts_collection.distinct("category")
    return {"categories": categories}


@parts_router.get(
    "/parts/{part_id}",
    response_model=PCPart,
    summary="Get a single PC part by ID"
)
async def get_part_details(
    part_id: str,
    parts_collection: AsyncIOMotorCollection = Depends(get_parts_collection)
):
    from bson import ObjectId
    
    try:
        object_id = ObjectId(part_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Part ID format.")

    part_doc = await parts_collection.find_one({"_id": object_id})
    
    if part_doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="PC Part not found.")

    return PCPart(**part_doc)