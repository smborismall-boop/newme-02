"""
Script untuk seed 5 artikel contoh ke database NEWME CLASS
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from datetime import datetime
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

articles = [
    {
        "_id": str(uuid.uuid4()),
        "title": "Mengenal 5 Elemen Kepribadian: Kayu, Api, Tanah, Logam, dan Air",
        "slug": "mengenal-5-elemen-kepribadian",
        "excerpt": "Dalam filosofi Timur, khususnya Feng Shui dan Traditional Chinese Medicine, kepribadian manusia dibagi menjadi 5 elemen dasar yang saling berinteraksi dan mempengaruhi kehidupan kita.",
        "content": """<h1>Mengenal 5 Elemen Kepribadian</h1>

<h2>Pendahuluan</h2>
<p>Dalam filosofi Timur, khususnya Feng Shui dan Traditional Chinese Medicine, kepribadian manusia dibagi menjadi 5 elemen dasar: Kayu (Wood), Api (Fire), Tanah (Earth), Logam (Metal), dan Air (Water). Setiap elemen memiliki karakteristik unik yang membentuk cara kita berpikir, bertindak, dan berinteraksi dengan dunia.</p>

<h2>1. Elemen Kayu 🌳</h2>
<p><strong>Karakteristik Utama:</strong></p>
<ul>
<li>Kreatif dan inovatif</li>
<li>Visioner dan berorientasi pertumbuhan</li>
<li>Fleksibel namun teguh pada prinsip</li>
<li>Selalu mencari pengembangan diri</li>
</ul>
<p><strong>Profesi Cocok:</strong> Entrepreneur, desainer, konsultan, pendidik</p>

<h2>2. Elemen Api 🔥</h2>
<p><strong>Karakteristik Utama:</strong></p>
<ul>
<li>Passionate dan energik</li>
<li>Pemimpin alami</li>
<li>Ekspresif dan karismatik</li>
<li>Berani mengambil risiko</li>
</ul>
<p><strong>Profesi Cocok:</strong> CEO, sales, public speaker, artis</p>

<h2>3. Elemen Tanah 🏔️</h2>
<p><strong>Karakteristik Utama:</strong></p>
<ul>
<li>Stabil dan dapat diandalkan</li>
<li>Praktis dan grounded</li>
<li>Peduli dan suportif</li>
<li>Berorientasi detail</li>
</ul>
<p><strong>Profesi Cocok:</strong> Manajer, akuntan, perawat, HR</p>

<h2>4. Elemen Logam (Angin) 💨</h2>
<p><strong>Karakteristik Utama:</strong></p>
<ul>
<li>Terorganisir dan terstruktur</li>
<li>Perfeksionis</li>
<li>Analitis dan logis</li>
<li>Berkomunikasi dengan jelas</li>
</ul>
<p><strong>Profesi Cocok:</strong> Engineer, programmer, lawyer, analyst</p>

<h2>5. Elemen Air 💧</h2>
<p><strong>Karakteristik Utama:</strong></p>
<ul>
<li>Bijaksana dan intuitif</li>
<li>Adaptif dan mengalir</li>
<li>Reflektif dan dalam</li>
<li>Empatik dan perasa</li>
</ul>
<p><strong>Profesi Cocok:</strong> Psikolog, penulis, filsuf, healer</p>

<h2>Kesimpulan</h2>
<p>Memahami elemen kepribadian Anda dapat membantu dalam pengembangan diri, pemilihan karir, dan membangun hubungan yang lebih harmonis. Di NEWME CLASS, kami membantu Anda menemukan elemen dominan Anda melalui test komprehensif.</p>""",
        "category": "Kepribadian",
        "tags": "5 elemen, kepribadian, feng shui, pengembangan diri",
        "featuredImage": "/uploads/articles/5-elements.jpg",
        "isPublished": True,
        "views": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": "admin@newmeclass.com"
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "Introvert vs Extrovert: Memahami Tipe Kepribadian Anda",
        "slug": "introvert-vs-extrovert-memahami-tipe-kepribadian",
        "excerpt": "Perbedaan mendasar antara introvert dan extrovert bukan hanya soal pemalu atau cerewet, tapi tentang bagaimana Anda mendapatkan energi dan memproses informasi.",
        "content": """# Introvert vs Extrovert: Memahami Tipe Kepribadian Anda

## Apa Itu Introvert dan Extrovert?

### Introvert 🤫
Introvert adalah orang yang mendapatkan energi dari waktu sendiri. Mereka cenderung:
- Lebih suka percakapan mendalam 1-on-1
- Butuh waktu sendiri untuk "recharge"
- Berpikir sebelum bicara
- Menghindari small talk
- Memiliki circle pertemanan kecil tapi dekat

