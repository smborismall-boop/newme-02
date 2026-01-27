from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from bson import ObjectId
from utils.objectid import PyObjectId

class PaymentProofUpload(BaseModel):
    registrationId: str
    paymentAmount: float
    paymentMethod: str  # Transfer Bank, E-wallet, etc
    notes: Optional[str] = None

class Payment(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    registrationId: str
    userId: str
    userName: str
    userEmail: str
    paymentAmount: float
    paymentMethod: str
    paymentProofUrl: str
    status: str = "pending"  # pending, approved, rejected
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
    approvedAt: Optional[datetime] = None
    approvedBy: Optional[str] = None
    rejectionReason: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class PaymentApproval(BaseModel):
    status: str  # approved or rejected
    rejectionReason: Optional[str] = None
    notes: Optional[str] = None