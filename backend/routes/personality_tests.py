from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from database import get_db
from routes.admin import verify_token
from datetime import datetime

router = APIRouter(prefix="/api/personality-tests", tags=["personality-tests"])
db = get_db()

# Pydantic Models
class AnswerInput(BaseModel):
    questionId: str
    selectedOption: int

class TestSubmission(BaseModel):
    testType: str  # "introvert_extrovert" or "element_personality"
    answers: List[AnswerInput]

class TestResultResponse(BaseModel):
    result: str
    scores: dict
    description: dict
    personalityType: str

@router.get("/questions/{test_type}")
async def get_test_questions(
    test_type: str,
    include_premium: bool = False
):
    """
    Get test questions by type
    - test_type: "introvert_extrovert" or "element_personality"
    - include_premium: True if user has paid access
    """
    try:
        query = {"testType": test_type}
        
        # If not premium, only return free questions
        if not include_premium:
            query["isPremium"] = False
        
        cursor = db.questions.find(query, {"_id": 0}).sort("order", 1)
        questions = await cursor.to_list(length=100)
        
        # Format questions for frontend
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                "id": q["id"],
                "question": q["question"],
                "options": q["options"],
                "order": q["order"],
                "isPremium": q["isPremium"]
            })
        
        return {
            "success": True,
            "testType": test_type,
            "totalQuestions": len(formatted_questions),
            "freeQuestions": sum(1 for q in formatted_questions if not q["isPremium"]),
            "premiumQuestions": sum(1 for q in formatted_questions if q["isPremium"]),
            "questions": formatted_questions
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/submit")
async def submit_test(submission: TestSubmission):
    """
    Submit test answers and calculate personality type
    """
    try:
        # Get all questions with scoring info
        cursor = db.questions.find(
            {"testType": submission.testType},
            {"_id": 0, "id": 1, "scoring": 1}
        )
        questions = await cursor.to_list(length=100)
        
        # Create a map of question ID to scoring
        scoring_map = {q["id"]: q["scoring"] for q in questions}
        
        # Calculate scores
        scores = {}
        
        for answer in submission.answers:
            question_id = answer.questionId
            selected_option = answer.selectedOption
            
            if question_id not in scoring_map:
                continue
            
            # Get the scoring for the selected option
            option_scoring = scoring_map[question_id][selected_option]
            
            # Add scores to the respective personality types
            for personality_type, score_value in option_scoring.get("score", {}).items():
                if personality_type not in scores:
                    scores[personality_type] = 0
                scores[personality_type] += score_value
        
        # Determine the result (highest score)
        if not scores:
            raise HTTPException(status_code=400, detail="No valid answers provided")
        
        result_type = max(scores, key=scores.get)
        
        # Get personality description
        description_doc = await db.personality_descriptions.find_one(
            {"personalityType": result_type},
            {"_id": 0}
        )
        
        if not description_doc:
            raise HTTPException(status_code=404, detail="Personality description not found")
        
        # Save test result to user's history (if authenticated)
        result_data = {
            "testType": submission.testType,
            "result": result_type,
            "scores": scores,
            "completedAt": datetime.utcnow(),
            "totalQuestions": len(submission.answers)
        }
        
        return {
            "success": True,
            "result": result_type,
            "scores": scores,
            "description": description_doc["data"],
            "personalityType": result_type,
            "testType": submission.testType
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/descriptions/{personality_type}")
async def get_personality_description(personality_type: str):
    """
    Get detailed description for a specific personality type
    """
    try:
        description = await db.personality_descriptions.find_one(
            {"personalityType": personality_type},
            {"_id": 0}
        )
        
        if not description:
            raise HTTPException(status_code=404, detail="Personality type not found")
        
        return {
            "success": True,
            "personalityType": personality_type,
            "data": description["data"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/my-results")
async def get_my_test_results(token_data: dict = Depends(verify_token)):
    """
    Get user's test history (requires authentication)
    """
    try:
        user_email = token_data.get("sub")
        
        # Get user's test results
        cursor = db.test_results.find(
            {"userEmail": user_email},
            {"_id": 0}
        ).sort("completedAt", -1)
        
        results = await cursor.to_list(length=100)
        
        return {
            "success": True,
            "totalTests": len(results),
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/stats")
async def get_test_statistics():
    """
    Get overall test statistics (public)
    """
    try:
        # Count total tests taken
        total_tests = await db.test_results.count_documents({})
        
        # Count by test type
        ie_tests = await db.test_results.count_documents({"testType": "introvert_extrovert"})
        element_tests = await db.test_results.count_documents({"testType": "element_personality"})
        
        # Count by personality type
        personality_distribution = {}
        
        # Aggregate results
        pipeline = [
            {"$group": {"_id": "$result", "count": {"$sum": 1}}}
        ]
        
        cursor = db.test_results.aggregate(pipeline)
        async for doc in cursor:
            personality_distribution[doc["_id"]] = doc["count"]
        
        return {
            "success": True,
            "totalTests": total_tests,
            "introvertExtrovertTests": ie_tests,
            "elementPersonalityTests": element_tests,
            "personalityDistribution": personality_distribution
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
