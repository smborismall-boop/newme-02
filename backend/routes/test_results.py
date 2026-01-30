from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
from database import get_db
from routes.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/api/test-results", tags=["test-results"])
db = get_db()


class TestResultSubmission(BaseModel):
    userId: str
    testType: str  # 'free' or 'paid'
    results: dict
    answers: dict


class CategoryScore(BaseModel):
    category: str
    score: int
    maxScore: int
    percentage: float


@router.post("")
async def save_test_result(submission: TestResultSubmission):
    """Save test results after user completes a test"""
    try:
        # Generate analysis based on answers
        analysis = await generate_test_analysis(submission.answers, submission.testType)
        
        result_data = {
            "userId": submission.userId,
            "testType": submission.testType,
            "totalScore": submission.results.get("totalScore", 0),
            "categories": submission.results.get("categories", {}),
            "answeredCount": submission.results.get("answeredCount", 0),
            "totalQuestions": submission.results.get("totalQuestions", 0),
            "answers": submission.answers,
            "analysis": analysis,
            "completedAt": datetime.utcnow(),
            "createdAt": datetime.utcnow()
        }
        
        result = await db.test_results.insert_one(result_data)
        
        return {
            "success": True,
            "resultId": str(result.inserted_id),
            "message": "Hasil test berhasil disimpan",
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


async def generate_test_analysis(answers: dict, test_type: str) -> dict:
    """Generate personality analysis based on answers"""
    
    # Calculate category scores
    category_totals = {}
    category_counts = {}
    
    for question_id, answer_value in answers.items():
        try:
            question = await db.questions.find_one({"_id": ObjectId(question_id)})
            if question:
                category = question.get("category", "general")
                option = next((o for o in question.get("options", []) if o["value"] == answer_value), None)
                if option:
                    if category not in category_totals:
                        category_totals[category] = 0
                        category_counts[category] = 0
                    category_totals[category] += option.get("score", 0)
                    category_counts[category] += 1
        except:
            continue
    
    # Calculate percentages
    category_analysis = {}
    for cat, total in category_totals.items():
        max_possible = category_counts[cat] * 4  # assuming max score per question is 4
        percentage = (total / max_possible * 100) if max_possible > 0 else 0
        category_analysis[cat] = {
            "score": total,
            "maxScore": max_possible,
            "percentage": round(percentage, 1)
        }
    
    # Determine dominant traits
    dominant_category = max(category_totals.keys(), key=lambda k: category_totals[k]) if category_totals else "general"
    
    # Personality type based on dominant category and scores
    personality_insights = get_personality_insights(category_analysis, dominant_category)
    
    return {
        "categoryAnalysis": category_analysis,
        "dominantCategory": dominant_category,
        "personalityType": personality_insights["type"],
        "strengths": personality_insights["strengths"],
        "areasToImprove": personality_insights["areasToImprove"],
        "careerRecommendations": personality_insights["careerRecommendations"],
        "summary": personality_insights["summary"],
        "testType": test_type
    }


def get_personality_insights(category_analysis: dict, dominant_category: str) -> dict:
    """Get personality insights based on analysis"""
    
    insights = {
        "personality": {
            "type": "Analitis & Reflektif",
            "strengths": [
                "Kemampuan introspeksi yang kuat",
                "Pengambilan keputusan yang matang",
                "Kepekaan terhadap perasaan diri dan orang lain",
                "Kemampuan beradaptasi dengan situasi"
            ],
            "areasToImprove": [
                "Lebih berani mengambil risiko",
                "Meningkatkan kepercayaan diri",
                "Lebih asertif dalam menyampaikan pendapat"
            ],
            "careerRecommendations": [
                "Psikolog atau Konselor",
                "Peneliti atau Analis",
                "Penulis atau Content Creator",
                "Human Resources",
                "Trainer atau Coach"
            ],
            "summary": "Anda memiliki kepribadian yang mendalam dan reflektif. Kemampuan memahami diri sendiri adalah kekuatan utama Anda."
        },
        "talent": {
            "type": "Kreatif & Inovatif",
            "strengths": [
                "Bakat kepemimpinan yang natural",
                "Kemampuan menciptakan ide baru",
                "Skill dalam memecahkan masalah kompleks",
                "Kemampuan memotivasi tim"
            ],
            "areasToImprove": [
                "Lebih sabar dalam proses",
                "Mendengarkan pendapat orang lain",
                "Fokus pada detail"
            ],
            "careerRecommendations": [
                "Entrepreneur atau Founder",
                "Creative Director",
                "Product Manager",
                "Konsultan Bisnis",
                "Marketing Strategist"
            ],
            "summary": "Anda memiliki bakat alami dalam kepemimpinan dan inovasi. Ide-ide kreatif adalah kekuatan utama Anda."
        },
        "skills": {
            "type": "Terorganisir & Sistematis",
            "strengths": [
                "Kemampuan manajemen waktu yang baik",
                "Detail-oriented dan teliti",
                "Konsisten dalam menyelesaikan tugas",
                "Kemampuan komunikasi yang efektif"
            ],
            "areasToImprove": [
                "Lebih fleksibel terhadap perubahan",
                "Berani keluar dari zona nyaman",
                "Lebih spontan dalam situasi tertentu"
            ],
            "careerRecommendations": [
                "Project Manager",
                "Akuntan atau Auditor",
                "Data Analyst",
                "Operations Manager",
                "Quality Assurance"
            ],
            "summary": "Anda memiliki kemampuan organisasi yang luar biasa. Sistematis dan terstruktur adalah ciri khas Anda."
        },
        "interest": {
            "type": "Sosial & Empatik",
            "strengths": [
                "Empati yang tinggi",
                "Kemampuan membangun relasi",
                "Peduli terhadap kesejahteraan orang lain",
                "Kemampuan kolaborasi tim"
            ],
            "areasToImprove": [
                "Lebih tegas dalam mengambil keputusan",
                "Mengelola batasan personal",
                "Fokus pada tujuan pribadi"
            ],
            "careerRecommendations": [
                "Pekerja Sosial",
                "Guru atau Dosen",
                "Customer Success Manager",
                "Community Manager",
                "Healthcare Professional"
            ],
            "summary": "Anda memiliki jiwa sosial yang kuat. Kemampuan memahami dan membantu orang lain adalah kekuatan utama Anda."
        }
    }
    
    return insights.get(dominant_category, insights["personality"])


@router.get("/{result_id}")
async def get_test_result(result_id: str):
    """Get specific test result by ID"""
    try:
        if not ObjectId.is_valid(result_id):
            raise HTTPException(status_code=400, detail="Invalid result ID")
        
        result = await db.test_results.find_one({"_id": ObjectId(result_id)})
        if not result:
            raise HTTPException(status_code=404, detail="Result not found")
        
        result["_id"] = str(result["_id"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/user/{user_id}")
async def get_user_test_results(user_id: str, limit: int = 10):
    """Get all test results for a specific user"""
    try:
        cursor = db.test_results.find({"userId": user_id}).sort("completedAt", -1).limit(limit)
        results = await cursor.to_list(length=limit)
        
        for r in results:
            r["_id"] = str(r["_id"])
        
        return {
            "success": True,
            "count": len(results),
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.get("/latest/{user_id}")
async def get_latest_result(user_id: str, test_type: Optional[str] = None):
    """Get the latest test result for a user"""
    try:
        query = {"userId": user_id}
        if test_type:
            query["testType"] = test_type
        
        result = await db.test_results.find_one(query, sort=[("completedAt", -1)])
        
        if not result:
            raise HTTPException(status_code=404, detail="No test results found")
        
        result["_id"] = str(result["_id"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
