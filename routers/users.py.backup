from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any, Annotated
from auth_utils import get_current_user
from models.user import UserOut, PyObjectId
from bson import ObjectId
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Users"])

@router.get("/me", response_model=UserOut)
async def read_users_me(
    current_user: Annotated[Dict[str, Any], Depends(get_current_user)]
):
    """
    Retrieves the current authenticated user's details.
    This route requires a valid JWT token.
    """
    logger.info(f"Fetching user with user_id: {current_user['user_id']}")
    # Fetch the full user from database to get email if needed
    from database import get_user_collection
    user_collection = await get_user_collection()
    # Try to find by _id if it's an ObjectId, else by username
    try:
        user_id_obj = ObjectId(current_user["user_id"])
        user_doc = await user_collection.find_one({"_id": user_id_obj})
        if not user_doc:
            logger.error(f"User not found for _id: {current_user['user_id']}")
            raise HTTPException(status_code=404, detail="User not found")
    except:
        user_doc = await user_collection.find_one({"username": current_user["user_id"]})
        if not user_doc:
            logger.error(f"User not found for username: {current_user['user_id']}")
            raise HTTPException(status_code=404, detail="User not found")
    logger.info(f"User found: {user_doc}")
    # Convert to UserOut
    return UserOut(id=str(user_doc["_id"]), username=user_doc["username"], email=user_doc.get("email"))
