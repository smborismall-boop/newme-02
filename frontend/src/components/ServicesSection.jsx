import React from 'react';
import { Building2, User, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const corporateServices = [
    {
      title: "KELAS GALI BAKAT",
      description: "Program KELAS OPTIMASI POTENSI di yayasan pendidikan dan pelatihan untuk dunia bisnis / korporasi.",
      link: "/kelas-gali-bakat"
    }
  ];

  const individualServices = [
    {
      title: "Observasi Online & Offline",
      description: "Melakukan observasi offline hingga online untuk mengenal potensi diri Anda.",
      link: "/services/clinic"
    },
    {
      title: "Program MENGENAL DIRI",
      description: "Program MENGENAL DIRI lewat NMC untuk dampak positif bagi mitra individual.",
      link: "/newme-test"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#5A5A4A] via-[#4A4A3A] to-[#3A3A2A]" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-[#D4A017] bg-white/10 backdrop-blur-sm mb-4">
            <svg viewBox="0 0 50 50" className="w-6 h-6 sm:w-10 sm:h-10 text-[#D4A017]">
              <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
            <span className="text-[#D4A017]">PRODUK JASA</span> KAMI
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Corporate / B2B */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#D4A017] rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-[#5A5A4A]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#D4A017]">YAYASAN / KORPORASI</h3>
                <p className="text-white/70 text-sm">( B to B )</p>
              </div>
            </div>

            {corporateServices.map((service, index) => (
              <Link 
                key={index} 
                to={service.link}
                className="block group"
                data-testid={`corporate-service-${index}`}
              >
                <div className="bg-[#D4A017] rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  <h4 className="font-bold text-[#5A5A4A] text-sm sm:text-base md:text-lg mb-2 flex items-center justify-between">
                    {service.title}
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform" />
                  </h4>
                  <p className="text-[#5A5A4A]/80 text-xs sm:text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}

            {/* Image */}
            <div className="rounded-2xl overflow-hidden border-4 border-[#D4A017]/50">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80" 
                alt="Corporate Training"
                className="w-full h-40 sm:h-48 md:h-64 object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>

          {/* Individual / B2C */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-[#D4A017] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 sm:w-7 sm:h-7 text-[#5A5A4A]" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#D4A017]">INDIVIDUAL</h3>
                <p className="text-white/70 text-sm">( B to C )</p>
              </div>
            </div>

            {individualServices.map((service, index) => (
              <Link 
                key={index} 
                to={service.link}
                className="block group"
                data-testid={`individual-service-${index}`}
              >
                <div className="bg-white/10 backdrop-blur-sm border border-[#D4A017]/30 rounded-2xl p-4 sm:p-6 transition-all duration-300 group-hover:bg-[#D4A017]/10 group-hover:border-[#D4A017]">
                  <h4 className="font-bold text-[#D4A017] text-sm sm:text-base md:text-lg mb-2 flex items-center justify-between">
                    {service.title}
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] group-hover:translate-x-2 transition-transform" />
                  </h4>
                  <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            ))}

            {/* Image */}
            <div className="rounded-2xl overflow-hidden border-4 border-[#D4A017]/50">
              <img 
                src="https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=600&q=80" 
                alt="Individual Counseling"
                className="w-full h-40 sm:h-48 md:h-64 object-cover grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