**Kekuatan Introvert:**
- Pendengar yang baik
- Pemikir yang mendalam
- Fokus dan konsentrasi tinggi
- Mandiri dan self-sufficient

### Extrovert 🎉
Extrovert adalah orang yang mendapatkan energi dari interaksi sosial. Mereka cenderung:
- Suka bertemu banyak orang
- Energized setelah acara sosial
- Berpikir sambil berbicara
- Mudah membuat kenalan baru
- Memiliki circle pertemanan luas

**Kekuatan Extrovert:**
- Komunikator yang baik
- Networking alami
- Energik dan antusias
- Adaptif di berbagai situasi sosial

## Ambivert: Yang Di Tengah 🌗

Kebanyakan orang sebenarnya adalah ambivert - memiliki karakteristik keduanya dan bisa switch tergantung situasi.

## Tips Pengembangan Diri

### Untuk Introvert:
1. Jangan memaksa diri jadi extrovert
2. Gunakan kekuatan mendengar Anda
3. Pilih karir yang sesuai (research, writing, programming)
4. Tetap jaga networking, tapi dengan cara Anda

### Untuk Extrovert:
1. Belajar mendengarkan lebih baik
2. Develop kemampuan refleksi
3. Hargai waktu sendiri
4. Pilih karir yang melibatkan interaksi (sales, teaching, PR)

## Kesimpulan
Tidak ada tipe yang lebih baik - keduanya memiliki kekuatan unik. Yang penting adalah memahami diri sendiri dan memanfaatkan kekuatan alami Anda.""",
        "category": "Kepribadian",
        "tags": "introvert, extrovert, tipe kepribadian, psikologi",
        "featuredImage": None,
        "isPublished": True,
        "views": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": "admin@newmeclass.com"
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "6 Jenis Minat Dasar Menurut Teori Holland",
        "slug": "6-jenis-minat-dasar-teori-holland",
        "excerpt": "Teori Holland membagi minat manusia menjadi 6 kategori: Realistic, Investigative, Artistic, Social, Enterprising, dan Conventional. Temukan minat Anda!",
        "content": """# 6 Jenis Minat Dasar Menurut Teori Holland

## Apa Itu Teori Holland?
Teori Holland atau RIASEC adalah teori karir yang dikembangkan oleh psikolog John L. Holland. Teori ini mengelompokkan minat dan lingkungan kerja menjadi 6 tipe.

## 1. Realistic (Praktis) 🔧

**Karakteristik:**
- Suka bekerja dengan tangan
- Praktis dan hands-on
- Menyukai aktivitas fisik
- Berorientasi hasil nyata

**Karir Cocok:**
- Teknisi, mekanik
- Arsitek, engineer
- Petani, landscaper
- Atlet, pilot

## 2. Investigative (Analitik) 🔬

**Karakteristik:**
- Suka berpikir dan menganalisis
- Curious dan ingin tahu
- Sistematis dan metodis
- Suka memecahkan masalah kompleks

**Karir Cocok:**
- Scientist, researcher
- Dokter, pharmacist
- Data analyst
- Mathematician

## 3. Artistic (Artistik) 🎨

**Karakteristik:**
- Kreatif dan imajinatif
- Ekspresif dan original
- Menghargai keindahan
- Non-konformis

**Karir Cocok:**
- Desainer grafis
- Musisi, penulis
- Actor, dancer
- Fashion designer

## 4. Social (Sosial) 👥

**Karakteristik:**
- Suka membantu orang lain
- Empatik dan peduli
- Komunikatif
- Berorientasi pada orang

**Karir Cocok:**
- Guru, konselor
- Perawat, dokter
- Social worker
- HR specialist

## 5. Enterprising (Enterprising) 💼

**Karakteristik:**
- Leadership natural
- Persuasif dan influential
- Berorientasi goal
- Risk taker

**Karir Cocok:**
- Entrepreneur, CEO
- Sales manager
- Lawyer, politician
- Marketing manager

## 6. Conventional (Konvensional) 📊

**Karakteristik:**
- Terorganisir dan detail-oriented
- Menyukai struktur dan aturan
- Reliable dan efficient
- Bekerja dengan data dan angka

**Karir Cocok:**
- Accountant, auditor
- Administrative assistant
- Banker, financial analyst
- Quality control

## Cara Menemukan Minat Anda
1. Ambil test RIASEC
2. Reflect pengalaman masa lalu
3. Coba berbagai aktivitas
4. Perhatikan apa yang membuat Anda "flow"

