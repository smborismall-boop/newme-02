import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#1a1a1a] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400/10 rounded-full mb-6">
            <Shield className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Kebijakan Privasi</h1>
          <p className="text-gray-400">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="bg-[#2a2a2a] rounded-xl p-8 space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Pendahuluan</h2>
            <p className="leading-relaxed">
              NEWME CLASS ("kami", "kita", atau "milik kami") berkomitmen untuk melindungi privasi Anda. 
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi 
              informasi pribadi Anda ketika Anda menggunakan layanan kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Informasi yang Kami Kumpulkan</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">2.1 Informasi Pribadi</h3>
                <p className="leading-relaxed mb-2">Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nama lengkap</li>
                  <li>Alamat email</li>
                  <li>Nomor telepon</li>
                  <li>Tanggal lahir</li>
                  <li>Alamat</li>
                  <li>Informasi pendidikan dan pekerjaan</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">2.2 Informasi Test & Assessment</h3>
                <p className="leading-relaxed mb-2">Ketika Anda mengikuti test kepribadian atau assessment, kami mengumpulkan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Jawaban test dan hasil assessment</li>
                  <li>Profil kepribadian</li>
                  <li>Minat dan bakat</li>
                  <li>Rekomendasi pengembangan</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">2.3 Informasi Pembayaran</h3>
                <p className="leading-relaxed">
                  Untuk transaksi pembayaran, kami dapat mengumpulkan informasi pembayaran yang diperlukan, 
                  namun kami tidak menyimpan informasi kartu kredit secara langsung.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-2">2.4 Informasi Teknis</h3>
                <p className="leading-relaxed mb-2">Kami secara otomatis mengumpulkan:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Alamat IP</li>
                  <li>Jenis browser dan perangkat</li>
                  <li>Halaman yang dikunjungi</li>
                  <li>Waktu kunjungan</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <p className="leading-relaxed mb-4">Kami menggunakan informasi yang dikumpulkan untuk:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Menyediakan dan mengelola layanan kami</li>
              <li>Memproses pendaftaran dan pembayaran</li>
              <li>Memberikan hasil test dan rekomendasi yang personal</li>
              <li>Mengirimkan pemberitahuan terkait layanan</li>
              <li>Meningkatkan kualitas layanan kami</li>
              <li>Melakukan analisis dan riset</li>
              <li>Mencegah penipuan dan penyalahgunaan</li>
              <li>Mematuhi kewajiban hukum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Berbagi Informasi</h2>
            <p className="leading-relaxed mb-4">
              Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. 
              Kami hanya berbagi informasi dalam situasi berikut:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Dengan Persetujuan Anda:</strong> Ketika Anda memberikan izin eksplisit</li>
              <li><strong>Penyedia Layanan:</strong> Dengan mitra yang membantu kami menyediakan layanan (payment gateway, hosting, dll)</li>
              <li><strong>Kewajiban Hukum:</strong> Jika diwajibkan oleh hukum atau proses hukum</li>
              <li><strong>Keamanan:</strong> Untuk melindungi hak dan keamanan kami atau orang lain</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Keamanan Data</h2>
            <p className="leading-relaxed">
              Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi 
              informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Ini termasuk:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Enkripsi data</li>
              <li>Kontrol akses yang ketat</li>
              <li>Pemantauan keamanan sistem secara berkala</li>
              <li>Backup data rutin</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Hak Anda</h2>
            <p className="leading-relaxed mb-4">Anda memiliki hak untuk:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Akses:</strong> Meminta salinan informasi pribadi Anda</li>
              <li><strong>Koreksi:</strong> Memperbaiki informasi yang tidak akurat</li>
              <li><strong>Penghapusan:</strong> Meminta penghapusan informasi Anda</li>
              <li><strong>Pembatasan:</strong> Membatasi pemrosesan informasi Anda</li>
              <li><strong>Portabilitas:</strong> Menerima informasi Anda dalam format yang dapat dibaca mesin</li>
              <li><strong>Keberatan:</strong> Menolak pemrosesan informasi Anda untuk tujuan tertentu</li>
            </ul>
            <p className="leading-relaxed mt-4">
              Untuk menggunakan hak-hak ini, silakan hubungi kami di{' '}
              <a href="mailto:newmeclass@gmail.com" className="text-yellow-400 hover:underline">
                newmeclass@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <p className="leading-relaxed">
              Kami menggunakan cookies dan teknologi serupa untuk meningkatkan pengalaman Anda, 
              menganalisis penggunaan layanan, dan personalisasi konten. Anda dapat mengatur 
              browser Anda untuk menolak cookies, namun beberapa fitur mungkin tidak berfungsi optimal.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Penyimpanan Data</h2>
            <p className="leading-relaxed">
              Kami menyimpan informasi pribadi Anda selama diperlukan untuk menyediakan layanan 
              atau mematuhi kewajiban hukum. Setelah tidak diperlukan lagi, kami akan menghapus 
              atau menganonimkan informasi tersebut.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Privasi Anak-anak</h2>
            <p className="leading-relaxed">
              Layanan kami ditujukan untuk pengguna berusia 13 tahun ke atas. Kami tidak secara 
              sengaja mengumpulkan informasi pribadi dari anak-anak di bawah 13 tahun. Jika Anda 
              adalah orang tua dan mengetahui bahwa anak Anda telah memberikan informasi pribadi 
              kepada kami, silakan hubungi kami.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Perubahan Kebijakan</h2>
            <p className="leading-relaxed">
              Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan 
              dipublikasikan di halaman ini dengan tanggal pembaruan yang baru. Kami mendorong 
              Anda untuk meninjau kebijakan ini secara berkala.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Kontak Kami</h2>
            <p className="leading-relaxed mb-4">
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini atau praktik privasi kami, 
              silakan hubungi kami:
            </p>
            <div className="bg-[#1a1a1a] p-6 rounded-lg space-y-2">
              <p><strong className="text-white">NEWME CLASS</strong></p>
              <p>Email: <a href="mailto:newmeclass@gmail.com" className="text-yellow-400 hover:underline">newmeclass@gmail.com</a></p>
              <p>Phone: <a href="tel:089502671691" className="text-yellow-400 hover:underline">0895.0267.1691</a></p>
              <p>WhatsApp: <a href="https://wa.me/6289502671691" className="text-yellow-400 hover:underline" target="_blank" rel="noopener noreferrer">+62 895-0267-1691</a></p>
              <p>Alamat: Jl. Puskesmas I - Komp. Golden Seroja - A1</p>
            </div>
          </section>

          <section className="border-t border-yellow-400/20 pt-8">
            <p className="text-sm text-gray-400 leading-relaxed">
              Dengan menggunakan layanan NEWME CLASS, Anda menyetujui pengumpulan dan penggunaan 
              informasi sesuai dengan Kebijakan Privasi ini. Jika Anda tidak setuju dengan kebijakan 
              ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            to="/register" 
            className="px-6 py-3 bg-yellow-400 text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Setuju & Daftar
          </Link>
          <Link 
            to="/" 
            className="px-6 py-3 bg-[#2a2a2a] text-white font-semibold rounded-lg hover:bg-[#3a3a3a] transition-colors"
          >
            Kembali
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
