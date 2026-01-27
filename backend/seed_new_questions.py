"""
Script untuk membuat sistem pertanyaan: 5 GRATIS + 20 BERBAYAR
Dengan scoring system yang proper untuk mengetahui jati diri seseorang
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ============= 5 PERTANYAAN GRATIS (Preview) =============
free_questions = [
    {
        "category": "personality_preview",
        "question": "Dalam situasi sosial, saya lebih nyaman:",
        "options": [
            {
                "text": "Berbicara dengan banyak orang sekaligus",
                "scores": {
                    "extrovert": 5,
                    "api": 3,
                    "communication": 3
                }
            },
            {
                "text": "Percakapan mendalam dengan 1-2 orang saja",
                "scores": {
                    "introvert": 5,
                    "air": 3,
                    "empati": 3
                }
            },
            {
                "text": "Mengamati dari pinggir sebelum join",
                "scores": {
                    "introvert": 3,
                    "analitik": 3,
                    "investigatif": 2
                }
            }
        ],
        "type": "multiple_choice",
        "isFree": True,
        "order": 1,
        "weight": 1.0
    },
    {
        "category": "personality_preview",
        "question": "Ketika menghadapi masalah besar, saya cenderung:",
        "options": [
            {
                "text": "Segera mengambil tindakan dan deal with it",
                "scores": {
                    "api": 5,
                    "praktis": 4,
                    "enterprising": 3
                }
            },
            {
                "text": "Analisis mendalam sebelum bertindak",
                "scores": {
                    "air": 5,
                    "analitik": 4,
                    "investigatif": 3,
                    "logika": 3
                }
            },
            {
                "text": "Diskusi dengan orang lain untuk input",
                "scores": {
                    "sosial": 5,
                    "angin": 3,
                    "komunikasi": 3
                }
            },
            {
                "text": "Cari solusi kreatif dan out-of-the-box",
                "scores": {
                    "kayu": 5,
                    "artistik": 4,
                    "visual": 3
                }
            }
        ],
        "type": "multiple_choice",
        "isFree": True,
        "order": 2,
        "weight": 1.5
    },
    {
        "category": "personality_preview",
        "question": "Saya paling termotivasi oleh:",
        "options": [
            {
                "text": "Pencapaian dan kemenangan",
                "scores": {
                    "api": 5,
                    "enterprising": 4,
                    "extrovert": 3
                }
            },
            {
                "text": "Pertumbuhan dan pembelajaran baru",
                "scores": {
                    "kayu": 5,
                    "investigatif": 4,
                    "introvert": 2
                }
            },
            {
                "text": "Stabilitas dan keamanan",
                "scores": {
                    "tanah": 5,
                    "konvensional": 4,
                    "praktis": 3
                }
            },
            {
                "text": "Membantu dan memberi dampak untuk orang lain",
                "scores": {
                    "air": 4,
                    "sosial": 5,
                    "empati": 5
                }
            }
        ],
        "type": "multiple_choice",
        "isFree": True,
        "order": 3,
        "weight": 1.5
    },
    {
        "category": "personality_preview",
        "question": "Cara belajar yang paling efektif untuk saya adalah:",
        "options": [
            {
                "text": "Membaca dan menulis",
                "scores": {
                    "introvert": 4,
                    "investigatif": 4,
                    "linguistik": 5
                }
            },
            {
                "text": "Praktik langsung (learning by doing)",
                "scores": {
                    "praktis": 5,
                    "kinestetik": 5,
                    "extrovert": 2
                }
            },
            {
                "text": "Diskusi dan tanya jawab",
                "scores": {
                    "extrovert": 4,
                    "sosial": 4,
                    "komunikasi": 5
                }
            },
            {
                "text": "Visual (gambar, diagram, video)",
                "scores": {
                    "artistik": 4,
                    "visual": 5,
                    "introvert": 2
                }
            }
        ],
        "type": "multiple_choice",
        "isFree": True,
        "order": 4,
        "weight": 1.2
    },
    {
        "category": "personality_preview",
        "question": "Dalam tim, peran saya biasanya:",
        "options": [
            {
                "text": "Pemimpin yang membuat keputusan",
                "scores": {
                    "api": 5,
                    "enterprising": 5,
                    "extrovert": 4
                }
            },
            {
                "text": "Pemikir strategis dan problem solver",
                "scores": {
                    "air": 5,
                    "analitik": 5,
                    "logika": 4,
                    "introvert": 3
                }
            },
            {
                "text": "Penghubung yang menjaga harmoni",
                "scores": {
                    "angin": 4,
                    "sosial": 5,
                    "empati": 5,
                    "extrovert": 3
                }
            },
            {
                "text": "Executor yang menyelesaikan tugas",
                "scores": {
                    "tanah": 5,
                    "praktis": 5,
                    "konvensional": 4
                }
            },
            {
                "text": "Kreator ide dan innovator",
                "scores": {
                    "kayu": 5,
                    "artistik": 5,
                    "visual": 3
                }
            }
        ],
        "type": "multiple_choice",
        "isFree": True,
        "order": 5,
        "weight": 2.0
    }
]

# ============= 20 PERTANYAAN BERBAYAR (Complete Assessment) =============
paid_questions = [
    # DEEP PERSONALITY (5 questions)
    {
        "category": "deep_personality",
        "question": "Setelah berinteraksi intensif dengan banyak orang seharian, saya merasa:",
        "options": [
            {"text": "Energized dan ingin lebih banyak interaksi", "scores": {"extrovert": 10, "api": 5, "sosial": 5}},
            {"text": "Exhausted dan butuh waktu sendiri untuk recharge", "scores": {"introvert": 10, "air": 5, "investigatif": 3}},
            {"text": "Biasa saja, tergantung kualitas interaksinya", "scores": {"introvert": 5, "extrovert": 5, "empati": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 6,
        "weight": 2.5
    },
    {
        "category": "deep_personality",
        "question": "Ketika stress atau tertekan, saya cenderung:",
        "options": [
            {"text": "Menjadi reaktif dan mudah marah/emosional", "scores": {"api": 8, "extrovert": 5}},
            {"text": "Menarik diri dan overthinking", "scores": {"air": 8, "introvert": 7, "analitik": 5}},
            {"text": "Menjadi kaku dan sulit beradaptasi", "scores": {"tanah": 8, "konvensional": 5}},
            {"text": "Gelisah dan tidak bisa fokus", "scores": {"angin": 8, "extrovert": 4}},
            {"text": "Terlalu idealis dan kecewa dengan realita", "scores": {"kayu": 8, "artistik": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 7,
        "weight": 2.0
    },
    {
        "category": "deep_personality",
        "question": "Cara berkomunikasi saya biasanya:",
        "options": [
            {"text": "To the point, jelas, dan praktis", "scores": {"tanah": 7, "praktis": 6, "komunikasi": 5}},
            {"text": "Ramah, ringan, dan mudah berganti topik", "scores": {"angin": 7, "extrovert": 6, "sosial": 5}},
            {"text": "Tegas, langsung, dan penuh semangat", "scores": {"api": 7, "enterprising": 6, "extrovert": 5}},
            {"text": "Inspiratif dan penuh ide-ide baru", "scores": {"kayu": 7, "artistik": 6, "komunikasi": 5}},
            {"text": "Mendalam, penuh makna, dan thoughtful", "scores": {"air": 7, "introvert": 6, "empati": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 8,
        "weight": 1.8
    },
    {
        "category": "deep_personality",
        "question": "Saya paling produktif ketika bekerja:",
        "options": [
            {"text": "Sendiri tanpa gangguan, fokus penuh", "scores": {"introvert": 8, "investigatif": 6, "logika": 5}},
            {"text": "Dalam tim dengan diskusi aktif", "scores": {"extrovert": 8, "sosial": 6, "komunikasi": 6}},
            {"text": "Mix: solo untuk deep work, kolaborasi untuk brainstorm", "scores": {"introvert": 4, "extrovert": 4, "analitik": 5, "empati": 5}},
            {"text": "Dengan musik atau suasana kreatif", "scores": {"artistik": 7, "musikal": 6, "introvert": 3}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 9,
        "weight": 2.0
    },
    {
        "category": "deep_personality",
        "question": "Circle pertemanan saya:",
        "options": [
            {"text": "Kecil tapi sangat dekat dan dalam", "scores": {"introvert": 8, "air": 6, "empati": 6}},
            {"text": "Luas dengan banyak kenalan dari berbagai circle", "scores": {"extrovert": 8, "angin": 6, "sosial": 6}},
            {"text": "Beberapa teman dekat + network profesional luas", "scores": {"enterprising": 7, "extrovert": 5, "sosial": 5}},
            {"text": "Selective, hanya dengan orang yang satu visi", "scores": {"introvert": 6, "kayu": 5, "investigatif": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 10,
        "weight": 1.5
    },
    
    # INTERESTS (5 questions)
    {
        "category": "interests",
        "question": "Pekerjaan impian saya melibatkan:",
        "options": [
            {"text": "Bekerja dengan data, angka, dan analisis", "scores": {"analitik": 10, "investigatif": 7, "logika": 7}},
            {"text": "Berinteraksi dan membantu banyak orang", "scores": {"sosial": 10, "empati": 7, "komunikasi": 7}},
            {"text": "Membuat atau memperbaiki sesuatu dengan tangan", "scores": {"praktis": 10, "kinestetik": 7, "konvensional": 5}},
            {"text": "Kreativitas, seni, dan ekspresi diri", "scores": {"artistik": 10, "visual": 7, "musikal": 5}},
            {"text": "Memimpin, mengorganisir, mencapai target besar", "scores": {"enterprising": 10, "api": 7, "extrovert": 6}},
            {"text": "Riset, eksplorasi, dan menemukan hal baru", "scores": {"investigatif": 10, "analitik": 7, "introvert": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 11,
        "weight": 3.0
    },
    {
        "category": "interests",
        "question": "Di waktu luang, aktivitas favorit saya:",
        "options": [
            {"text": "Puzzle, sudoku, games strategi", "scores": {"analitik": 8, "logika": 7, "investigatif": 5}},
            {"text": "Volunteering atau kegiatan sosial", "scores": {"sosial": 8, "empati": 7, "air": 5}},
            {"text": "DIY projects, berkebun, olahraga", "scores": {"praktis": 8, "kinestetik": 7, "tanah": 5}},
            {"text": "Menggambar, musik, atau aktivitas kreatif", "scores": {"artistik": 8, "visual": 7, "musikal": 6}},
            {"text": "Networking atau mengembangkan side hustle", "scores": {"enterprising": 8, "api": 6, "extrovert": 6}},
            {"text": "Membaca buku atau nonton dokumenter edukatif", "scores": {"investigatif": 8, "analitik": 6, "introvert": 6}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 12,
        "weight": 2.0
    },
    {
        "category": "interests",
        "question": "Mata pelajaran yang paling saya nikmati di sekolah:",
        "options": [
            {"text": "Matematika atau Fisika", "scores": {"analitik": 8, "logika": 8, "investigatif": 5}},
            {"text": "Bahasa atau Sosiologi", "scores": {"sosial": 7, "komunikasi": 7, "empati": 6}},
            {"text": "Olahraga atau Prakarya", "scores": {"praktis": 8, "kinestetik": 8}},
            {"text": "Seni atau Musik", "scores": {"artistik": 9, "visual": 7, "musikal": 7}},
            {"text": "Ekonomi atau Kewirausahaan", "scores": {"enterprising": 8, "analitik": 5}},
            {"text": "Biologi atau Kimia (sains eksplorasi)", "scores": {"investigatif": 9, "analitik": 6}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 13,
        "weight": 1.8
    },
    {
        "category": "interests",
        "question": "Saya merasa paling puas ketika:",
        "options": [
            {"text": "Menyelesaikan masalah rumit yang orang lain tidak bisa", "scores": {"analitik": 9, "logika": 8, "investigatif": 7}},
            {"text": "Melihat orang lain happy karena bantuan saya", "scores": {"sosial": 9, "empati": 9, "air": 6}},
            {"text": "Membuat sesuatu yang berfungsi dengan baik", "scores": {"praktis": 9, "kinestetik": 7}},
            {"text": "Menciptakan karya yang indah atau unik", "scores": {"artistik": 9, "visual": 8, "kayu": 6}},
            {"text": "Mencapai target atau memenangkan kompetisi", "scores": {"enterprising": 9, "api": 8}},
            {"text": "Menemukan sesuatu yang baru atau breakthrough", "scores": {"investigatif": 9, "analitik": 7}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 14,
        "weight": 2.5
    },
    {
        "category": "interests",
        "question": "Lingkungan kerja ideal saya:",
        "options": [
            {"text": "Office terstruktur dengan sistem jelas", "scores": {"konvensional": 8, "analitik": 6, "tanah": 6}},
            {"text": "Tempat dengan banyak interaksi dan kolaborasi", "scores": {"sosial": 8, "extrovert": 7, "angin": 6}},
            {"text": "Workshop, lapangan, atau hands-on environment", "scores": {"praktis": 8, "kinestetik": 8}},
            {"text": "Studio kreatif yang inspiratif", "scores": {"artistik": 8, "visual": 7, "kayu": 6}},
            {"text": "Dinamis, kompetitif, fast-paced", "scores": {"enterprising": 8, "api": 7, "extrovert": 6}},
            {"text": "Lab atau space untuk riset dan eksperimen", "scores": {"investigatif": 8, "analitik": 7}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 15,
        "weight": 2.2
    },
    
    # TALENTS/ABILITIES (5 questions)
    {
        "category": "talents",
        "question": "Orang-orang sering memuji saya karena kemampuan:",
        "options": [
            {"text": "Berbicara di depan umum dan storytelling", "scores": {"komunikasi": 10, "extrovert": 7, "sosial": 6}},
            {"text": "Memahami perasaan orang lain dengan akurat", "scores": {"empati": 10, "air": 7, "sosial": 7}},
            {"text": "Koordinasi fisik dan kemampuan olahraga/dance", "scores": {"kinestetik": 10, "praktis": 6}},
            {"text": "Berpikir logis dan memecahkan masalah kompleks", "scores": {"logika": 10, "analitik": 8, "investigatif": 6}},
            {"text": "Sense of music, rhythm, atau ear for sound", "scores": {"musikal": 10, "artistik": 7}},
            {"text": "Visualisasi, design, dan spatial awareness", "scores": {"visual": 10, "artistik": 8}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 16,
        "weight": 3.0
    },
    {
        "category": "talents",
        "question": "Saya belajar paling cepat melalui:",
        "options": [
            {"text": "Mendengarkan penjelasan dan diskusi", "scores": {"komunikasi": 8, "sosial": 6, "extrovert": 5}},
            {"text": "Merasakan emosi dan pengalaman langsung", "scores": {"empati": 8, "air": 7, "kinestetik": 5}},
            {"text": "Praktik langsung dan trial-error", "scores": {"kinestetik": 9, "praktis": 8}},
            {"text": "Membaca, menulis, dan menganalisis teks", "scores": {"logika": 8, "analitik": 7, "introvert": 6}},
            {"text": "Pattern suara, rhythm, atau musik", "scores": {"musikal": 9, "artistik": 6}},
            {"text": "Diagram, gambar, dan visualisasi", "scores": {"visual": 9, "artistik": 7}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 17,
        "weight": 2.5
    },
    {
        "category": "talents",
        "question": "Ketika menjelaskan sesuatu ke orang lain, saya cenderung:",
        "options": [
            {"text": "Gunakan kata-kata yang jelas dan terstruktur", "scores": {"komunikasi": 9, "analitik": 6}},
            {"text": "Gunakan analogi emosional atau cerita personal", "scores": {"empati": 9, "sosial": 7}},
            {"text": "Demonstrasi langsung atau dengan gesture", "scores": {"kinestetik": 9, "praktis": 7}},
            {"text": "Gunakan logika step-by-step sistematis", "scores": {"logika": 9, "analitik": 8}},
            {"text": "Gunakan analogi suara atau rhythm", "scores": {"musikal": 8, "komunikasi": 6}},
            {"text": "Menggambar, sketsa, atau buat diagram", "scores": {"visual": 9, "artistik": 7}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 18,
        "weight": 2.0
    },
    {
        "category": "talents",
        "question": "Hobi atau skill yang saya kuasai dengan cepat:",
        "options": [
            {"text": "Public speaking, debat, atau writing", "scores": {"komunikasi": 9, "extrovert": 6}},
            {"text": "Konseling, mediasi, atau membantu orang", "scores": {"empati": 9, "sosial": 8}},
            {"text": "Olahraga, dance, atau aktivitas fisik", "scores": {"kinestetik": 10, "praktis": 7}},
            {"text": "Chess, programming, atau complex problem solving", "scores": {"logika": 10, "analitik": 9}},
            {"text": "Bermain alat musik atau bernyanyi", "scores": {"musikal": 10, "artistik": 7}},
            {"text": "Fotografi, design, atau seni visual", "scores": {"visual": 10, "artistik": 9}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 19,
        "weight": 2.5
    },
    {
        "category": "talents",
        "question": "Kekuatan utama saya dalam tim adalah:",
        "options": [
            {"text": "Menyampaikan ide dengan jelas dan convincing", "scores": {"komunikasi": 9, "extrovert": 7}},
            {"text": "Memahami dinamika dan menjaga harmoni tim", "scores": {"empati": 9, "sosial": 8, "air": 6}},
            {"text": "Mengeksekusi tugas praktis dengan excellent", "scores": {"praktis": 9, "kinestetik": 7, "tanah": 6}},
            {"text": "Menganalisis masalah dan menemukan solusi terbaik", "scores": {"logika": 9, "analitik": 9, "investigatif": 7}},
            {"text": "Membuat presentasi atau content yang engaging", "scores": {"komunikasi": 8, "visual": 7, "artistik": 7}},
            {"text": "Membuat visualisasi atau design untuk clarity", "scores": {"visual": 9, "artistik": 8}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 20,
        "weight": 2.0
    },
    
    # VALUES & MOTIVATION (5 questions)
    {
        "category": "values",
        "question": "Yang paling penting bagi saya dalam hidup:",
        "options": [
            {"text": "Kebebasan dan fleksibilitas", "scores": {"angin": 8, "kayu": 7, "artistik": 6}},
            {"text": "Stabilitas dan keamanan finansial", "scores": {"tanah": 9, "konvensional": 7}},
            {"text": "Membuat impact dan membantu banyak orang", "scores": {"sosial": 9, "empati": 8, "air": 7}},
            {"text": "Pencapaian dan pengakuan", "scores": {"api": 8, "enterprising": 8, "extrovert": 6}},
            {"text": "Pertumbuhan personal dan wisdom", "scores": {"air": 8, "investigatif": 7, "introvert": 6}},
            {"text": "Kreativitas dan self-expression", "scores": {"kayu": 8, "artistik": 9}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 21,
        "weight": 3.0
    },
    {
        "category": "values",
        "question": "Dalam mengambil keputusan besar, saya lebih mengandalkan:",
        "options": [
            {"text": "Data, fakta, dan analisis objektif", "scores": {"analitik": 9, "logika": 8, "tanah": 5}},
            {"text": "Intuisi dan gut feeling", "scores": {"air": 8, "empati": 7, "introvert": 5}},
            {"text": "Pertimbangan dampak pada orang lain", "scores": {"empati": 9, "sosial": 8, "air": 7}},
            {"text": "Risk-reward ratio dan potential gains", "scores": {"enterprising": 8, "api": 7, "analitik": 5}},
            {"text": "Visi jangka panjang dan nilai-nilai personal", "scores": {"kayu": 8, "investigatif": 6, "introvert": 5}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 22,
        "weight": 2.5
    },
    {
        "category": "values",
        "question": "Work-life balance saya:",
        "options": [
            {"text": "Work IS life - saya passionate dengan pekerjaan", "scores": {"api": 7, "enterprising": 8, "kayu": 6}},
            {"text": "Balance ketat - butuh time untuk recharge", "scores": {"introvert": 7, "air": 6, "tanah": 5}},
            {"text": "Flexible - tergantung project dan mood", "scores": {"angin": 7, "artistik": 6, "extrovert": 4}},
            {"text": "Prioritas life - work hanya means to an end", "scores": {"tanah": 7, "konvensional": 6}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 23,
        "weight": 2.0
    },
    {
        "category": "values",
        "question": "Definisi sukses bagi saya adalah:",
        "options": [
            {"text": "Financial freedom dan wealth", "scores": {"enterprising": 9, "api": 7, "tanah": 5}},
            {"text": "Making a difference di dunia", "scores": {"sosial": 9, "empati": 8, "air": 7}},
            {"text": "Expertise dan mastery di bidang saya", "scores": {"investigatif": 9, "analitik": 8, "introvert": 6}},
            {"text": "Kreativitas dan legacy yang lasting", "scores": {"artistik": 9, "kayu": 8, "visual": 6}},
            {"text": "Power, influence, dan leadership", "scores": {"api": 9, "enterprising": 9, "extrovert": 7}},
            {"text": "Inner peace dan self-actualization", "scores": {"air": 9, "introvert": 7, "empati": 6}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 24,
        "weight": 3.0
    },
    {
        "category": "values",
        "question": "Ketika menghadapi kegagalan, saya:",
        "options": [
            {"text": "Bangkit cepat dan try again dengan strategi baru", "scores": {"api": 8, "enterprising": 7, "extrovert": 6}},
            {"text": "Reflect mendalam untuk understand lesson-nya", "scores": {"air": 9, "introvert": 7, "empati": 6}},
            {"text": "Analisis apa yang salah secara sistematis", "scores": {"analitik": 9, "logika": 8, "investigatif": 7}},
            {"text": "Express emosi dulu, baru move on", "scores": {"empati": 8, "artistik": 7, "extrovert": 5}},
            {"text": "Butuh waktu untuk stabilize sebelum next step", "scores": {"tanah": 8, "introvert": 6}}
        ],
        "type": "multiple_choice",
        "isFree": False,
        "order": 25,
        "weight": 2.5
    }
]

async def seed_new_questions():
    """Seed new question system: 5 free + 20 paid"""
    try:
        print("🌱 Creating NEW question system: 5 FREE + 20 PAID...")
        
        # Clear existing questions
        await db.questions.delete_many({})
        print("🗑️  Cleared old questions")
        
        # Insert free questions
        if free_questions:
            result = await db.questions.insert_many(free_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} FREE questions")
        
        # Insert paid questions
        if paid_questions:
            result = await db.questions.insert_many(paid_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} PAID questions")
        
        # Verify total
        total_free = await db.questions.count_documents({"isFree": True})
        total_paid = await db.questions.count_documents({"isFree": False})
        total = await db.questions.count_documents({})
        
        print(f"\n✨ Question Summary:")
        print(f"  - FREE questions: {total_free}")
        print(f"  - PAID questions: {total_paid}")
        print(f"  - TOTAL questions: {total}")
        
        # Show categories
        categories = await db.questions.distinct("category")
        print(f"\n📊 Categories:")
        for cat in categories:
            count = await db.questions.count_documents({"category": cat})
            is_free = await db.questions.count_documents({"category": cat, "isFree": True})
            is_paid = await db.questions.count_documents({"category": cat, "isFree": False})
            print(f"  - {cat}: {count} total ({is_free} free, {is_paid} paid)")
        
        print("\n🎉 Question system created successfully!")
        print("\n💡 Scoring Dimensions:")
        print("  PERSONALITY: introvert, extrovert")
        print("  5 ELEMENTS: kayu, api, tanah, angin, air")
        print("  INTERESTS: analitik, sosial, praktis, artistik, enterprising, investigatif, konvensional")
        print("  TALENTS: komunikasi, empati, kinestetik, logika, musikal, visual")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_new_questions())
