from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Annotated
from pydantic import BeforeValidator
from bson import ObjectId
from pydantic_core import core_schema


def validate_object_id(v):
    if isinstance(v, PyObjectId):
        return v
    if isinstance(v, ObjectId):
        return PyObjectId(str(v))
    if isinstance(v, str) and ObjectId.is_valid(v):
        return PyObjectId(v)
    raise ValueError("Invalid ObjectId")


class PyObjectId(ObjectId):
    """
    Compatibility wrapper for bson.ObjectId that:
    - validates incoming values (str or ObjectId),
    - returns an instance of PyObjectId (so Pydantic sees something it can stringify),
    - exposes JSON schema for Pydantic v2.
    """

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        return core_schema.no_info_plain_validator_function(
            validate_object_id,
            serialization=core_schema.to_string_ser_schema()
        )

    def __str__(self) -> str:
        # Ensures str(PyObjectId) returns the hex string
        return super().__str__()

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: str = Field(..., min_length=6)

class UserDB(BaseModel):
    id: Annotated[Optional[PyObjectId], BeforeValidator(validate_object_id)] = Field(alias="_id", default=None)
    username: str
    email: Optional[EmailStr] = None
    hashed_password: str

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class UserOut(BaseModel):
    id: Annotated[PyObjectId, BeforeValidator(validate_object_id)] = Field(alias="_id")
    username: str
    email: Optional[EmailStr] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {PyObjectId: str}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: Optional[str] = None