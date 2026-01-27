from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from models.question import Question, QuestionCreate, QuestionUpdate, Banner
from database import get_db
from datetime import datetime
from bson import ObjectId
from routes.admin import verify_token

router = APIRouter(prefix="/api/questions", tags=["questions"])
db = get_db()

# Questions Endpoints
@router.get("", response_model=List[dict])
async def get_questions(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    testType: Optional[str] = None,  # 'free' or 'paid'
    isActive: Optional[bool] = None
):
    """
    Get all questions
    testType: 'free' for basic questions (limit 5), 'paid' for all questions
    """
    try:
        query = {}
        if category:
            query["category"] = category
        
        # Handle isActive - if True, include questions where isActive is True OR not set
        if isActive is True:
            query["$or"] = [{"isActive": True}, {"isActive": {"$exists": False}}]
        elif isActive is False:
            query["isActive"] = False
        
        # Map testType to isFree field
        if testType:
            if testType == 'free':
                query["isFree"] = True
            elif testType == 'paid':
                query["isFree"] = False
        
        cursor = db.questions.find(query).skip(skip).limit(limit).sort("order", 1)
        questions = await cursor.to_list(length=limit)
        
        # Convert and add testType field for frontend compatibility
        for question in questions:
            question["_id"] = str(question["_id"])
            # Add testType field based on isFree
            question["testType"] = "free" if question.get("isFree", False) else "paid"
            # Ensure text field exists (frontend uses 'text', seed uses 'question')
            if "question" in question and "text" not in question:
                question["text"] = question["question"]
        
        return questions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/{question_id}", response_model=dict)
async def get_question(question_id: str):
    """
    Get question by ID
    """
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(status_code=400, detail="Invalid question ID")
        
        question = await db.questions.find_one({"_id": ObjectId(question_id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        
        question["_id"] = str(question["_id"])
        return question
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("", response_model=dict)
async def create_question(
    question: QuestionCreate,
    token_data: dict = Depends(verify_token)
):
    """
    Create new question (admin only)
    """
    try:
        question_data = question.dict()
        question_data["isActive"] = True
        question_data["createdAt"] = datetime.utcnow()
        question_data["updatedAt"] = datetime.utcnow()
        
        result = await db.questions.insert_one(question_data)
        
        return {
            "success": True,
            "questionId": str(result.inserted_id),
            "message": "Question created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/{question_id}", response_model=dict)
async def update_question(
    question_id: str,
    updates: QuestionUpdate,
    token_data: dict = Depends(verify_token)
):
    """
    Update question (admin only)
    """
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(status_code=400, detail="Invalid question ID")
        
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow()
        
        result = await db.questions.update_one(
            {"_id": ObjectId(question_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"success": True, "message": "Question updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.delete("/{question_id}", response_model=dict)
async def delete_question(
    question_id: str,
    token_data: dict = Depends(verify_token)
):
    """
    Delete question (admin only)
    """
    try:
        if not ObjectId.is_valid(question_id):
            raise HTTPException(status_code=400, detail="Invalid question ID")
        
        result = await db.questions.delete_one({"_id": ObjectId(question_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Question not found")
        
        return {"success": True, "message": "Question deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/categories/list", response_model=List[str])
async def get_question_categories():
    """
    Get all question categories
    """
    try:
        categories = await db.questions.distinct("category")
        return categories if categories else ["personality", "talent", "skills", "interest"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.put("/reorder", response_model=dict)
async def reorder_questions(
    orders: List[dict],
    token_data: dict = Depends(verify_token)
):
    """
    Reorder questions (admin only)
    orders: [{"id": "...", "order": 1}, ...] or [{"questionId": "...", "order": 1}, ...]
    """
    try:
        for item in orders:
            # Support both 'id' and 'questionId' keys
            question_id = item.get("id") or item.get("questionId")
            order = item.get("order", 0)
            
            if question_id and ObjectId.is_valid(question_id):
                await db.questions.update_one(
                    {"_id": ObjectId(question_id)},
                    {"$set": {"order": order}}
                )
        
        return {"success": True, "message": "Questions reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
