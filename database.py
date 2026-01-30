from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
import os

# Load environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/pc_builder_db")

# Create MongoDB client
client = AsyncIOMotorClient(MONGO_URI)

# Get database (assuming 'pc_builder_db' from URI or default)
db = client.get_database()

async def get_parts_collection() -> AsyncIOMotorCollection:
    """Dependency to get the parts collection."""
    return db.parts

async def get_user_collection() -> AsyncIOMotorCollection:
    """Dependency to get the users collection."""
    return db.users

async def get_builds_collection() -> AsyncIOMotorCollection:
    """Dependency to get the PC builds collection."""
    return db.builds
