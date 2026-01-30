import os
import asyncio
from datetime import datetime
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/pc_builder_db")
DEMO_USERNAME = os.getenv("DEMO_USERNAME", "demo")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "demo123")
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@example.com")

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


async def ensure_indexes(db):
    await db.users.create_index("username", unique=True)
    await db.users.create_index("email", unique=True, sparse=True)
    await db.builds.create_index([("user_id", 1), ("status", 1)])


async def ensure_demo_user(db) -> ObjectId:
    existing = await db.users.find_one({"username": DEMO_USERNAME})
    if existing:
        return existing["_id"]

    hashed_password = pwd_context.hash(DEMO_PASSWORD)
    doc = {
        "username": DEMO_USERNAME,
        "email": DEMO_EMAIL,
        "hashed_password": hashed_password,
    }
    result = await db.users.insert_one(doc)
    return result.inserted_id


async def ensure_draft_build(db, user_id: ObjectId) -> ObjectId:
    existing = await db.builds.find_one({"user_id": user_id, "status": "Draft"})
    if existing:
        return existing["_id"]

    build_doc = {
        "user_id": user_id,
        "name": "My PC Build",
        "status": "Draft",
        "components": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.builds.insert_one(build_doc)
    return result.inserted_id


async def main():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database()

    await ensure_indexes(db)
    user_id = await ensure_demo_user(db)
    build_id = await ensure_draft_build(db, user_id)

    print("MongoDB bootstrap complete.")
    print(f"User: {DEMO_USERNAME} (id: {user_id})")
    print(f"Draft build id: {build_id}")


if __name__ == "__main__":
    asyncio.run(main())

