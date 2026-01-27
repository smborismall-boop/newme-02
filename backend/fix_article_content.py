"""
Properly format artikel content ke valid HTML
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

articles_content = {
    "mengenal-5-elemen-kepribadian": """
<h1>Mengenal 5 Elemen Kepribadian</h1>

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
<p>Memahami elemen kepribadian Anda dapat membantu dalam pengembangan diri, pemilihan karir, dan membangun hubungan yang lebih harmonis. Di NEWME CLASS, kami membantu Anda menemukan elemen dominan Anda melalui test komprehensif.</p>
""",
    
    "introvert-vs-extrovert-memahami-tipe-kepribadian": """
<h1>Introvert vs Extrovert: Memahami Tipe Kepribadian Anda</h1>

<h2>Apa Itu Introvert dan Extrovert?</h2>

<h3>Introvert 🤫</h3>
<p>Introvert adalah orang yang mendapatkan energi dari waktu sendiri. Mereka cenderung:</p>
<ul>
<li>Lebih suka percakapan mendalam 1-on-1</li>
<li>Butuh waktu sendiri untuk "recharge"</li>
<li>Berpikir sebelum bicara</li>
<li>Menghindari small talk</li>
<li>Memiliki circle pertemanan kecil tapi dekat</li>
</ul>

<p><strong>Kekuatan Introvert:</strong></p>
<ul>
<li>Pendengar yang baik</li>
<li>Pemikir yang mendalam</li>
<li>Fokus dan konsentrasi tinggi</li>
<li>Mandiri dan self-sufficient</li>
</ul>

<h3>Extrovert 🎉</h3>
<p>Extrovert adalah orang yang mendapatkan energi dari interaksi sosial. Mereka cenderung:</p>
<ul>
<li>Suka bertemu banyak orang</li>
<li>Energized setelah acara sosial</li>
<li>Berpikir sambil berbicara</li>
<li>Mudah membuat kenalan baru</li>
<li>Memiliki circle pertemanan luas</li>
</ul>

<p><strong>Kekuatan Extrovert:</strong></p>
<ul>
<li>Komunikator yang baik</li>
<li>Networking alami</li>
<li>Energik dan antusias</li>
<li>Adaptif di berbagai situasi sosial</li>
</ul>

<h2>Ambivert: Yang Di Tengah 🌗</h2>
<p>Kebanyakan orang sebenarnya adalah ambivert - memiliki karakteristik keduanya dan bisa switch tergantung situasi.</p>

<h2>Tips Pengembangan Diri</h2>

<h3>Untuk Introvert:</h3>
<ol>
<li>Jangan memaksa diri jadi extrovert</li>
<li>Gunakan kekuatan mendengar Anda</li>
<li>Pilih karir yang sesuai (research, writing, programming)</li>
<li>Tetap jaga networking, tapi dengan cara Anda</li>
</ol>

<h3>Untuk Extrovert:</h3>
<ol>
<li>Belajar mendengarkan lebih baik</li>
<li>Develop kemampuan refleksi</li>
<li>Hargai waktu sendiri</li>
<li>Pilih karir yang melibatkan interaksi (sales, teaching, PR)</li>
</ol>

<h2>Kesimpulan</h2>
<p>Tidak ada tipe yang lebih baik - keduanya memiliki kekuatan unik. Yang penting adalah memahami diri sendiri dan memanfaatkan kekuatan alami Anda.</p>
""",
    
    "6-jenis-minat-dasar-teori-holland": """
<h1>6 Jenis Minat Dasar Menurut Teori Holland</h1>

<h2>Apa Itu Teori Holland?</h2>
<p>Teori Holland atau RIASEC adalah teori karir yang dikembangkan oleh psikolog John L. Holland. Teori ini mengelompokkan minat dan lingkungan kerja menjadi 6 tipe.</p>

<h2>1. Realistic (Praktis) 🔧</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Suka bekerja dengan tangan</li>
<li>Praktis dan hands-on</li>
<li>Menyukai aktivitas fisik</li>
<li>Berorientasi hasil nyata</li>
</ul>
<p><strong>Karir Cocok:</strong> Teknisi, mekanik, arsitek, engineer, petani, atlet, pilot</p>

<h2>2. Investigative (Analitik) 🔬</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Suka berpikir dan menganalisis</li>
<li>Curious dan ingin tahu</li>
<li>Sistematis dan metodis</li>
<li>Suka memecahkan masalah kompleks</li>
</ul>
<p><strong>Karir Cocok:</strong> Scientist, researcher, dokter, pharmacist, data analyst, mathematician</p>

<h2>3. Artistic (Artistik) 🎨</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Kreatif dan imajinatif</li>
<li>Ekspresif dan original</li>
<li>Menghargai keindahan</li>
<li>Non-konformis</li>
</ul>
<p><strong>Karir Cocok:</strong> Desainer grafis, musisi, penulis, actor, dancer, fashion designer</p>

