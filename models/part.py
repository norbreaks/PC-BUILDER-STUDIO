# models/part.py
from pydantic import BaseModel, Field
from typing import Optional, Annotated
from bson.objectid import ObjectId
from pydantic import BeforeValidator
from models.user import PyObjectId, validate_object_id # Reuse the custom ObjectId handler

class PCPart(BaseModel):
    id: Annotated[Optional[PyObjectId], BeforeValidator(validate_object_id)] = Field(alias="_id", default=None)
    category: str = Field(..., example="CPU")
    name: str = Field(..., example="AMD Ryzen 7 7800X3D")
    manufacturer: Optional[str] = Field(None, example="AMD")
    price: float = Field(..., gt=0)
    socket: Optional[str] = Field(None, example="AM5")
    cores: Optional[int] = Field(None, example=8)

    # Motherboard/RAM fields
    ram_type: Optional[str] = Field(None, example="DDR5")
    max_ram_speed_mhz: Optional[int] = Field(None, example=6000)

    # Form Factor fields
    form_factor: Optional[str] = Field(None, description="e.g., ATX, Micro-ATX, Mini-ITX")

    # Power fields
    tdp: Optional[int] = Field(None, description="Power Draw in Watts (for CPU/GPU)")
    wattage: Optional[int] = Field(None, description="PSU Total Wattage")

    # Clearance fields
    length_mm: Optional[float] = Field(None, description="Length in millimeters (for GPU)")
    max_gpu_length_mm: Optional[float] = Field(None, description="Max GPU Clearance in millimeters (for Case)")
    # Add any other required specifications here

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class PartFilterParams(BaseModel):
    """Model for accepting query parameters for filtering/sorting."""
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    sort_by: Optional[str] = Field("price", example="price, name, cores")
    sort_order: Optional[int] = Field(1, example="1 for ascending, -1 for descending")
    limit: Optional[int] = Field(10, gt=0, le=100)
    skip: Optional[int] = Field(0, ge=0)