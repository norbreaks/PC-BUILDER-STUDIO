from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from typing import Dict, Any
from bson.objectid import ObjectId
from payment_service import client, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from database import get_builds_collection, get_parts_collection
from auth_utils import get_current_user
from models.build import PCBuild
from utils import _normalize_part_doc
import hmac
import hashlib
from datetime import datetime

payment_router = APIRouter(tags=["Payments"])

async def calculate_final_price(build: PCBuild, parts_collection) -> float:
    """Calculate the total price of the build."""
    total_price = 0.0
    for item in build.components:
        part_doc = await parts_collection.find_one({"_id": item.part_id})
        if part_doc:
            part = _normalize_part_doc(part_doc)
            price = part.get("price", 0.0)
            if isinstance(price, str):
                price = float(price.replace("₹", "").replace(",", ""))
            total_price += price * item.quantity
    return total_price

@payment_router.post("/create-order/{build_id}")
async def create_order(
    build_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds_collection = Depends(get_builds_collection),
    parts_collection = Depends(get_parts_collection)
):
    """Create a Razorpay order for the build."""
    try:
        b_id = ObjectId(build_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid build id.")

    build_doc = await builds_collection.find_one({"_id": b_id, "user_id": ObjectId(current_user["user_id"])})
    if not build_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found or not owned by user.")

    build = PCBuild(**build_doc)
    total_price = await calculate_final_price(build, parts_collection)

    # Convert to paise (Razorpay uses paise)
    amount_in_paise = int(total_price * 100)

    # Create order data
    order_data = {
        "amount": amount_in_paise,
        "currency": "INR",
        "receipt": f"receipt_{build_id}",
        "notes": {
            "build_id": build_id,
            "user_id": current_user["user_id"]
        }
    }

    try:
        order = client.order.create(order_data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to create order: {str(e)}")

    return {
        "key_id": RAZORPAY_KEY_ID,
        "amount": order["amount"],
        "currency": order["currency"],
        "order_id": order["id"],
        "name": "PC Builder Purchase",
        "email": current_user.get("email", ""),
        "contact": current_user.get("contact", "")
    }

@payment_router.post("/verify-payment")
async def verify_payment(
    payment_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user),
    builds_collection = Depends(get_builds_collection)
):
    """Verify the payment signature."""
    razorpay_payment_id = payment_data.get("razorpay_payment_id")
    razorpay_order_id = payment_data.get("razorpay_order_id")
    razorpay_signature = payment_data.get("razorpay_signature")
    build_id = payment_data.get("build_id")

    if not all([razorpay_payment_id, razorpay_order_id, razorpay_signature]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing payment verification data.")

    # Verify signature
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{razorpay_order_id}|{razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if generated_signature != razorpay_signature:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed.")

    # Payment verified, update build status to "Paid"
    try:
        b_id = ObjectId(build_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid build id.")

    update_result = await builds_collection.update_one(
        {"_id": b_id, "user_id": ObjectId(current_user["user_id"])},
        {"$set": {"status": "Paid", "updated_at": datetime.utcnow()}}
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Build not found or not owned by user.")

    return {"status": "success", "message": "Payment verified successfully. Build finalized."}