<h2>4. Social (Sosial) 👥</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Suka membantu orang lain</li>
<li>Empatik dan peduli</li>
<li>Komunikatif</li>
<li>Berorientasi pada orang</li>
</ul>
<p><strong>Karir Cocok:</strong> Guru, konselor, perawat, dokter, social worker, HR specialist</p>

<h2>5. Enterprising (Enterprising) 💼</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Leadership natural</li>
<li>Persuasif dan influential</li>
<li>Berorientasi goal</li>
<li>Risk taker</li>
</ul>
<p><strong>Karir Cocok:</strong> Entrepreneur, CEO, sales manager, lawyer, politician, marketing manager</p>

<h2>6. Conventional (Konvensional) 📊</h2>
<p><strong>Karakteristik:</strong></p>
<ul>
<li>Terorganisir dan detail-oriented</li>
<li>Menyukai struktur dan aturan</li>
<li>Reliable dan efficient</li>
<li>Bekerja dengan data dan angka</li>
</ul>
<p><strong>Karir Cocok:</strong> Accountant, auditor, administrative assistant, banker, financial analyst, quality control</p>

<h2>Cara Menemukan Minat Anda</h2>
<ol>
<li>Ambil test RIASEC</li>
<li>Reflect pengalaman masa lalu</li>
<li>Coba berbagai aktivitas</li>
<li>Perhatikan apa yang membuat Anda "flow"</li>
</ol>

<h2>Kesimpulan</h2>
<p>Kebanyakan orang memiliki kombinasi dari beberapa tipe. Memahami minat dasar Anda adalah langkah pertama dalam memilih karir yang memuaskan dan sukses.</p>
"""
}

async def fix_articles():
    try:
        print("🔧 Fixing article HTML content...")
        
        for slug, content in articles_content.items():
            result = await db.articles.update_one(
                {'slug': slug},
                {'$set': {'content': content.strip()}}
            )
            if result.modified_count > 0:
                print(f"✅ Fixed: {slug}")
            else:
                print(f"⚠️  Not found: {slug}")
        
        # Fix remaining 2 articles with proper content
        await db.articles.update_one(
            {'slug': '8-kecerdasan-majemuk-howard-gardner'},
            {'$set': {'content': """
<h1>8 Kecerdasan Majemuk (Multiple Intelligences)</h1>

<h2>Teori Kecerdasan Majemuk</h2>
<p>Howard Gardner, psikolog dari Harvard, mengusulkan bahwa manusia memiliki 8 jenis kecerdasan yang berbeda, bukan hanya IQ standar.</p>

<h2>1. Kecerdasan Linguistik (Word Smart) 📝</h2>
<p><strong>Ciri-ciri:</strong> Pandai berbicara dan menulis, suka membaca dan storytelling, mudah belajar bahasa baru, kaya kosakata.</p>
<p><strong>Profesi:</strong> Penulis, jurnalis, lawyer, guru bahasa</p>

<h2>2. Kecerdasan Logis-Matematis (Number Smart) 🔢</h2>
<p><strong>Ciri-ciri:</strong> Berpikir logis dan sistematis, suka angka dan problem solving, analitis dan reasoning kuat.</p>
<p><strong>Profesi:</strong> Scientist, engineer, programmer, accountant</p>

<h2>3. Kecerdasan Spasial (Picture Smart) 🎨</h2>
<p><strong>Ciri-ciri:</strong> Visualisasi kuat, sense of direction bagus, artistic dan kreatif.</p>
<p><strong>Profesi:</strong> Arsitek, desainer, photographer, pilot</p>

<h2>4. Kecerdasan Kinestetik (Body Smart) 🏃</h2>
<p><strong>Ciri-ciri:</strong> Koordinasi fisik bagus, belajar dengan doing, sense of timing dan movement.</p>
<p><strong>Profesi:</strong> Atlet, dancer, surgeon, craftsman</p>

<h2>5. Kecerdasan Musikal (Music Smart) 🎵</h2>
<p><strong>Ciri-ciri:</strong> Sensitif terhadap suara dan rhythm, bisa bermain alat musik, mudah menghafal lagu.</p>
<p><strong>Profesi:</strong> Musisi, composer, sound engineer, music teacher</p>

<h2>6. Kecerdasan Interpersonal (People Smart) 👥</h2>
<p><strong>Ciri-ciri:</strong> Empati tinggi, komunikasi efektif, membaca bahasa tubuh, team player.</p>
<p><strong>Profesi:</strong> Psikolog, sales, HR, guru, social worker</p>

<h2>7. Kecerdasan Intrapersonal (Self Smart) 🧘</h2>
<p><strong>Ciri-ciri:</strong> Self-aware, reflective dan introspective, understand feelings sendiri, goal-oriented.</p>
<p><strong>Profesi:</strong> Philosopher, writer, consultant, entrepreneur</p>

