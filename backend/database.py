from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection - will be initialized in server.py
client = None
db = None

def init_db():
    global client, db
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db

def get_db():
    return db
