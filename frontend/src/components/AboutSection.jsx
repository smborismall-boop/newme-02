import React from 'react';
import { Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const AboutSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#5A5A4A] via-[#4A4A3A] to-[#3A3A2A]" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-4 sm:space-y-6">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#D4A017] bg-white/10 backdrop-blur-sm">
              <svg viewBox="0 0 50 50" className="w-6 h-6 sm:w-10 sm:h-10 text-[#D4A017]">
                <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              <span className="text-[#D4A017]">SIAPA</span> KAMI ?
            </h2>

            <div className="space-y-4 text-gray-200 text-sm sm:text-base">
              <p>
                <span className="text-[#D4A017] font-bold">NEWMECLASS</span> adalah sebuah brand dan produk dari{' '}
                <span className="font-semibold">PT. MITRA SEMESTA EDUCLASS</span>, yang bergerak dengan produk:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-[#D4A017]/10 rounded-lg p-3 sm:p-4 border-l-4 border-[#D4A017]">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-[#5A5A4A] font-bold text-xs sm:text-base">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-[#D4A017] text-sm sm:text-base">Edukasi</h4>
                    <p className="text-xs sm:text-sm">Bimbel, upscale training yang kesemuanya berbasis gali potensi bakat dan dipasarkan dengan metode B to B.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#D4A017]/10 rounded-lg p-3 sm:p-4 border-l-4 border-[#D4A017]">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#D4A017] rounded-full flex items-center justify-center text-[#5A5A4A] font-bold text-xs sm:text-base">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-[#D4A017] text-sm sm:text-base">Produk Komunitas</h4>
                    <p className="text-xs sm:text-sm">Berupa merchandise dan produk lain ke mitra yang berafiliasi, dipasarkan dengan metode B to C.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 sm:p-4 border border-[#D4A017]/30">
                <p className="text-xs sm:text-sm italic">
                  Berijin pada <span className="text-[#D4A017] font-semibold">27 May 2024</span>, dan di launching pada <span className="text-[#D4A017] font-semibold">Agustus 2024</span> di Medan, NEWMECLASS lahir buah dari pengalaman founder selama kurang lebih sembilan tahun dibidang edukasi sejenis.
                </p>
              </div>
            </div>

            <Link to="/company-profile">
              <Button 
                className="bg-[#D4A017] hover:bg-[#B8900F] text-[#5A5A4A] font-bold text-sm sm:text-base"
                data-testid="about-cta"
              >
                Selengkapnya
              </Button>
            </Link>
          </div>

          {/* Right Image */}
          <div className="relative order-first md:order-last">
            <div className="relative z-10">
              {/* Main Image */}
              <div className="rounded-2xl overflow-hidden border-4 border-[#D4A017] shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" 
                  alt="Team Working"
                  className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] object-cover"
                />
              </div>

              {/* Stats Cards */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-2 sm:-left-6 bg-white rounded-xl p-2 sm:p-4 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A017]/20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-[#D4A017]" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-[#5A5A4A]">5000+</p>
                    <p className="text-xs sm:text-sm text-gray-500">Peserta Aktif</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 sm:-top-6 -right-2 sm:-right-6 bg-white rounded-xl p-2 sm:p-4 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A017]/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-[#D4A017]" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-[#5A5A4A]">50+</p>
                    <p className="text-xs sm:text-sm text-gray-500">Mitra Lembaga</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements - Hidden on mobile */}
            <div className="hidden sm:block absolute -top-10 -right-10 w-32 md:w-40 h-32 md:h-40 border-4 border-[#D4A017]/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
