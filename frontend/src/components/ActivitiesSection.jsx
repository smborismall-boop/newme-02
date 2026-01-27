import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ActivitiesSection = () => {
  const activities = [
    {
      title: "Outbound Training",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
      link: "/services/class"
    },
    {
      title: "Coaching / Upscale Talent",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80",
      link: "/services/clinic"
    },
    {
      title: "Edukasi Bisnis",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80",
      link: "/kelas-gali-bakat"
    },
    {
      title: "Kontes Brand Ambassador",
      image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&q=80",
      link: "/shop"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#5A5A4A] via-[#4A4A3A] to-[#3A3A2A]" data-testid="activities-section">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-[#D4A017] bg-white/10 backdrop-blur-sm">
              <svg viewBox="0 0 50 50" className="w-5 h-5 sm:w-8 sm:h-8 text-[#D4A017]">
                <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
              <span className="text-[#D4A017]">KEGIATAN</span> - KEGIATAN
            </h2>
          </div>
          
          {/* NEWME Community Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A017] rounded-full flex items-center justify-center">
              <svg viewBox="0 0 50 50" className="w-5 h-5 sm:w-8 sm:h-8 text-[#5A5A4A]">
                <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm sm:text-base">NEWME</p>
              <p className="text-[#D4A017] text-xs sm:text-sm">Community</p>
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {activities.map((activity, index) => (
            <Link 
              key={index}
              to={activity.link}
              className="group"
              data-testid={`activity-card-${index}`}
            >
              <div className="bg-[#D4A017] rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={activity.image} 
                    alt={activity.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                
                {/* Title */}
                <div className="p-2 sm:p-3 md:p-4">
                  <h3 className="font-bold text-[#5A5A4A] text-center italic flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base">
                    <span className="line-clamp-1">{activity.title}</span>
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitiesSection;
