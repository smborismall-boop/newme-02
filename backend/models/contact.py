from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str = Field(..., min_length=1)

class Contact(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str
    status: str = "new"  # new, read, replied, closed
    submittedAt: datetime = Field(default_factory=datetime.utcnow)
    repliedAt: Optional[datetime] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class ContactResponse(BaseModel):
    id: str
    name: str
    email: str
    status: str
    submittedAt: datetime
    message: str = "Pesan Anda telah diterima. Kami akan segera merespons."