"""
Script untuk membuat soal-soal test kepribadian NEWME CLASS
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# ============= TEST ELEMENT (5 Element) =============
element_questions = [
    {
        "category": "element",
        "question": "Ketika menghadapi masalah, saya cenderung:",
        "options": [
            {"text": "Menganalisis secara detail dan mencari solusi logis", "score": {"air": 3}},
            {"text": "Mencari dukungan dari orang lain dan bekerja sama", "score": {"tanah": 3}},
            {"text": "Mengambil tindakan cepat dan tegas", "score": {"api": 3}},
            {"text": "Berpikir kreatif dan mencari cara inovatif", "score": {"kayu": 3}},
            {"text": "Menunggu situasi berkembang sambil mengamati", "score": {"angin": 3}}
        ],
        "type": "multiple_choice",
        "order": 1
    },
    {
        "category": "element",
        "question": "Dalam bekerja, saya paling merasa nyaman ketika:",
        "options": [
            {"text": "Ada struktur dan sistem yang jelas", "score": {"tanah": 3}},
            {"text": "Bisa bergerak bebas dan fleksibel", "score": {"angin": 3}},
            {"text": "Ada tantangan yang memicu semangat", "score": {"api": 3}},
            {"text": "Bisa mengeksplorasi ide-ide baru", "score": {"kayu": 3}},
            {"text": "Dapat berpikir mendalam dan fokus", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 2
    },
    {
        "category": "element",
        "question": "Saya menggambarkan diri saya sebagai orang yang:",
        "options": [
            {"text": "Tenang, stabil, dan dapat diandalkan", "score": {"tanah": 3}},
            {"text": "Dinamis, adaptif, dan mudah bergaul", "score": {"angin": 3}},
            {"text": "Passionate, energik, dan berani", "score": {"api": 3}},
            {"text": "Kreatif, inovatif, dan visioner", "score": {"kayu": 3}},
            {"text": "Bijaksana, intuitif, dan reflektif", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 3
    },
    {
        "category": "element",
        "question": "Dalam mengambil keputusan, saya lebih mengandalkan:",
        "options": [
            {"text": "Data dan fakta yang konkret", "score": {"tanah": 2, "air": 1}},
            {"text": "Intuisi dan feeling", "score": {"angin": 2, "air": 1}},
            {"text": "Insting dan keberanian", "score": {"api": 3}},
            {"text": "Visi jangka panjang", "score": {"kayu": 2, "air": 1}},
            {"text": "Analisis mendalam dan pertimbangan", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 4
    },
    {
        "category": "element",
        "question": "Lingkungan kerja yang ideal bagi saya adalah:",
        "options": [
            {"text": "Teratur, terstruktur, dan predictable", "score": {"tanah": 3}},
            {"text": "Dinamis, variatif, dan selalu berubah", "score": {"angin": 3}},
            {"text": "Kompetitif dan menantang", "score": {"api": 3}},
            {"text": "Kreatif dan mendorong inovasi", "score": {"kayu": 3}},
            {"text": "Tenang dan memungkinkan refleksi", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 5
    },
    {
        "category": "element",
        "question": "Ketika stress, saya cenderung:",
        "options": [
            {"text": "Menjadi kaku dan sulit berubah", "score": {"tanah": 3}},
            {"text": "Menjadi gelisah dan tidak fokus", "score": {"angin": 3}},
            {"text": "Menjadi reaktif dan mudah marah", "score": {"api": 3}},
            {"text": "Overthinking dan terlalu idealis", "score": {"kayu": 3}},
            {"text": "Menarik diri dan terlalu banyak berpikir", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 6
    },
    {
        "category": "element",
        "question": "Cara berkomunikasi saya biasanya:",
        "options": [
            {"text": "To the point, jelas, dan praktis", "score": {"tanah": 3}},
            {"text": "Ramah, ringan, dan mudah berganti topik", "score": {"angin": 3}},
            {"text": "Tegas, langsung, dan penuh semangat", "score": {"api": 3}},
            {"text": "Inspiratif dan penuh ide", "score": {"kayu": 3}},
            {"text": "Mendalam dan penuh makna", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 7
    },
    {
        "category": "element",
        "question": "Saya paling termotivasi oleh:",
        "options": [
            {"text": "Keamanan dan stabilitas", "score": {"tanah": 3}},
            {"text": "Kebebasan dan variasi", "score": {"angin": 3}},
            {"text": "Pencapaian dan kemenangan", "score": {"api": 3}},
            {"text": "Pertumbuhan dan pengembangan", "score": {"kayu": 3}},
            {"text": "Pemahaman dan kebijaksanaan", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 8
    },
    {
        "category": "element",
        "question": "Dalam tim, peran saya biasanya:",
        "options": [
            {"text": "Penjaga konsistensi dan kualitas", "score": {"tanah": 3}},
            {"text": "Penghubung dan komunikator", "score": {"angin": 3}},
            {"text": "Pemimpin dan pengambil keputusan", "score": {"api": 3}},
            {"text": "Visioner dan innovator", "score": {"kayu": 3}},
            {"text": "Pemikir strategis dan advisor", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 9
    },
    {
        "category": "element",
        "question": "Hobi atau aktivitas yang saya nikmati:",
        "options": [
            {"text": "Kegiatan rutin yang memberikan hasil nyata", "score": {"tanah": 3}},
            {"text": "Bertemu orang baru dan traveling", "score": {"angin": 3}},
            {"text": "Olahraga kompetitif atau aktivitas menantang", "score": {"api": 3}},
            {"text": "Seni, musik, atau kreativitas", "score": {"kayu": 3}},
            {"text": "Membaca, menulis, atau meditasi", "score": {"air": 3}}
        ],
        "type": "multiple_choice",
        "order": 10
    }
]

# ============= TEST INTROVERT/EXTROVERT =============
personality_questions = [
    {
        "category": "personality_type",
        "question": "Setelah berinteraksi dengan banyak orang, saya merasa:",
        "options": [
            {"text": "Lelah dan butuh waktu sendiri untuk recharge", "score": {"introvert": 3}},
            {"text": "Energized dan ingin bertemu lebih banyak orang", "score": {"extrovert": 3}},
            {"text": "Tergantung situasi dan orang yang saya temui", "score": {"introvert": 1, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 1
    },
    {
        "category": "personality_type",
        "question": "Dalam situasi sosial, saya lebih suka:",
        "options": [
            {"text": "Percakapan mendalam dengan 1-2 orang", "score": {"introvert": 3}},
            {"text": "Berinteraksi dengan banyak orang sekaligus", "score": {"extrovert": 3}},
            {"text": "Campuran keduanya", "score": {"introvert": 1, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 2
    },
    {
        "category": "personality_type",
        "question": "Ketika ada waktu luang, saya lebih memilih:",
        "options": [
            {"text": "Menyendiri untuk hobi atau relaksasi", "score": {"introvert": 3}},
            {"text": "Keluar dan bertemu teman-teman", "score": {"extrovert": 3}},
            {"text": "Kadang sendiri, kadang bersama orang lain", "score": {"introvert": 1, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 3
    },
    {
        "category": "personality_type",
        "question": "Saya lebih suka berpikir:",
        "options": [
            {"text": "Dalam hati sebelum bicara", "score": {"introvert": 3}},
            {"text": "Sambil berbicara dengan orang lain", "score": {"extrovert": 3}},
            {"text": "Tergantung topiknya", "score": {"introvert": 1, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 4
    },
    {
        "category": "personality_type",
        "question": "Di acara/pesta, saya biasanya:",
        "options": [
            {"text": "Di pinggir, mengamati, atau berbicara dengan beberapa orang saja", "score": {"introvert": 3}},
            {"text": "Di tengah keramaian, aktif bersosialisasi", "score": {"extrovert": 3}},
            {"text": "Mulai ramai lalu mundur ke pinggir", "score": {"introvert": 2, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 5
    },
    {
        "category": "personality_type",
        "question": "Saya merasa paling produktif ketika:",
        "options": [
            {"text": "Bekerja sendiri tanpa gangguan", "score": {"introvert": 3}},
            {"text": "Bekerja dalam tim dan diskusi grup", "score": {"extrovert": 3}},
            {"text": "Mix antara kerja solo dan kolaborasi", "score": {"introvert": 1, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 6
    },
    {
        "category": "personality_type",
        "question": "Ketika ada masalah, saya cenderung:",
        "options": [
            {"text": "Merenung dan mencari solusi sendiri dulu", "score": {"introvert": 3}},
            {"text": "Segera mendiskusikan dengan orang lain", "score": {"extrovert": 3}},
            {"text": "Pikir sendiri dulu, lalu diskusi", "score": {"introvert": 2, "extrovert": 1}}
        ],
        "type": "multiple_choice",
        "order": 7
    },
    {
        "category": "personality_type",
        "question": "Circle pertemanan saya:",
        "options": [
            {"text": "Kecil tapi sangat dekat", "score": {"introvert": 3}},
            {"text": "Luas dengan banyak kenalan", "score": {"extrovert": 3}},
            {"text": "Beberapa teman dekat plus banyak kenalan", "score": {"introvert": 1, "extrovert": 2}}
        ],
        "type": "multiple_choice",
        "order": 8
    }
]

# ============= TEST MINAT DASAR =============
interest_questions = [
    {
        "category": "minat_dasar",
        "question": "Saya paling tertarik pada pekerjaan yang melibatkan:",
        "options": [
            {"text": "Bekerja dengan angka, data, dan analisis", "score": {"analitik": 3}},
            {"text": "Berinteraksi dan membantu orang lain", "score": {"sosial": 3}},
            {"text": "Membuat atau memperbaiki sesuatu dengan tangan", "score": {"praktis": 3}},
            {"text": "Seni, desain, atau kreativitas", "score": {"artistik": 3}},
            {"text": "Memimpin, mengorganisir, dan mencapai target", "score": {"enterprising": 3}},
            {"text": "Penelitian, eksplorasi, dan penemuan", "score": {"investigatif": 3}}
        ],
        "type": "multiple_choice",
        "order": 1
    },
    {
        "category": "minat_dasar",
        "question": "Dalam waktu luang, saya lebih suka:",
        "options": [
            {"text": "Mengerjakan puzzle, sudoku, atau games strategi", "score": {"analitik": 2, "investigatif": 1}},
            {"text": "Volunteering atau kegiatan sosial", "score": {"sosial": 3}},
            {"text": "DIY projects atau berkebun", "score": {"praktis": 3}},
            {"text": "Menggambar, musik, atau aktivitas kreatif", "score": {"artistik": 3}},
            {"text": "Networking atau mengembangkan bisnis sampingan", "score": {"enterprising": 3}},
            {"text": "Membaca buku sains atau dokumenter", "score": {"investigatif": 3}}
        ],
        "type": "multiple_choice",
        "order": 2
    },
    {
        "category": "minat_dasar",
        "question": "Mata pelajaran favorit saya di sekolah adalah:",
        "options": [
            {"text": "Matematika atau Fisika", "score": {"analitik": 2, "investigatif": 1}},
            {"text": "Bahasa atau Sosiologi", "score": {"sosial": 2, "artistik": 1}},
            {"text": "Olahraga atau Prakarya", "score": {"praktis": 3}},
            {"text": "Seni atau Musik", "score": {"artistik": 3}},
            {"text": "Ekonomi atau Kewirausahaan", "score": {"enterprising": 3}},
            {"text": "Biologi atau Kimia", "score": {"investigatif": 3}}
        ],
        "type": "multiple_choice",
        "order": 3
    },
    {
        "category": "minat_dasar",
        "question": "Saya merasa paling puas ketika:",
        "options": [
            {"text": "Menyelesaikan masalah kompleks", "score": {"analitik": 2, "investigatif": 1}},
            {"text": "Melihat orang lain tersenyum karena bantuan saya", "score": {"sosial": 3}},
            {"text": "Membuat sesuatu yang berfungsi dengan baik", "score": {"praktis": 3}},
            {"text": "Menciptakan karya yang indah atau unik", "score": {"artistik": 3}},
            {"text": "Mencapai target atau memenangkan kompetisi", "score": {"enterprising": 3}},
            {"text": "Menemukan sesuatu yang baru atau mengerti konsep baru", "score": {"investigatif": 3}}
        ],
        "type": "multiple_choice",
        "order": 4
    },
    {
        "category": "minat_dasar",
        "question": "Lingkungan kerja ideal saya:",
        "options": [
            {"text": "Office dengan sistem dan prosedur yang jelas", "score": {"analitik": 3}},
            {"text": "Tempat di mana saya bisa berinteraksi dengan banyak orang", "score": {"sosial": 3}},
            {"text": "Workshop, lapangan, atau tempat kerja fisik", "score": {"praktis": 3}},
            {"text": "Studio atau space kreatif yang inspiratif", "score": {"artistik": 3}},
            {"text": "Environment yang dinamis dan kompetitif", "score": {"enterprising": 3}},
            {"text": "Lab atau tempat untuk riset dan eksperimen", "score": {"investigatif": 3}}
        ],
        "type": "multiple_choice",
        "order": 5
    }
]

# ============= TEST BAKAT DASAR =============
talent_questions = [
    {
        "category": "bakat_dasar",
        "question": "Orang-orang sering memuji saya karena:",
        "options": [
            {"text": "Kemampuan berbicara di depan umum", "score": {"komunikasi": 3}},
            {"text": "Kemampuan memahami perasaan orang lain", "score": {"empati": 3}},
            {"text": "Koordinasi fisik dan kemampuan olahraga", "score": {"kinestetik": 3}},
            {"text": "Kemampuan berpikir logis dan analitis", "score": {"logika": 3}},
            {"text": "Sense of music atau rhythm", "score": {"musikal": 3}},
            {"text": "Kemampuan visualisasi dan spasial", "score": {"visual": 3}}
        ],
        "type": "multiple_choice",
        "order": 1
    },
    {
        "category": "bakat_dasar",
        "question": "Saya belajar paling efektif melalui:",
        "options": [
            {"text": "Mendengarkan penjelasan dan diskusi", "score": {"komunikasi": 2, "empati": 1}},
            {"text": "Merasakan emosi dan pengalaman langsung", "score": {"empati": 3}},
            {"text": "Praktik langsung dan hands-on activity", "score": {"kinestetik": 3}},
            {"text": "Membaca dan menganalisis", "score": {"logika": 3}},
            {"text": "Rhythm, lagu, atau pattern suara", "score": {"musikal": 3}},
            {"text": "Diagram, gambar, dan visualisasi", "score": {"visual": 3}}
        ],
        "type": "multiple_choice",
        "order": 2
    },
    {
        "category": "bakat_dasar",
        "question": "Ketika menjelaskan sesuatu, saya cenderung:",
        "options": [
            {"text": "Menggunakan kata-kata dengan jelas dan terstruktur", "score": {"komunikasi": 3}},
            {"text": "Menggunakan analogi emosional atau cerita", "score": {"empati": 3}},
            {"text": "Mendemonstrasikan atau gesture", "score": {"kinestetik": 3}},
            {"text": "Menggunakan logika step-by-step", "score": {"logika": 3}},
            {"text": "Menggunakan analogi suara atau rhythm", "score": {"musikal": 3}},
            {"text": "Menggambar atau membuat sketsa", "score": {"visual": 3}}
        ],
        "type": "multiple_choice",
        "order": 3
    },
    {
        "category": "bakat_dasar",
        "question": "Hobi atau aktivitas yang saya kuasai dengan cepat:",
        "options": [
            {"text": "Public speaking, debat, atau storytelling", "score": {"komunikasi": 3}},
            {"text": "Konseling, mediasi, atau membantu orang", "score": {"empati": 3}},
            {"text": "Olahraga, dance, atau aktivitas fisik", "score": {"kinestetik": 3}},
            {"text": "Chess, programming, atau problem solving", "score": {"logika": 3}},
            {"text": "Bermain alat musik atau bernyanyi", "score": {"musikal": 3}},
            {"text": "Fotografi, design, atau seni visual", "score": {"visual": 3}}
        ],
        "type": "multiple_choice",
        "order": 4
    },
    {
        "category": "bakat_dasar",
        "question": "Kekuatan utama saya dalam tim adalah:",
        "options": [
            {"text": "Menyampaikan ide dengan jelas", "score": {"komunikasi": 3}},
            {"text": "Memahami dinamika dan menjaga harmoni", "score": {"empati": 3}},
            {"text": "Mengeksekusi tugas praktis dengan baik", "score": {"kinestetik": 3}},
            {"text": "Menganalisis masalah dan menemukan solusi", "score": {"logika": 3}},
            {"text": "Membuat presentasi yang engaging", "score": {"musikal": 2, "komunikasi": 1}},
            {"text": "Membuat visualisasi atau design", "score": {"visual": 3}}
        ],
        "type": "multiple_choice",
        "order": 5
    }
]

# ============= MAIN SEED FUNCTION =============
async def seed_questions():
    """Seed all questions to database"""
    try:
        print("🌱 Starting to seed questions...")
        
        # Clear existing questions
        await db.questions.delete_many({})
        print("🗑️  Cleared existing questions")
        
        # Insert Element Questions
        if element_questions:
            result = await db.questions.insert_many(element_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} Element questions")
        
        # Insert Personality Type Questions
        if personality_questions:
            result = await db.questions.insert_many(personality_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} Personality Type questions")
        
        # Insert Interest Questions
        if interest_questions:
            result = await db.questions.insert_many(interest_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} Interest questions")
        
        # Insert Talent Questions
        if talent_questions:
            result = await db.questions.insert_many(talent_questions)
            print(f"✅ Inserted {len(result.inserted_ids)} Talent questions")
        
        # Verify total
        total = await db.questions.count_documents({})
        print(f"\n✨ Total questions in database: {total}")
        
        # Show summary by category
        categories = await db.questions.distinct("category")
        print("\n📊 Questions by category:")
        for cat in categories:
            count = await db.questions.count_documents({"category": cat})
            print(f"  - {cat}: {count} questions")
        
        print("\n🎉 Seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding questions: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_questions())
