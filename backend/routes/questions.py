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

@router.post("/seed-questions")
async def seed_questions():
    """Seed default questions - 5 free + 25 paid"""
    try:
        # Delete existing questions and re-seed
        await db.questions.delete_many({})
        
        # 5 Free Questions (Pertanyaan Gratis)
        free_questions = [
            {
                "text": "Ketika menghadapi masalah, saya lebih suka:",
                "question": "Ketika menghadapi masalah, saya lebih suka:",
                "category": "personality",
                "options": [
                    {"text": "Menganalisis secara logis dan sistematis", "value": "A", "score": 1},
                    {"text": "Mengikuti intuisi dan perasaan", "value": "B", "score": 2},
                    {"text": "Berdiskusi dengan orang lain", "value": "C", "score": 3},
                    {"text": "Mencoba berbagai solusi langsung", "value": "D", "score": 4}
                ],
                "order": 1,
                "isFree": True,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Dalam situasi sosial, saya cenderung:",
                "question": "Dalam situasi sosial, saya cenderung:",
                "category": "personality",
                "options": [
                    {"text": "Menjadi pusat perhatian dan aktif berbicara", "value": "A", "score": 1},
                    {"text": "Mendengarkan dan mengamati lebih banyak", "value": "B", "score": 2},
                    {"text": "Bergantung pada situasi dan suasana", "value": "C", "score": 3},
                    {"text": "Memilih berinteraksi dengan kelompok kecil", "value": "D", "score": 4}
                ],
                "order": 2,
                "isFree": True,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Saat bekerja dalam tim, peran yang paling cocok untuk saya adalah:",
                "question": "Saat bekerja dalam tim, peran yang paling cocok untuk saya adalah:",
                "category": "talent",
                "options": [
                    {"text": "Pemimpin yang mengarahkan", "value": "A", "score": 1},
                    {"text": "Kreator ide dan inovasi", "value": "B", "score": 2},
                    {"text": "Pelaksana yang detail", "value": "C", "score": 3},
                    {"text": "Mediator yang menjaga harmoni", "value": "D", "score": 4}
                ],
                "order": 3,
                "isFree": True,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Kegiatan yang paling menarik bagi saya adalah:",
                "question": "Kegiatan yang paling menarik bagi saya adalah:",
                "category": "interest",
                "options": [
                    {"text": "Membaca dan mempelajari hal baru", "value": "A", "score": 1},
                    {"text": "Berkreasi dan membuat sesuatu", "value": "B", "score": 2},
                    {"text": "Berolahraga dan aktivitas fisik", "value": "C", "score": 3},
                    {"text": "Bersosialisasi dan membantu orang lain", "value": "D", "score": 4}
                ],
                "order": 4,
                "isFree": True,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Ketika mengambil keputusan penting, saya lebih mengandalkan:",
                "question": "Ketika mengambil keputusan penting, saya lebih mengandalkan:",
                "category": "personality",
                "options": [
                    {"text": "Data dan fakta yang jelas", "value": "A", "score": 1},
                    {"text": "Perasaan dan nilai-nilai personal", "value": "B", "score": 2},
                    {"text": "Saran dari orang yang dipercaya", "value": "C", "score": 3},
                    {"text": "Pengalaman masa lalu", "value": "D", "score": 4}
                ],
                "order": 5,
                "isFree": True,
                "isActive": True,
                "createdAt": datetime.utcnow()
            }
        ]
        
        # 10 Paid Questions (Pertanyaan Berbayar)
        paid_questions = [
            {
                "text": "Bagaimana cara Anda mengelola stres?",
                "question": "Bagaimana cara Anda mengelola stres?",
                "category": "personality",
                "options": [
                    {"text": "Berolahraga atau aktivitas fisik", "value": "A", "score": 1},
                    {"text": "Meditasi atau relaksasi", "value": "B", "score": 2},
                    {"text": "Berbicara dengan orang terdekat", "value": "C", "score": 3},
                    {"text": "Fokus menyelesaikan sumber stres", "value": "D", "score": 4}
                ],
                "order": 6,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Dalam berkomunikasi, saya lebih efektif dengan:",
                "question": "Dalam berkomunikasi, saya lebih efektif dengan:",
                "category": "skills",
                "options": [
                    {"text": "Tulisan yang terstruktur", "value": "A", "score": 1},
                    {"text": "Presentasi visual", "value": "B", "score": 2},
                    {"text": "Diskusi langsung", "value": "C", "score": 3},
                    {"text": "Demonstrasi praktik", "value": "D", "score": 4}
                ],
                "order": 7,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang paling memotivasi Anda dalam bekerja?",
                "question": "Apa yang paling memotivasi Anda dalam bekerja?",
                "category": "interest",
                "options": [
                    {"text": "Pencapaian dan pengakuan", "value": "A", "score": 1},
                    {"text": "Pembelajaran dan pertumbuhan", "value": "B", "score": 2},
                    {"text": "Stabilitas dan keamanan", "value": "C", "score": 3},
                    {"text": "Dampak positif pada orang lain", "value": "D", "score": 4}
                ],
                "order": 8,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda menghadapi perubahan?",
                "question": "Bagaimana Anda menghadapi perubahan?",
                "category": "personality",
                "options": [
                    {"text": "Dengan antusias dan cepat beradaptasi", "value": "A", "score": 1},
                    {"text": "Dengan hati-hati setelah pertimbangan matang", "value": "B", "score": 2},
                    {"text": "Dengan mencari dukungan dari orang lain", "value": "C", "score": 3},
                    {"text": "Dengan fokus pada hal yang bisa dikontrol", "value": "D", "score": 4}
                ],
                "order": 9,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Lingkungan kerja ideal untuk saya adalah:",
                "question": "Lingkungan kerja ideal untuk saya adalah:",
                "category": "interest",
                "options": [
                    {"text": "Dinamis dengan banyak tantangan", "value": "A", "score": 1},
                    {"text": "Terstruktur dan terorganisir", "value": "B", "score": 2},
                    {"text": "Kolaboratif dan suportif", "value": "C", "score": 3},
                    {"text": "Fleksibel dan mandiri", "value": "D", "score": 4}
                ],
                "order": 10,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Kekuatan utama saya adalah:",
                "question": "Kekuatan utama saya adalah:",
                "category": "talent",
                "options": [
                    {"text": "Berpikir analitis dan kritis", "value": "A", "score": 1},
                    {"text": "Kreativitas dan inovasi", "value": "B", "score": 2},
                    {"text": "Empati dan komunikasi", "value": "C", "score": 3},
                    {"text": "Organisasi dan eksekusi", "value": "D", "score": 4}
                ],
                "order": 11,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Ketika belajar hal baru, saya lebih suka:",
                "question": "Ketika belajar hal baru, saya lebih suka:",
                "category": "skills",
                "options": [
                    {"text": "Membaca dan meneliti sendiri", "value": "A", "score": 1},
                    {"text": "Menonton video atau tutorial visual", "value": "B", "score": 2},
                    {"text": "Diskusi dan belajar bersama", "value": "C", "score": 3},
                    {"text": "Langsung praktik dan coba-coba", "value": "D", "score": 4}
                ],
                "order": 12,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang membuat Anda merasa paling puas?",
                "question": "Apa yang membuat Anda merasa paling puas?",
                "category": "interest",
                "options": [
                    {"text": "Menyelesaikan proyek yang menantang", "value": "A", "score": 1},
                    {"text": "Menciptakan sesuatu yang unik", "value": "B", "score": 2},
                    {"text": "Membantu orang lain sukses", "value": "C", "score": 3},
                    {"text": "Mencapai target yang ditetapkan", "value": "D", "score": 4}
                ],
                "order": 13,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda menangani konflik?",
                "question": "Bagaimana Anda menangani konflik?",
                "category": "personality",
                "options": [
                    {"text": "Menghadapi langsung dengan tegas", "value": "A", "score": 1},
                    {"text": "Mencari kompromi yang adil", "value": "B", "score": 2},
                    {"text": "Menghindari dan memberi waktu", "value": "C", "score": 3},
                    {"text": "Mencari mediator atau bantuan", "value": "D", "score": 4}
                ],
                "order": 14,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa tujuan karir jangka panjang Anda?",
                "question": "Apa tujuan karir jangka panjang Anda?",
                "category": "interest",
                "options": [
                    {"text": "Menjadi ahli di bidang tertentu", "value": "A", "score": 1},
                    {"text": "Memimpin tim atau organisasi", "value": "B", "score": 2},
                    {"text": "Memiliki bisnis sendiri", "value": "C", "score": 3},
                    {"text": "Memberikan kontribusi sosial", "value": "D", "score": 4}
                ],
                "order": 15,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            # Additional 15 paid questions (16-30)
            {
                "text": "Bagaimana Anda merespons ketika seseorang mengkritik pekerjaan Anda?",
                "question": "Bagaimana Anda merespons ketika seseorang mengkritik pekerjaan Anda?",
                "category": "personality",
                "options": [
                    {"text": "Menerima dengan terbuka dan memperbaiki", "value": "A", "score": 4},
                    {"text": "Mempertahankan pendapat dengan argumen", "value": "B", "score": 2},
                    {"text": "Merasa tersinggung tapi diam", "value": "C", "score": 1},
                    {"text": "Meminta penjelasan lebih detail", "value": "D", "score": 3}
                ],
                "order": 16,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Ketika Anda memiliki waktu luang, Anda lebih memilih untuk:",
                "question": "Ketika Anda memiliki waktu luang, Anda lebih memilih untuk:",
                "category": "interest",
                "options": [
                    {"text": "Membaca buku atau menonton film", "value": "A", "score": 1},
                    {"text": "Berkumpul dengan teman-teman", "value": "B", "score": 3},
                    {"text": "Melakukan hobi kreatif", "value": "C", "score": 2},
                    {"text": "Beristirahat dan me-time", "value": "D", "score": 4}
                ],
                "order": 17,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana cara Anda mengatur prioritas tugas?",
                "question": "Bagaimana cara Anda mengatur prioritas tugas?",
                "category": "skills",
                "options": [
                    {"text": "Membuat daftar dan mengerjakan dari yang terpenting", "value": "A", "score": 4},
                    {"text": "Mengerjakan yang paling mudah terlebih dahulu", "value": "B", "score": 1},
                    {"text": "Multitasking semua sekaligus", "value": "C", "score": 2},
                    {"text": "Mengikuti deadline yang paling dekat", "value": "D", "score": 3}
                ],
                "order": 18,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang membuat Anda merasa termotivasi untuk bangun pagi?",
                "question": "Apa yang membuat Anda merasa termotivasi untuk bangun pagi?",
                "category": "interest",
                "options": [
                    {"text": "Tujuan dan target yang ingin dicapai", "value": "A", "score": 4},
                    {"text": "Tanggung jawab terhadap keluarga atau pekerjaan", "value": "B", "score": 3},
                    {"text": "Kebiasaan yang sudah terbentuk", "value": "C", "score": 2},
                    {"text": "Rencana menyenangkan di hari itu", "value": "D", "score": 1}
                ],
                "order": 19,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda bereaksi ketika ada perubahan mendadak di tempat kerja?",
                "question": "Bagaimana Anda bereaksi ketika ada perubahan mendadak di tempat kerja?",
                "category": "personality",
                "options": [
                    {"text": "Menyesuaikan dengan cepat dan fleksibel", "value": "A", "score": 4},
                    {"text": "Membutuhkan waktu untuk beradaptasi", "value": "B", "score": 2},
                    {"text": "Mencari informasi sebanyak mungkin", "value": "C", "score": 3},
                    {"text": "Merasa cemas dan khawatir", "value": "D", "score": 1}
                ],
                "order": 20,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa nilai yang paling Anda junjung tinggi dalam hidup?",
                "question": "Apa nilai yang paling Anda junjung tinggi dalam hidup?",
                "category": "personality",
                "options": [
                    {"text": "Kejujuran dan integritas", "value": "A", "score": 4},
                    {"text": "Kesetiaan dan loyalitas", "value": "B", "score": 3},
                    {"text": "Kebebasan dan kemandirian", "value": "C", "score": 2},
                    {"text": "Keharmonisan dan kedamaian", "value": "D", "score": 1}
                ],
                "order": 21,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Ketika menghadapi masalah sulit, apa langkah pertama Anda?",
                "question": "Ketika menghadapi masalah sulit, apa langkah pertama Anda?",
                "category": "skills",
                "options": [
                    {"text": "Menganalisis akar masalahnya", "value": "A", "score": 4},
                    {"text": "Mencari bantuan dari orang lain", "value": "B", "score": 2},
                    {"text": "Mencoba berbagai solusi langsung", "value": "C", "score": 3},
                    {"text": "Memberi waktu untuk memikirkannya", "value": "D", "score": 1}
                ],
                "order": 22,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda mendeskripsikan gaya kepemimpinan Anda?",
                "question": "Bagaimana Anda mendeskripsikan gaya kepemimpinan Anda?",
                "category": "talent",
                "options": [
                    {"text": "Demokratis - melibatkan semua anggota", "value": "A", "score": 4},
                    {"text": "Visioner - memberi arahan jelas", "value": "B", "score": 3},
                    {"text": "Suportif - mendukung dari belakang", "value": "C", "score": 2},
                    {"text": "Delegatif - mempercayakan kepada tim", "value": "D", "score": 1}
                ],
                "order": 23,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang Anda lakukan ketika merasa kewalahan?",
                "question": "Apa yang Anda lakukan ketika merasa kewalahan?",
                "category": "personality",
                "options": [
                    {"text": "Berhenti sejenak dan menenangkan diri", "value": "A", "score": 3},
                    {"text": "Terus bekerja sampai selesai", "value": "B", "score": 2},
                    {"text": "Meminta bantuan atau delegasi", "value": "C", "score": 4},
                    {"text": "Mengalihkan perhatian ke hal lain", "value": "D", "score": 1}
                ],
                "order": 24,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda menangani kegagalan?",
                "question": "Bagaimana Anda menangani kegagalan?",
                "category": "personality",
                "options": [
                    {"text": "Belajar dari kesalahan dan mencoba lagi", "value": "A", "score": 4},
                    {"text": "Menganalisis apa yang salah", "value": "B", "score": 3},
                    {"text": "Merasa kecewa tapi bangkit kembali", "value": "C", "score": 2},
                    {"text": "Menghindari situasi serupa di masa depan", "value": "D", "score": 1}
                ],
                "order": 25,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang Anda cari dalam hubungan pertemanan?",
                "question": "Apa yang Anda cari dalam hubungan pertemanan?",
                "category": "interest",
                "options": [
                    {"text": "Kesetiaan dan kepercayaan", "value": "A", "score": 4},
                    {"text": "Kesamaan minat dan hobi", "value": "B", "score": 2},
                    {"text": "Dukungan emosional", "value": "C", "score": 3},
                    {"text": "Pengalaman seru bersama", "value": "D", "score": 1}
                ],
                "order": 26,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana cara Anda mengekspresikan kreativitas?",
                "question": "Bagaimana cara Anda mengekspresikan kreativitas?",
                "category": "talent",
                "options": [
                    {"text": "Melalui seni visual atau musik", "value": "A", "score": 2},
                    {"text": "Melalui tulisan atau cerita", "value": "B", "score": 3},
                    {"text": "Melalui pemecahan masalah inovatif", "value": "C", "score": 4},
                    {"text": "Melalui fashion atau desain interior", "value": "D", "score": 1}
                ],
                "order": 27,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa sikap Anda terhadap uang dan keuangan?",
                "question": "Apa sikap Anda terhadap uang dan keuangan?",
                "category": "personality",
                "options": [
                    {"text": "Menabung dan merencanakan dengan hati-hati", "value": "A", "score": 4},
                    {"text": "Menikmati hasil kerja keras secara wajar", "value": "B", "score": 3},
                    {"text": "Berinvestasi untuk masa depan", "value": "C", "score": 2},
                    {"text": "Tidak terlalu memikirkan, yang penting cukup", "value": "D", "score": 1}
                ],
                "order": 28,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Bagaimana Anda melihat diri Anda dalam 5 tahun ke depan?",
                "question": "Bagaimana Anda melihat diri Anda dalam 5 tahun ke depan?",
                "category": "interest",
                "options": [
                    {"text": "Mencapai posisi kepemimpinan", "value": "A", "score": 3},
                    {"text": "Memiliki keseimbangan kerja-kehidupan yang baik", "value": "B", "score": 4},
                    {"text": "Membangun bisnis atau proyek sendiri", "value": "C", "score": 2},
                    {"text": "Terus belajar dan berkembang", "value": "D", "score": 1}
                ],
                "order": 29,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            },
            {
                "text": "Apa yang paling Anda banggakan dari diri Anda?",
                "question": "Apa yang paling Anda banggakan dari diri Anda?",
                "category": "talent",
                "options": [
                    {"text": "Kemampuan untuk tetap tenang dalam tekanan", "value": "A", "score": 4},
                    {"text": "Kreativitas dan cara berpikir unik", "value": "B", "score": 2},
                    {"text": "Kemampuan membangun hubungan baik", "value": "C", "score": 3},
                    {"text": "Kegigihan dan tidak mudah menyerah", "value": "D", "score": 1}
                ],
                "order": 30,
                "isFree": False,
                "isActive": True,
                "createdAt": datetime.utcnow()
            }
        ]
        
        # Insert all questions
        all_questions = free_questions + paid_questions
        await db.questions.insert_many(all_questions)
        
        return {
            "message": "Questions seeded successfully",
            "free_count": len(free_questions),
            "paid_count": len(paid_questions),
            "total": len(all_questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.delete("/clear-all")
async def clear_all_questions(token_data: dict = Depends(verify_token)):
    """Clear all questions (admin only) - for re-seeding"""
    try:
        result = await db.questions.delete_many({})
        return {"message": f"Deleted {result.deleted_count} questions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
