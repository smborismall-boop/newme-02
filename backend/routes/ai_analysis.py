from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict
from pydantic import BaseModel
from database import get_db
from routes.auth import get_current_user
from datetime import datetime
import os
import logging
import uuid

router = APIRouter(prefix="/api/ai-analysis", tags=["ai-analysis"])
db = get_db()
logger = logging.getLogger(__name__)

# Initialize AI Chat
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

class TestAnswer(BaseModel):
    questionId: str
    questionText: str
    category: str
    answer: str
    score: Optional[int] = 0

class AIAnalysisRequest(BaseModel):
    testType: str  # "free" or "paid"
    answers: List[TestAnswer]
    categoryScores: Dict[str, Dict[str, int]]  # {"personality": {"score": 10, "max": 20}}
    totalScore: int
    maxScore: int
    percentage: int

class AIAnalysisResponse(BaseModel):
    success: bool
    analysis: Dict
    personalityType: str
    strengths: List[str]
    areasToImprove: List[str]
    careerRecommendations: List[str]
    tips: List[str]
    summary: str

@router.post("/analyze", response_model=dict)
async def analyze_test_results(
    request: AIAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    AI-powered analysis of personality test results.
    Provides personalized insights based on user's answers.
    Free test limited to 1 attempt per user.
    """
    try:
        user_id = str(current_user["_id"])
        
        # Check if free test already used (limit 1 per user)
        if request.testType == "free":
            existing_free_test = await db.ai_analyses.find_one({
                "userId": user_id,
                "testType": "free"
            })
            if existing_free_test:
                return {
                    "success": False,
                    "error": "free_test_used",
                    "message": "Anda sudah menggunakan kesempatan test gratis. Silakan upgrade ke Test Premium untuk analisis lebih lanjut."
                }
        
        if not EMERGENT_LLM_KEY:
            # Fallback to rule-based analysis if no AI key
            return generate_fallback_analysis(request)
        
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        # Create session ID for this analysis
        session_id = f"analysis-{current_user['_id']}-{uuid.uuid4().hex[:8]}"
        
        # Prepare detailed prompt
        user_name = current_user.get("fullName", "Pengguna")
        
        # Format answers for AI
        answers_text = ""
        for ans in request.answers:
            answers_text += f"- Kategori: {ans.category}\n  Pertanyaan: {ans.questionText}\n  Jawaban: {ans.answer}\n  Skor: {ans.score}\n\n"
        
        # Format category scores
        category_text = ""
        for cat, scores in request.categoryScores.items():
            pct = (scores['score'] / scores['max'] * 100) if scores['max'] > 0 else 0
            category_text += f"- {cat}: {scores['score']}/{scores['max']} ({pct:.0f}%)\n"
        
        system_message = """Anda adalah psikolog ahli dan konsultan pengembangan bakat dari NEWME CLASS Indonesia. 
Tugas Anda adalah menganalisis hasil test kepribadian dan bakat dengan metodologi 5 ELEMENT (KAYU, API, TANAH, ANGIN, AIR) dan kepribadian (INTROVERT/EXTROVERT/AMBIVERT).

Pedoman analisis:
1. Mendukung dan memotivasi pengguna
2. Praktis dan bisa diterapkan dalam kehidupan sehari-hari
3. Spesifik untuk konteks Indonesia
4. Menggunakan bahasa Indonesia yang baik dan friendly
5. Berikan persentase untuk setiap elemen berdasarkan jawaban

Sistem 5 ELEMENT:
- KAYU (SI KREATIF): Inovatif, visioner, artistik
- API (SI PERASA): Passionate, energik, ekspresif
- TANAH (SI STABIL): Konsisten, praktis, dapat diandalkan
- ANGIN (SI SOSIAL): Adaptif, komunikatif, fleksibel
- AIR (SI ADAPTIF): Bijaksana, intuitif, reflektif

Format jawaban dalam JSON yang valid:
{
    "personalityType": "AMBIVERT/INTROVERT/EXTROVERT",
    "dominantType": "string - tipe dominan seperti 'DOMINAN', 'KREATIF', 'SOSIAL', dll",
    "elementScores": {
        "AIR": {"percentage": 0-100, "label": "SI ADAPTIF"},
        "KAYU": {"percentage": 0-100, "label": "SI KREATIF"},
        "API": {"percentage": 0-100, "label": "SI PERASA"},
        "TANAH": {"percentage": 0-100, "label": "SI STABIL"},
        "ANGIN": {"percentage": 0-100, "label": "SI SOSIAL"}
    },
    "dominantElement": "AIR/KAYU/API/TANAH/ANGIN",
    "summary": "string - ringkasan 2-3 kalimat tentang kepribadian pengguna",
    "kepribadian": ["array of 6-8 trait kepribadian utama seperti: Mudah Responsif, Sangat Investigatif, dll"],
    "ciriKhas": ["array of 5-7 ciri khas seperti: Penampil, Entertainer, Kulineran, dll"],
    "karakter": ["array of 5-7 karakter seperti: Pengamat, Performer, Investigator, dll"],
    "kekuatanJatidiri": {
        "kehidupan": "string - kekuatan utama dalam kehidupan",
        "kesehatan": "string - organ kesehatan terkait",
        "kontribusi": "string - cara berkontribusi",
        "kekhasan": "string - kekhasan unik",
        "kharisma": "string - bentuk kharisma"
    },
    "kompilasiAdaptasi": ["array of 10-15 poin adaptasi praktis"],
    "strengths": ["array of 4-5 kekuatan utama"],
    "areasToImprove": ["array of 3-4 area yang bisa ditingkatkan"],
    "careerRecommendations": ["array of 5-6 rekomendasi karir yang cocok"],
    "tips": ["array of 4-5 tips pengembangan diri yang praktis"],
    "detailedAnalysis": {
        "personality": "analisis kepribadian 2-3 paragraf",
        "talent": "analisis bakat dan potensi 2-3 paragraf",
        "motivation": "pesan motivasi personal 1-2 paragraf"
    }
}"""

        user_prompt = f"""Analisis hasil test kepribadian untuk {user_name}:

**Jenis Test:** {request.testType.upper()}
**Skor Total:** {request.totalScore}/{request.maxScore} ({request.percentage}%)

**Skor per Kategori:**
{category_text}

**Detail Jawaban:**
{answers_text}

Berdasarkan data di atas, berikan analisis mendalam tentang kepribadian, bakat, dan potensi pengguna ini. Sertakan rekomendasi karir yang spesifik dan tips praktis yang bisa langsung diterapkan.

Penting: Jawab dalam format JSON yang valid seperti yang diminta di system message."""

        # Initialize AI Chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
        
        # Send message
        user_message = UserMessage(text=user_prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        try:
            # Clean response - remove markdown code blocks if present
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            ai_result = json.loads(response_text.strip())
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI response: {response}")
            return generate_fallback_analysis(request)
        
        # Store analysis result
        analysis_doc = {
            "userId": str(current_user["_id"]),
            "userEmail": current_user["email"],
            "userName": current_user["fullName"],
            "testType": request.testType,
            "totalScore": request.totalScore,
            "maxScore": request.maxScore,
            "percentage": request.percentage,
            "categoryScores": request.categoryScores,
            "aiAnalysis": ai_result,
            "createdAt": datetime.utcnow()
        }
        
        await db.ai_analyses.insert_one(analysis_doc)
        
        # Update user with latest analysis
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "lastAnalysis": ai_result,
                "lastAnalysisDate": datetime.utcnow(),
                f"{request.testType}TestStatus": "completed"
            }}
        )
        
        return {
            "success": True,
            "analysis": ai_result.get("detailedAnalysis", {}),
            "personalityType": ai_result.get("personalityType", "AMBIVERT"),
            "dominantType": ai_result.get("dominantType", "DOMINAN"),
            "elementScores": ai_result.get("elementScores", {}),
            "dominantElement": ai_result.get("dominantElement", "AIR"),
            "kepribadian": ai_result.get("kepribadian", []),
            "ciriKhas": ai_result.get("ciriKhas", []),
            "karakter": ai_result.get("karakter", []),
            "kekuatanJatidiri": ai_result.get("kekuatanJatidiri", {}),
            "kompilasiAdaptasi": ai_result.get("kompilasiAdaptasi", []),
            "strengths": ai_result.get("strengths", []),
            "areasToImprove": ai_result.get("areasToImprove", []),
            "careerRecommendations": ai_result.get("careerRecommendations", []),
            "tips": ai_result.get("tips", []),
            "summary": ai_result.get("summary", "")
        }
        
    except Exception as e:
        logger.error(f"AI Analysis error: {str(e)}")
        return generate_fallback_analysis(request)

def generate_fallback_analysis(request: AIAnalysisRequest) -> dict:
    """Generate rule-based analysis when AI is unavailable"""
    
    percentage = request.percentage
    
    # Determine personality type based on category scores
    dominant_category = None
    max_pct = 0
    for cat, scores in request.categoryScores.items():
        pct = (scores['score'] / scores['max'] * 100) if scores['max'] > 0 else 0
        if pct > max_pct:
            max_pct = pct
            dominant_category = cat
    
    # Generate analysis based on score ranges
    if percentage >= 80:
        personality_type = "Sangat Potensial"
        summary = "Anda menunjukkan potensi yang luar biasa! Kemampuan dan bakat Anda sangat menonjol di berbagai area."
        strengths = [
            "Kemampuan analitis yang kuat",
            "Motivasi tinggi untuk berkembang",
            "Kemampuan komunikasi yang baik",
            "Kreativitas yang menonjol",
            "Kepemimpinan alami"
        ]
    elif percentage >= 60:
        personality_type = "Berkembang Baik"
        summary = "Anda memiliki fondasi yang kuat untuk berkembang. Dengan fokus pada area tertentu, potensi Anda bisa dimaksimalkan."
        strengths = [
            "Kemampuan belajar yang baik",
            "Ketekunan dalam bekerja",
            "Kemampuan adaptasi",
            "Kerjasama tim yang baik"
        ]
    elif percentage >= 40:
        personality_type = "Penuh Potensi"
        summary = "Anda memiliki potensi tersembunyi yang bisa dikembangkan. Dengan bimbingan yang tepat, Anda bisa mencapai prestasi yang luar biasa."
        strengths = [
            "Kemauan untuk belajar",
            "Fleksibilitas",
            "Kemampuan mendengarkan"
        ]
    else:
        personality_type = "Unik"
        summary = "Setiap orang memiliki keunikan masing-masing. Mari fokus menemukan dan mengembangkan bakat tersembunyi Anda."
        strengths = [
            "Keunikan perspektif",
            "Potensi yang belum tereksplor"
        ]
    
    # Career recommendations based on dominant category
    career_map = {
        "personality": ["Konsultan", "Psikolog", "HR Manager", "Life Coach", "Trainer"],
        "talent": ["Entrepreneur", "Creative Director", "Product Manager", "Researcher", "Innovator"],
        "skills": ["Software Engineer", "Data Analyst", "Project Manager", "Technical Writer", "Specialist"],
        "interest": ["Content Creator", "Marketing", "Community Manager", "Event Planner", "Influencer"]
    }
    
    careers = career_map.get(dominant_category, [
        "Entrepreneur",
        "Konsultan",
        "Manager",
        "Specialist",
        "Creative Professional"
    ])
    
    return {
        "success": True,
        "analysis": {
            "personality": f"Berdasarkan hasil test, Anda menunjukkan karakteristik {personality_type.lower()}. Kategori {dominant_category or 'umum'} menjadi kekuatan utama Anda dengan skor {max_pct:.0f}%.",
            "talent": f"Bakat Anda terlihat di area {dominant_category or 'berbagai bidang'}. Dengan skor {percentage}%, Anda memiliki fondasi yang baik untuk dikembangkan lebih lanjut.",
            "motivation": "Teruslah belajar dan berkembang! Setiap langkah kecil membawa Anda lebih dekat ke tujuan. Ingat, perjalanan ribuan mil dimulai dengan satu langkah."
        },
        "personalityType": personality_type,
        "strengths": strengths,
        "areasToImprove": [
            "Konsistensi dalam belajar",
            "Manajemen waktu",
            "Pengembangan skill spesifik",
            "Networking dan kolaborasi"
        ],
        "careerRecommendations": careers,
        "tips": [
            "Luangkan 30 menit sehari untuk belajar hal baru",
            "Bergabung dengan komunitas yang sesuai minat",
            "Praktikkan skill yang ingin dikembangkan secara rutin",
            "Cari mentor atau role model di bidang yang diminati",
            "Jaga keseimbangan antara kerja dan istirahat"
        ],
        "summary": summary
    }

@router.get("/my-analyses", response_model=List[dict])
async def get_my_analyses(current_user: dict = Depends(get_current_user)):
    """Get user's analysis history"""
    try:
        cursor = db.ai_analyses.find(
            {"userId": str(current_user["_id"])},
            {"_id": 0}
        ).sort("createdAt", -1).limit(10)
        
        analyses = await cursor.to_list(length=10)
        return analyses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.get("/latest", response_model=dict)
async def get_latest_analysis(current_user: dict = Depends(get_current_user)):
    """Get user's latest analysis"""
    try:
        analysis = await db.ai_analyses.find_one(
            {"userId": str(current_user["_id"])},
            {"_id": 0},
            sort=[("createdAt", -1)]
        )
        
        if not analysis:
            return {"success": False, "message": "Belum ada hasil analisis"}
        
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