<h2>8. Kecerdasan Naturalis (Nature Smart) 🌿</h2>
<p><strong>Ciri-ciri:</strong> Connect dengan alam, observe patterns di nature, care tentang environment.</p>
<p><strong>Profesi:</strong> Biologist, environmentalist, farmer, vet</p>

<h2>Mengembangkan Kecerdasan Anda</h2>
<p>Setiap orang memiliki kombinasi unik dari ke-8 kecerdasan ini. Yang penting adalah identify kekuatan Anda, develop kecerdasan dominan, strengthen yang lemah jika perlu, dan pilih karir yang match dengan kecerdasan Anda.</p>

<h2>Kesimpulan</h2>
<p>Tidak ada satu jenis kecerdasan yang superior. Setiap jenis memiliki value dan dapat dikembangkan. NEWME CLASS membantu Anda mengidentifikasi dan mengembangkan kecerdasan majemuk Anda.</p>
""".strip()}}
        )
        
        await db.articles.update_one(
            {'slug': 'cara-memilih-karir-tepat-berdasarkan-kepribadian'},
            {'$set': {'content': """
<h1>Cara Memilih Karir yang Tepat Berdasarkan Kepribadian</h1>

<h2>Mengapa Kepribadian Penting dalam Memilih Karir?</h2>
<p>Banyak orang memilih karir berdasarkan gaji tinggi, prestige, atau tekanan keluarga. Tapi mereka lupa faktor PALING PENTING: <strong>KEPRIBADIAN</strong></p>
<p>Seseorang dengan kepribadian introvert yang dipaksa jadi sales akan stress. Seseorang yang artistik yang dipaksa jadi accountant akan merasa tersiksa.</p>

<h2>Langkah-Langkah Memilih Karir</h2>

<h3>1. Kenali Kepribadian Anda</h3>
<p><strong>Test yang bisa membantu:</strong></p>
<ul>
<li>MBTI (Myers-Briggs)</li>
<li>Big Five Personality</li>
<li>Enneagram</li>
<li>5 Elemen (NEWME CLASS)</li>
</ul>

<h3>2. Identifikasi Minat Anda</h3>
<p><strong>Pertanyaan untuk diri sendiri:</strong></p>
<ul>
<li>Apa yang saya lakukan saat waktu luang?</li>
<li>Topik apa yang membuat saya excited?</li>
<li>Aktivitas apa yang membuat saya "flow"?</li>
<li>Apa yang saya lakukan berjam-jam tanpa bosan?</li>
</ul>

<h3>3. Kenali Bakat Alami Anda</h3>
<p><strong>Bakat vs Skill:</strong></p>
<ul>
<li>Bakat = kemampuan natural yang mudah dikuasai</li>
<li>Skill = kemampuan yang dipelajari dengan effort</li>
</ul>
<p>Fokus pada karir yang leverage bakat Anda, bukan yang memaksa Anda melawan nature.</p>

<h3>4. Pertimbangkan Values Anda</h3>
<p><strong>Nilai-nilai penting:</strong> Work-life balance, impact sosial, kreativitas, kebebasan, stabilitas, penghasilan</p>

<h3>5. Research Karir yang Match</h3>
<p><strong>Sumber informasi:</strong> LinkedIn profiles, job descriptions, interview profesional, internship/magang, career counseling</p>

<h2>Matching Kepribadian dengan Karir</h2>

<h3>Introvert</h3>
<p>✅ Research, writing, programming, design<br>
❌ Sales, marketing, public relations</p>

<h3>Extrovert</h3>
<p>✅ Sales, teaching, PR, event planning<br>
❌ Data entry, solo research</p>

<h3>Analitik</h3>
<p>✅ Engineering, science, finance<br>
❌ Arts, creative writing</p>

<h3>Kreatif</h3>
<p>✅ Design, advertising, arts<br>
❌ Accounting, administration</p>

<h2>Red Flags: Karir yang Salah</h2>
<p>Tanda-tanda Anda di karir yang wrong:</p>
<ul>
<li>Constantly exhausted</li>
<li>Sunday night dread</li>
<li>Feel like wearing mask at work</li>
<li>Envy career orang lain</li>
<li>No sense of purpose</li>
</ul>

<h2>Kesimpulan</h2>
<p>Memilih karir adalah salah satu keputusan terpenting dalam hidup. Jangan hanya ikut trend atau tekanan. Luangkan waktu untuk understand diri sendiri, explore berbagai opsi, test dengan internship/project, dan make informed decision.</p>
<p>Di NEWME CLASS, kami membantu Anda menemukan karir yang tepat melalui test komprehensif dan konsultasi personal.</p>
<p><strong>Your personality is your superpower. Choose a career that lets you use it.</strong> 💪</p>
""".strip()}}
        )
        
        print("\n✅ All articles content fixed!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_articles())
