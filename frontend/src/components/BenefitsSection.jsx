import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const BenefitsSection = () => {
  const benefits = [
    {
      title: "LEBIH KENAL DIRI & POTENSI...nya",
      description: "Kondisi kurikulum pendidikan kita yang cenderung tidak berbasis pada potensi jatidiri kita, keadaan lingkungan memaksa kita semakin jauh dari nilai upscale potensi diri."
    },
    {
      title: "NYAMAN dengan GAYA JATIDIRI...nya",
      description: "Dengan mengenal siapa kita, menjadikan kita mampu memilah-milih segala aktivitas yang rekomended bagi kenyamanan kita."
    },
    {
      title: "Resep AKSELERASI perjuangi IMPIAN",
      description: "Dengan mengetahui siapa kita, memudahkan setiap klien memetakan keselarasan impian dengan eksekusinya."
    },
    {
      title: "Produk MERCHANDISE komunitas NMC",
      description: "NMC padanan dengan strategi membentuk komunitas berfasilitas aneka benefit yang dapat dirasa dan miliki klien."
    },
    {
      title: "Aneka PRODUK dan LAYANAN dari mitra NMC",
      description: "Mitra kami siap menerima kartu keanggotaan kamu di merchant mereka. Nikmati bonus diskon, bonus, reward hingga royalti."
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#1a1a1a]" data-testid="benefits-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="md:w-2/3">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-[#D4A017] bg-[#D4A017]/10 mb-4">
              <svg viewBox="0 0 50 50" className="w-5 h-5 sm:w-8 sm:h-8 text-[#D4A017]">
                <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
              APA YANG DI_ <span className="text-[#D4A017]">TERIMA KLIEN</span>
            </h2>
          </div>
          
          {/* Badge - Hidden on mobile */}
          <div className="hidden md:flex md:w-1/3 justify-end items-start">
            <div className="bg-white rounded-full p-4 sm:p-6 shadow-xl border-4 border-[#D4A017]">
              <div className="text-center">
                <p className="text-xs sm:text-sm italic text-gray-600">- Kelas Peduli Talenta -</p>
                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto my-2 flex items-center justify-center">
                  <svg viewBox="0 0 50 50" className="w-full h-full text-[#D4A017]">
                    <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
                  </svg>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500">www.newmeclass.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-[#D4A017]/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 border-[#D4A017] hover:bg-[#D4A017]/20 transition-all duration-300"
              data-testid={`benefit-item-${index}`}
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-[#D4A017] rounded-full flex items-center justify-center text-[#1a1a1a] font-bold text-xs sm:text-sm md:text-base">
                    {index + 1}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#D4A017] text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12">
          <Link to="/register">
            <Button 
              size="lg"
              className="bg-[#D4A017] hover:bg-[#B8900F] text-[#1a1a1a] font-bold px-6 sm:px-8 text-sm sm:text-base"
              data-testid="benefits-cta"
            >
              Daftar Sekarang & Dapatkan Benefitnya
            </Button>
          </Link>
        </div>

        {/* NEWMECLASS Footer */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A017] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 50 50" className="w-5 h-5 sm:w-8 sm:h-8 text-[#1a1a1a]">
              <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm sm:text-lg">NEWMECLASS</p>
            <p className="text-gray-400 text-xs sm:text-sm italic">adalah ilmu kalbu karena kepribadian</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
