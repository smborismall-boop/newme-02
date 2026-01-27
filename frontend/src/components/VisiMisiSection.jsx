import React from 'react';
import { Target, Compass, Phone, Mail, MapPin, Globe } from 'lucide-react';

const VisiMisiSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#2a2a2a]" data-testid="visi-misi-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#D4A017] bg-[#D4A017]/10 mb-4">
            <svg viewBox="0 0 50 50" className="w-6 h-6 sm:w-10 sm:h-10 text-[#D4A017]">
              <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
            </svg>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              <span className="text-[#D4A017]">NEWME</span>
              <span className="text-white">CLASS</span>
            </h2>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm">a brand & product of</p>
          <p className="text-white font-semibold text-sm sm:text-base">PT. MITRA SEMESTA EDUCLASS</p>
        </div>

        {/* Mission Statement */}
        <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 border border-[#D4A017]/20">
          <p className="text-gray-300 leading-relaxed text-center max-w-4xl mx-auto text-xs sm:text-sm md:text-base">
            Kami berkomitmen menjadikan usaha tidak hanya sebagai wadah pencari keuntungan, tapi lebih dari itu, ada aksi nyata bagi perbaikan banyak klien, yang kesemuanya kami harapkan dapat menjadi ladang investasi akhirat kami.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
          {/* Visi */}
          <div className="bg-gradient-to-br from-[#D4A017]/20 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-[#D4A017]/30">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#D4A017] rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 sm:w-7 sm:h-7 text-[#1a1a1a]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#D4A017]">VISI</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
              Menjadi bagian dari kemajuan bangsa lewat peran <span className="text-[#D4A017] font-semibold">EDUKASI JATIDIRI</span> di berbagai lembaga, institusi & organisasi di negeri tercinta.
            </p>
          </div>

          {/* Misi */}
          <div className="bg-gradient-to-br from-[#D4A017]/20 to-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-[#D4A017]/30">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#D4A017] rounded-full flex items-center justify-center">
                <Compass className="w-5 h-5 sm:w-7 sm:h-7 text-[#1a1a1a]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#D4A017]">MISI</h3>
            </div>
            <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">
              Membangun kemitraan edukasi jatidiri <span className="text-[#D4A017] font-semibold">STRATEGIS</span> dengan stakeholder dunia pendidikan, lembaga, institusi & masyarakat luas.
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#1a1a1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-[#D4A017]/20">
          <h4 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-4">Sub. MISI</h4>
          <p className="text-gray-400 mb-4 sm:mb-8 text-xs sm:text-sm">Menjadi MITRA pendorong capaian VISI & MISI mitra</p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Phone</p>
                <p className="text-white text-xs sm:text-sm">0895.0267.1691</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Site</p>
                <p className="text-white text-xs sm:text-sm">newmeclass.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Mail</p>
                <p className="text-white text-xs sm:text-sm break-all">newmeclass@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-[10px] sm:text-xs">Address</p>
                <p className="text-white text-xs sm:text-sm">Golden Seroja - A1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisiMisiSection;
