import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default slides (fallback)
  const defaultSlides = [
    {
      id: 1,
      title: "COMPANY PROFILE",
      subtitle: "NEWMECLASS",
      description: "Kami, perusahaan edukasi peduli minat bakat, yang berinovasi dengan tambahan strategi membangun jejaring komunitas.",
      badge: "Kelas Peduli Talenta",
      imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      ctaText: "www.newmeclass.com",
      ctaLink: "/"
    },
    {
      id: 2,
      title: "SIAPA KAMI?",
      subtitle: "PT. MITRA SEMESTA EDUCLASS",
      description: "NEWMECLASS adalah sebuah brand dan produk dari PT. MITRA SEMESTA EDUCLASS, yang bergerak dengan produk Edukasi dan Komunitas.",
      badge: "B to B & B to C",
      imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
      ctaText: "Pelajari Lebih Lanjut",
      ctaLink: "/company-profile"
    },
    {
      id: 3,
      title: "PRODUK USAHA",
      subtitle: "NIB: 2805240064989",
      description: "Berbagai produk dan layanan edukasi untuk pengembangan potensi diri dan bakat alami Anda.",
      badge: "Terdaftar Resmi",
      imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      ctaText: "Lihat Produk",
      ctaLink: "/shop"
    },
    {
      id: 4,
      title: "VISI & MISI",
      subtitle: "NEWME CLASS",
      description: "Menjadi bagian dari kemajuan bangsa lewat peran EDUKASI JATIDIRI di berbagai lembaga dan organisasi.",
      badge: "PT. MITRA SEMESTA EDUCLASS",
      imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
      ctaText: "Lihat Visi Misi",
      ctaLink: "/company-profile"
    }
  ];

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/website-content/hero-slides`);
        if (response.data && response.data.length > 0) {
          setSlides(response.data);
        } else {
          setSlides(defaultSlides);
        }
      } catch (error) {
        console.error('Failed to load slides:', error);
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    loadSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return (
      <section className="min-h-[500px] bg-gradient-to-br from-[#5A5A4A] via-[#4A4A3A] to-[#3A3A2A] flex items-center justify-center">
        <div className="text-[#D4A017] animate-pulse">Loading...</div>
      </section>
    );
  }

  return (
    <section 
      className="relative min-h-[600px] sm:min-h-[550px] md:min-h-[700px] overflow-hidden bg-gradient-to-br from-[#5A5A4A] via-[#4A4A3A] to-[#3A3A2A]"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      data-testid="hero-carousel"
    >
      {/* Decorative Elements - Hidden on mobile */}
      <div className="hidden sm:block absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <pattern id="diagonal-lines" patternUnits="userSpaceOnUse" width="10" height="10">
              <line x1="0" y1="0" x2="10" y2="10" stroke="#D4A017" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect fill="url(#diagonal-lines)" width="200" height="200"/>
        </svg>
      </div>

      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        const slideTitle = slide.title || '';
        
        return (
          <div
            key={slide._id || slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Mobile Layout - Image on top */}
            <div className="md:hidden flex flex-col items-center px-4 py-6 min-h-[600px]">
              {/* Mobile Image */}
              <div className="relative mb-6">
                {/* Badge */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-white rounded-full px-4 py-2 shadow-lg border-2 border-[#D4A017]">
                    <p className="text-xs font-semibold text-gray-800 italic whitespace-nowrap">- {slide.badge} -</p>
                  </div>
                </div>
                
                {/* Circular Image */}
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-[#D4A017] shadow-2xl mt-4">
                  <img 
                    src={slide.imageUrl} 
                    alt={slideTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -bottom-2 -right-2 w-16 h-16 border-2 border-[#D4A017] rounded-full opacity-50"></div>
              </div>
              
              {/* Mobile Content */}
              <div className="text-center space-y-3 flex-1">
                {/* Logo */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#D4A017] bg-white/10 backdrop-blur-sm">
                  <svg viewBox="0 0 50 50" className="w-5 h-5 text-[#D4A017]">
                    <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
                  </svg>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  <span className="text-[#D4A017]">{slideTitle.split(' ')[0]}</span>
                  {slideTitle.split(' ').length > 1 && (
                    <span className="text-white"> {slideTitle.split(' ').slice(1).join(' ')}</span>
                  )}
                </h1>
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  {slide.subtitle}
                </h2>
                
                {/* Description */}
                <p className="text-sm text-gray-200 leading-relaxed px-2">
                  {slide.description}
                </p>
                
                {/* CTA */}
                <a href={slide.ctaLink}>
                  <Button 
                    className="bg-[#D4A017] hover:bg-[#B8900F] text-black font-bold text-sm px-6 mt-2"
                    data-testid={`hero-cta-mobile-${index}`}
                  >
                    {slide.ctaText}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                
                {/* Contact Info */}
                <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs text-gray-300">
                  <span>newmeclass@gmail.com</span>
                  <span>•</span>
                  <span>@newmeclass</span>
                </div>
              </div>
            </div>

            {/* Desktop Layout - Side by side */}
            <div className="hidden md:grid md:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4 py-16 lg:py-20 min-h-[700px]">
              {/* Content */}
              <div className={`space-y-6 ${isActive ? 'animate-fade-in-up' : ''}`}>
                {/* Logo Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#D4A017] bg-white/10 backdrop-blur-sm">
                  <svg viewBox="0 0 50 50" className="w-10 h-10 text-[#D4A017]">
                    <path fill="currentColor" d="M25 5 L35 15 L35 25 L25 35 L15 25 L15 15 Z M20 18 Q25 12 30 18 Q35 24 25 30 Q15 24 20 18"/>
                  </svg>
                </div>
                
                {/* Title */}
                <div>
                  <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                    <span className="text-[#D4A017]">{slideTitle.split(' ')[0]}</span>
                    {slideTitle.split(' ').length > 1 && (
                      <span className="text-white"> {slideTitle.split(' ').slice(1).join(' ')}</span>
                    )}
                  </h1>
                  <h2 className="text-2xl lg:text-3xl font-semibold text-white mt-2">
                    {slide.subtitle}
                  </h2>
                </div>
                
                {/* Description */}
                <p className="text-lg text-gray-200 max-w-lg leading-relaxed">
                  {slide.description}
                </p>
                
                {/* CTA */}
                <div className="pt-4">
                  <a href={slide.ctaLink}>
                    <Button 
                      size="lg" 
                      className="bg-[#D4A017] hover:bg-[#B8900F] text-black font-bold"
                      data-testid={`hero-cta-${index}`}
                    >
                      {slide.ctaText}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap gap-6 pt-4 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4A017] rounded-full"></span>
                    <span>newmeclass@gmail.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4A017] rounded-full"></span>
                    <span>@newmeclass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#D4A017] rounded-full"></span>
                    <span>0895.0267.1691</span>
                  </div>
                </div>
              </div>
              
              {/* Desktop Image */}
              <div className={`relative ${isActive ? 'animate-fade-in-right' : ''}`}>
                <div className="relative">
                  {/* Badge */}
                  <div className="absolute -top-4 right-8 z-20">
                    <div className="bg-white rounded-full px-6 py-3 shadow-xl border-4 border-[#D4A017]">
                      <p className="text-sm font-semibold text-gray-800 italic">- {slide.badge} -</p>
                    </div>
                  </div>
                  
                  {/* Main Image Container */}
                  <div className="relative z-10 rounded-full overflow-hidden w-72 h-72 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto border-4 border-[#D4A017] shadow-2xl">
                    <img 
                      src={slide.imageUrl} 
                      alt={slideTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#5A5A4A]/50 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Decorative Circle */}
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 border-4 border-[#D4A017] rounded-full opacity-50"></div>
                  <div className="absolute -top-8 -left-8 w-24 h-24 border-4 border-[#D4A017] rounded-full opacity-30"></div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-[#D4A017] text-white hover:text-black rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-[#D4A017]/50 hover:border-[#D4A017]"
        data-testid="hero-prev-btn"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-[#D4A017] text-white hover:text-black rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-[#D4A017]/50 hover:border-[#D4A017]"
        data-testid="hero-next-btn"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      
      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 sm:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-8 sm:w-10 h-2 sm:h-3 bg-[#D4A017]' 
                : 'w-2 sm:w-3 h-2 sm:h-3 bg-white/50 hover:bg-white/70'
            }`}
            data-testid={`hero-dot-${index}`}
          />
        ))}
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-gradient-to-r from-[#D4A017] to-[#F4C430] transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>
    </section>
  );
};

export default HeroCarousel;
