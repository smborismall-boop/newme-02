from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class InstitutionInquiryCreate(BaseModel):
    institutionName: str = Field(..., min_length=1, max_length=200)
    contactPerson: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    phone: str = Field(..., min_length=1)
    address: Optional[str] = None
    programType: str  # Kelas Gali Bakat, Kelas Optimasi Potensi, etc.
    numberOfParticipants: Optional[int] = None
    preferredDate: Optional[str] = None
    notes: Optional[str] = None

class InstitutionInquiry(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    institutionName: str
    contactPerson: str
    email: EmailStr
    phone: str
    address: Optional[str] = None
    programType: str
    numberOfParticipants: Optional[int] = None
    preferredDate: Optional[str] = None
    status: str = "inquiry"  # inquiry, scheduled, completed
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )