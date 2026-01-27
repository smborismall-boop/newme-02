import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const NewmeTest = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <ClipboardList className="w-12 h-12 text-yellow-400" />
          </div>
          <span className="inline-block px-6 py-2 bg-[#1a1a1a] text-yellow-400 text-sm font-bold rounded-full mb-4">
            GRATIS
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            5 Test Dasar Gratis
          </h1>
          <p className="text-lg sm:text-xl text-[#2a2a2a] max-w-3xl mx-auto">
            Observasi Mandiri untuk Mengenal Potensi dan Bakat Alami Anda
          </p>
        </div>
      </section>

      {/* Info & CTA Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 5 Test Info */}
          <div className="bg-[#2a2a2a] border border-yellow-400/20 rounded-2xl p-6 sm:p-8 mb-8">
            <h3 className="text-yellow-400 font-bold text-xl sm:text-2xl mb-6 text-center">
              Apa Saja 5 Test Dasar Gratis?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-400/10">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#1a1a1a]">1</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Test Kepribadian Dasar</h4>
                <p className="text-gray-400 text-sm">Kenali karakter dan sifat dasar Anda</p>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-400/10">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#1a1a1a]">2</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Test Minat Dasar</h4>
                <p className="text-gray-400 text-sm">Temukan passion dan minat alami Anda</p>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-400/10">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#1a1a1a]">3</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Test Bakat Dasar</h4>
                <p className="text-gray-400 text-sm">Identifikasi bakat tersembunyi Anda</p>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-400/10">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#1a1a1a]">4</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Hasil Instant</h4>
                <p className="text-gray-400 text-sm">Dapatkan hasil test secara langsung</p>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-400/10 sm:col-span-2 lg:col-span-1">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-[#1a1a1a]">5</span>
                </div>
                <h4 className="text-white font-semibold mb-1">Rekomendasi Pengembangan</h4>
                <p className="text-gray-400 text-sm">Tips untuk mengembangkan potensi Anda</p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-400 font-semibold text-lg sm:text-xl mb-3">Disclaimer</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                  Untuk keakuratan hasil observasi dan kebutuhan jejaring komunitas NMC, sangat penting Anda mengisi data aktual 
                  (bukan berdasarkan KTP/informasi lain). Juga centang yang paling cocok untuk diri Anda sendiri.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/register')}
              className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-bold px-10 sm:px-12 py-6 sm:py-8 text-lg sm:text-xl rounded-xl shadow-xl hover:shadow-2xl transition-all"
              data-testid="daftar-sekarang-btn"
            >
              Daftar Sekarang
              <ArrowRight className="ml-3 w-6 h-6" />
            </Button>
            <p className="text-gray-400 mt-4 text-sm">
              Sudah punya akun? <a href="/login" className="text-yellow-400 hover:underline">Login di sini</a>
            </p>
          </div>

          {/* Steps Info */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Daftar Akun</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Buat akun gratis Anda</p>
            </div>

            <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Ikuti 5 Test</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Observasi bakat & potensi</p>
            </div>

            <div className="bg-[#2a2a2a] p-4 sm:p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2 text-sm sm:text-base">Terima Hasil</h4>
              <p className="text-gray-400 text-xs sm:text-sm">Hasil & rekomendasi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewmeTest;