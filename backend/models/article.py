from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class ArticleCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    category: str = "berita"
    tags: List[str] = []
    featuredImage: Optional[str] = None
    isPublished: bool = True
    publishedAt: Optional[datetime] = None

class Article(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    category: str = "berita"
    tags: List[str] = []
    featuredImage: Optional[str] = None
    author: str = "Admin"
    isPublished: bool = True
    publishedAt: Optional[datetime] = None
    viewCount: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    featuredImage: Optional[str] = None
    isPublished: Optional[bool] = None
