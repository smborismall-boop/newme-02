import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, BACKEND_URL } from "@/App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Award, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Star, Brain, Target, Zap } from "lucide-react";

const HomePage = () => {
  const [settings, setSettings] = useState(null);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Hero Slider Data
  const heroSlides = [
    {
      id: 1,
      title: "Temukan Talenta Terbaikmu",
      subtitle: "Kenali potensi tersembunyi dalam dirimu dengan sistem 5 Element",
      highlight: "Talenta",
      icon: Brain,
      gradient: "from-yellow-400/20 via-transparent to-purple-500/20",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
    },
    {
      id: 2,
      title: "Analisis AI Mendalam",
      subtitle: "Dapatkan insight kepribadian dengan teknologi kecerdasan buatan",
      highlight: "AI",
      icon: Sparkles,
      gradient: "from-blue-400/20 via-transparent to-yellow-500/20",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
    },
    {
      id: 3,
      title: "Raih Potensi Maksimal",
      subtitle: "Panduan karir dan pengembangan diri sesuai jatidirimu",
      highlight: "Maksimal",
      icon: Target,
      gradient: "from-green-400/20 via-transparent to-yellow-500/20",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
    },
    {
      id: 4,
      title: "Sertifikat Profesional",
      subtitle: "Dapatkan sertifikat analisis kepribadian resmi dari NEWME CLASS",
      highlight: "Profesional",
      icon: Award,
      gradient: "from-purple-400/20 via-transparent to-yellow-500/20",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    fetchSettings();
    fetchBanners();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
      // Update document title for SEO
      if (response.data.siteTitle) {
        document.title = response.data.siteTitle;
      }
      // Update meta description
      if (response.data.seoMetaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = response.data.seoMetaDescription;
      }
      // Update meta keywords
      if (response.data.seoKeywords) {
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
          metaKeywords = document.createElement('meta');
          metaKeywords.name = 'keywords';
          document.head.appendChild(metaKeywords);
        }
        metaKeywords.content = response.data.seoKeywords;
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/banners?isActive=true`);
      setBanners(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {settings?.logoUrl && (
              <img src={`${BACKEND_URL}${settings.logoUrl}`} alt="Logo" className="h-10" />
            )}
            <h1 className="text-2xl font-bold text-yellow-400">{settings?.siteName || 'NEWME CLASS'}</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/test" className="text-gray-300 hover:text-yellow-400 transition">NEWME Test</Link>
            <Link to="/admin/login" className="text-gray-300 hover:text-yellow-400 transition">Admin</Link>
          </nav>
        </div>
      </header>

      {/* Hero Slider Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Animation */}
        <div className={`absolute inset-0 bg-gradient-to-br ${heroSlides[currentSlide].gradient} transition-all duration-1000`}></div>
        
        {/* Slider Container */}
        <div 
          className="relative min-h-[600px] md:min-h-[700px]"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Slides */}
          {heroSlides.map((slide, index) => {
            const Icon = slide.icon;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 translate-x-0' 
                    : index < currentSlide 
                      ? 'opacity-0 -translate-x-full' 
                      : 'opacity-0 translate-x-full'
                }`}
              >
                <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center min-h-[600px] md:min-h-[700px]">
                  {/* Content */}
                  <div className={`space-y-6 ${index === currentSlide ? 'animate-fade-in-up' : ''}`}>
                    <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2">
                      <Icon className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 text-sm font-medium">NEWME CLASS</span>
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                      {slide.title.split(slide.highlight)[0]}
                      <span className="text-yellow-400 relative">
                        {slide.highlight}
                        <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                          <path d="M2 10C50 2 150 2 198 10" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"/>
                        </svg>
                      </span>
                      {slide.title.split(slide.highlight)[1]}
                    </h2>
                    
                    <p className="text-xl text-gray-300 max-w-lg">
                      {slide.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <Link to="/test">
                        <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold group">
                          Mulai Test Gratis 
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to="/register">
                        <Button size="lg" variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10">
                          Daftar Sekarang
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-8 pt-8">
                      <div>
                        <p className="text-3xl font-bold text-yellow-400">5000+</p>
                        <p className="text-gray-400 text-sm">Pengguna Aktif</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-yellow-400">4.9</p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Rating
                        </p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-yellow-400">100%</p>
                        <p className="text-gray-400 text-sm">Akurat AI</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image */}
                  <div className={`relative ${index === currentSlide ? 'animate-fade-in-right' : ''}`}>
                    <div className="relative z-10">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl shadow-2xl"
                      />
                      {/* Floating Card */}
                      <div className="absolute -bottom-6 -left-6 bg-gray-800/90 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-4 shadow-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                            <Zap className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Hasil Instan</p>
                            <p className="text-gray-400 text-sm">Analisis AI real-time</p>
                          </div>
                        </div>
                      </div>
                      {/* Decorative Elements */}
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl"></div>
                      <div className="absolute -bottom-8 right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-800/80 hover:bg-yellow-400 text-white hover:text-gray-900 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-gray-700 hover:border-yellow-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-gray-800/80 hover:bg-yellow-400 text-white hover:text-gray-900 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-gray-700 hover:border-yellow-400"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          {/* Dots Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'w-8 h-3 bg-yellow-400' 
                    : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
            <div 
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${((currentSlide + 1) / heroSlides.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Banners */}
      {banners.length > 0 && (
        <section className="py-12 px-4 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((banner) => (
                <Card key={banner._id} className="bg-gray-700 border-gray-600 overflow-hidden">
                  {banner.imageUrl && (
                    <img 
                      src={`${BACKEND_URL}${banner.imageUrl}`} 
                      alt={banner.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white">{banner.title}</h3>
                    {banner.description && (
                      <p className="text-gray-400 mt-2">{banner.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-white mb-12">Mengapa NEWME Test?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Test Gratis</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Coba test dasar gratis untuk mengenal potensi dirimu tanpa perlu bayar apapun.
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Award className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Analisis Mendalam</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Dapatkan analisis lengkap dengan test premium yang mencakup semua aspek talenta.
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <Users className="h-12 w-12 text-yellow-400 mb-4" />
                <CardTitle className="text-white">Bimbingan Expert</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                Konsultasi dengan ahli untuk memaksimalkan potensi dan bakat yang kamu miliki.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-500 to-yellow-400">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Siap Menemukan Talentamu?</h3>
          <p className="text-gray-800 mb-8 text-lg">Mulai dengan test gratis atau langsung ke test premium untuk hasil lebih lengkap.</p>
          <Link to="/test">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">
            {settings?.address}<br />
            Email: {settings?.email} | WhatsApp: {settings?.phone}
          </p>
          <p className="text-gray-500 mt-4">
            &copy; {new Date().getFullYear()} {settings?.siteName || 'NEWME CLASS'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
