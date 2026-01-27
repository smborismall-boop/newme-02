from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class RunningInfo(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    message: str
    isActive: bool = True
    priority: int = 0  # Higher priority shows first
    startDate: Optional[datetime] = None
    endDate: Optional[datetime] = None
    linkUrl: Optional[str] = None
    linkText: Optional[str] = None
    bgColor: str = "#FFD700"
    textColor: str = "#1a1a1a"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class RunningInfoCreate(BaseModel):
    message: str
    isActive: bool = True
    priority: int = 0
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    linkUrl: Optional[str] = None
    linkText: Optional[str] = None
    bgColor: str = "#FFD700"
    textColor: str = "#1a1a1a"

class RunningInfoUpdate(BaseModel):
    message: Optional[str] = None
    isActive: Optional[bool] = None
    priority: Optional[int] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    linkUrl: Optional[str] = None
    linkText: Optional[str] = None
    bgColor: Optional[str] = None
    textColor: Optional[str] = None
