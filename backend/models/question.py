from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class QuestionOption(BaseModel):
    text: str
    value: str = ""
    score: int = 0

class QuestionCreate(BaseModel):
    text: str = Field(..., min_length=1)
    type: str = "multiple_choice"  # multiple_choice, text, rating, yes_no
    category: str = "personality"  # personality, talent, skills, interest
    testType: str = "free"  # free, paid
    options: List[QuestionOption] = []
    isRequired: bool = True
    order: int = 0

class QuestionUpdate(BaseModel):
    text: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    testType: Optional[str] = None
    options: Optional[List[QuestionOption]] = None
    isRequired: Optional[bool] = None
    order: Optional[int] = None
    isActive: Optional[bool] = None

class Question(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    text: str
    type: str = "multiple_choice"
    category: str = "personality"
    options: List[QuestionOption] = []
    isRequired: bool = True
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class Banner(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    title: str
    description: Optional[str] = None
    imageUrl: str
    link: Optional[str] = None
    type: str = "slider"  # slider, popup
    isActive: bool = True
    order: int = 0
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    createdBy: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