## Kesimpulan
Kebanyakan orang memiliki kombinasi dari beberapa tipe. Memahami minat dasar Anda adalah langkah pertama dalam memilih karir yang memuaskan dan sukses.""",
        "category": "Karir",
        "tags": "minat, holland, RIASEC, karir, test minat",
        "featuredImage": None,
        "isPublished": True,
        "views": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": "admin@newmeclass.com"
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "8 Kecerdasan Majemuk (Multiple Intelligences) Howard Gardner",
        "slug": "8-kecerdasan-majemuk-howard-gardner",
        "excerpt": "Tidak semua orang pintar dengan cara yang sama. Howard Gardner mengidentifikasi 8 jenis kecerdasan berbeda yang dimiliki manusia.",
        "content": """# 8 Kecerdasan Majemuk (Multiple Intelligences)

## Teori Kecerdasan Majemuk
Howard Gardner, psikolog dari Harvard, mengusulkan bahwa manusia memiliki 8 jenis kecerdasan yang berbeda, bukan hanya IQ standar.

## 1. Kecerdasan Linguistik (Word Smart) 📝

**Ciri-ciri:**
- Pandai berbicara dan menulis
- Suka membaca dan storytelling
- Mudah belajar bahasa baru
- Kaya kosakata

**Profesi:** Penulis, jurnalis, lawyer, guru bahasa

## 2. Kecerdasan Logis-Matematis (Number Smart) 🔢

**Ciri-ciri:**
- Berpikir logis dan sistematis
- Suka angka dan problem solving
- Analitis dan reasoning kuat
- Pattern recognition

**Profesi:** Scientist, engineer, programmer, accountant

## 3. Kecerdasan Spasial (Picture Smart) 🎨

**Ciri-ciri:**
- Visualisasi kuat
- Sense of direction bagus
- Artistic dan kreatif
- Mudah membaca map/diagram

**Profesi:** Arsitek, desainer, photographer, pilot

## 4. Kecerdasan Kinestetik (Body Smart) 🏃

**Ciri-ciri:**
- Koordinasi fisik bagus
- Belajar dengan doing
- Sense of timing dan movement
- Hands-on learner

**Profesi:** Atlet, dancer, surgeon, craftsman

## 5. Kecerdasan Musikal (Music Smart) 🎵

**Ciri-ciri:**
- Sensitif terhadap suara dan rhythm
- Bisa bermain alat musik
- Mudah menghafal lagu
- Appreciate musik

**Profesi:** Musisi, composer, sound engineer, music teacher

## 6. Kecerdasan Interpersonal (People Smart) 👥

**Ciri-ciri:**
- Empati tinggi
- Komunikasi efektif
- Membaca bahasa tubuh
- Team player

**Profesi:** Psikolog, sales, HR, guru, social worker

## 7. Kecerdasan Intrapersonal (Self Smart) 🧘

**Ciri-ciri:**
- Self-aware
- Reflective dan introspective
- Understand feelings sendiri
- Goal-oriented

**Profesi:** Philosopher, writer, consultant, entrepreneur

## 8. Kecerdasan Naturalis (Nature Smart) 🌿

**Ciri-ciri:**
- Connect dengan alam
- Observe patterns di nature
- Care tentang environment
- Classify dan categorize

**Profesi:** Biologist, environmentalist, farmer, vet

## Mengembangkan Kecerdasan Anda

Setiap orang memiliki kombinasi unik dari ke-8 kecerdasan ini. Yang penting adalah:
1. Identify kekuatan Anda
2. Develop kecerdasan dominan
3. Strengthen yang lemah jika perlu
4. Pilih karir yang match dengan kecerdasan Anda

## Kesimpulan
Tidak ada satu jenis kecerdasan yang superior. Setiap jenis memiliki value dan dapat dikembangkan. NEWME CLASS membantu Anda mengidentifikasi dan mengembangkan kecerdasan majemuk Anda.""",
        "category": "Bakat",
        "tags": "multiple intelligences, bakat, kecerdasan, howard gardner",
        "featuredImage": None,
        "isPublished": True,
        "views": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": "admin@newmeclass.com"
    },
    {
        "_id": str(uuid.uuid4()),
        "title": "Cara Memilih Karir yang Tepat Berdasarkan Kepribadian",
        "slug": "cara-memilih-karir-tepat-berdasarkan-kepribadian",
        "excerpt": "Memilih karir bukan hanya soal gaji besar, tapi tentang menemukan pekerjaan yang align dengan kepribadian, minat, dan bakat Anda.",
        "content": """# Cara Memilih Karir yang Tepat Berdasarkan Kepribadian

