from pydantic import BaseModel, Field
from typing import Optional, List, Annotated
from datetime import datetime
from bson.objectid import ObjectId
from pydantic import BeforeValidator
from models.user import PyObjectId, validate_object_id  # Reuse the custom ObjectId handler

# Model for a single item within the build/cart
class BuildItem(BaseModel):
    part_id: Annotated[PyObjectId, BeforeValidator(validate_object_id)] = Field(..., description="MongoDB ObjectId of the PC part.")
    category: str = Field(..., description="The part category (CPU, GPU, etc.)")
    # You might not need 'quantity' for a single PC build, but good practice for a cart
    quantity: int = Field(1, ge=1)

class PCBuild(BaseModel):
    id: Annotated[Optional[PyObjectId], BeforeValidator(validate_object_id)] = Field(alias="_id", default=None)
    user_id: Annotated[PyObjectId, BeforeValidator(validate_object_id)] = Field(..., description="The user who owns this build.")
    name: str = Field("New PC Build", max_length=100)
    status: str = Field("Draft", description="e.g., Draft, Saved, Archived")
    components: List[BuildItem] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str, ObjectId: str, datetime: lambda dt: dt.isoformat()}

# Response model for active build endpoint
class UserBuildsOut(BaseModel):
    active_build: Optional[PCBuild] = Field(None, description="The user's active build, if any.")
    builds: List[PCBuild] = Field(default_factory=list, description="List of user's builds.")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str, datetime: lambda dt: dt.isoformat()}
