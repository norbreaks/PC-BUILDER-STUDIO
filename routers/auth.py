from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional
from jose import jwt, JWTError
import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorCollection
from models.user import UserCreate, UserDB, Token, TokenData, PyObjectId, UserOut
from database import get_user_collection
from auth_utils import create_access_token, get_current_user


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

auth_router = APIRouter()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)


async def get_user(username: str, user_collection: AsyncIOMotorCollection = Depends(get_user_collection)):
    user_doc = await user_collection.find_one({"username": username})
    if user_doc:
        return UserDB(**user_doc)
    return None

async def authenticate_user(username: str, password: str, user_collection: AsyncIOMotorCollection = Depends(get_user_collection)):
    user_doc = await user_collection.find_one({"username": username})
    if not user_doc:
        return False
    user = UserDB(**user_doc)
    if not verify_password(password, user.hashed_password):
        return False
    return user

@auth_router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate, user_collection = Depends(get_user_collection)):
    # Check if user exists
    existing_user = await user_collection.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    if user.email:
        existing_email = await user_collection.find_one({"email": user.email})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    user_db = UserDB(username=user.username, email=user.email, hashed_password=hashed_password)
    user_data_to_insert = user_db.model_dump(by_alias=True, exclude={'_id'}, exclude_none=True)
    result = await user_collection.insert_one(user_data_to_insert)
    # Return the created user without password
    created_user = await user_collection.find_one({"_id": result.inserted_id})
    return UserOut(**created_user)

@auth_router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    user_collection: AsyncIOMotorCollection = Depends(get_user_collection)
):
    user_doc = await user_collection.find_one({"username": form_data.username})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await authenticate_user(form_data.username, form_data.password, user_collection)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_obj = user_doc.get("_id")
    if not user_id_obj:
        raise HTTPException(status_code=500, detail="User ID not set")

    user_id_str = str(user_id_obj)
    if not user_id_str or user_id_str == 'None':
        raise HTTPException(status_code=500, detail="Invalid user ID")

    access_token = create_access_token(
        data={"user_id": user_id_str, "username": user.username or ""}
    )

    return Token(access_token=access_token, token_type="bearer")