## Mengapa Kepribadian Penting dalam Memilih Karir?

Banyak orang memilih karir berdasarkan:
- Gaji tinggi
- Prestige
- Tekanan keluarga
- Trend pasar

Tapi mereka lupa faktor PALING PENTING: **KEPRIBADIAN**

Seseorang dengan kepribadian introvert yang dipaksa jadi sales akan stress. Seseorang yang artistik yang dipaksa jadi accountant akan merasa tersiksa.

## Langkah-Langkah Memilih Karir

### 1. Kenali Kepribadian Anda

**Test yang bisa membantu:**
- MBTI (Myers-Briggs)
- Big Five Personality
- Enneagram
- 5 Elemen (NEWME CLASS)

### 2. Identifikasi Minat Anda

**Pertanyaan untuk diri sendiri:**
- Apa yang saya lakukan saat waktu luang?
- Topik apa yang membuat saya excited?
- Aktivitas apa yang membuat saya "flow"?
- Apa yang saya lakukan berjam-jam tanpa bosan?

### 3. Kenali Bakat Alami Anda

**Bakat vs Skill:**
- Bakat = kemampuan natural yang mudah dikuasai
- Skill = kemampuan yang dipelajari dengan effort

Fokus pada karir yang leverage bakat Anda, bukan yang memaksa Anda melawan nature.

### 4. Pertimbangkan Values Anda

**Nilai-nilai penting:**
- Work-life balance
- Impact sosial
- Kreativitas
- Kebebasan
- Stabilitas
- Penghasilan

### 5. Research Karir yang Match

**Sumber informasi:**
- LinkedIn profiles
- Job descriptions
- Interview profesional
- Internship/magang
- Career counseling

## Matching Kepribadian dengan Karir

### Introvert
✅ Research, writing, programming, design
❌ Sales, marketing, public relations

### Extrovert
✅ Sales, teaching, PR, event planning
❌ Data entry, solo research

### Analitik
✅ Engineering, science, finance
❌ Arts, creative writing

### Kreatif
✅ Design, advertising, arts
❌ Accounting, administration

### Helper/Caregiver
✅ Healthcare, counseling, education
❌ Competitive sales, solo tech

## Red Flags: Karir yang Salah

Tanda-tanda Anda di karir yang wrong:
- Constantly exhausted
- Sunday night dread
- Feel like wearing mask at work
- Envy career orang lain
- No sense of purpose

## Success Stories

**Case 1: From Finance to Design**
Lisa, introvert & artistik, dipaksa jadi banker karena prestige. Setelah 5 tahun burnout, dia ambil test kepribadian, quit, dan jadi UI/UX designer. Sekarang happier & more successful.

**Case 2: From Teaching to Tech**
Budi, analitik & problem solver, jadi guru karena keluarga. Tapi dia merasa gak cocok dengan aspek sosial teaching. Pindah ke programming, dan thriving.

## Kesimpulan

Memilih karir adalah salah satu keputusan terpenting dalam hidup. Jangan hanya ikut trend atau tekanan. Luangkan waktu untuk:
1. Understand diri sendiri
2. Explore berbagai opsi
3. Test dengan internship/project
4. Make informed decision

Di NEWME CLASS, kami membantu Anda menemukan karir yang tepat melalui test komprehensif dan konsultasi personal.

**Your personality is your superpower. Choose a career that lets you use it.** 💪""",
        "category": "Karir",
        "tags": "karir, pemilihan karir, kepribadian, pengembangan karir",
        "featuredImage": None,
        "isPublished": True,
        "views": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "createdBy": "admin@newmeclass.com"
    }
]

async def seed_articles():
    """Seed articles to database"""
    try:
        print("🌱 Starting to seed articles...")
        
        # Clear existing articles
        await db.articles.delete_many({})
        print("🗑️  Cleared existing articles")
        
        # Insert articles
        if articles:
            result = await db.articles.insert_many(articles)
            print(f"✅ Inserted {len(result.inserted_ids)} articles")
        
        # Verify
        total = await db.articles.count_documents({})
        print(f"\n✨ Total articles in database: {total}")
        
        # Show summary by category
        categories = await db.articles.distinct("category")
        print("\n📊 Articles by category:")
        for cat in categories:
            count = await db.articles.count_documents({"category": cat})
            print(f"  - {cat}: {count} articles")
        
        print("\n🎉 Seeding articles completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding articles: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_articles())
