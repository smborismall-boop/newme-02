from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class RegistrationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    recommenderId: Optional[str] = None

class Registration(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    email: EmailStr
    recommenderId: Optional[str] = None
    testStatus: str = "pending"  # pending, in-progress, completed
    registrationDate: datetime = Field(default_factory=datetime.utcnow)
    testResults: Optional[dict] = None
    certificateUrl: Optional[str] = None
    isMember: bool = False
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class RegistrationResponse(BaseModel):
    id: str
    name: str
    email: str
    testStatus: str
    registrationDate: datetime
    message: str = "Pendaftaran berhasil! Anda akan menerima email konfirmasi."