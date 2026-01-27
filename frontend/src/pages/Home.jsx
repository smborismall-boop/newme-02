import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Sparkles,
  BookOpen,
  Award,
  Building2,
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap,
  Star,
  Play
} from 'lucide-react';
import { services, jalurLembaga, jalurPribadi } from '../utils/mock';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { bannersAPI, articlesAPI } from '../services/api';
import PopupBanner from '../components/PopupBanner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);

  // Hero Slides Data - Static content for attractive slider
  const heroSlides = [
    {
      id: 1,
      title: "Temukan Jatidiri",
      highlight: "Terbaikmu",
      subtitle: "Kenali potensi tersembunyi dalam dirimu dengan sistem 5 Element yang akurat",
      icon: Brain,
      color: "yellow",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      stats: { users: "5000+", rating: "4.9", accuracy: "98%" }
    },
    {
      id: 2,
      title: "Analisis AI",
      highlight: "Mendalam",
      subtitle: "Dapatkan insight kepribadian dengan teknologi kecerdasan buatan terkini",
      icon: Sparkles,
      color: "blue",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
      stats: { users: "5000+", rating: "4.9", accuracy: "98%" }
    },
    {
      id: 3,
      title: "Raih Potensi",
      highlight: "Maksimal",
      subtitle: "Panduan karir dan pengembangan diri sesuai dengan jatidirimu",
      icon: Target,
      color: "green",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
      stats: { users: "5000+", rating: "4.9", accuracy: "98%" }
    },
    {
      id: 4,
      title: "Sertifikat",
      highlight: "Profesional",
      subtitle: "Dapatkan sertifikat analisis kepribadian resmi dari NEWME CLASS",
      icon: Award,
      color: "purple",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
      stats: { users: "5000+", rating: "4.9", accuracy: "98%" }
    }
  ];

  // Auto-play hero slider
  useEffect(() => {
    if (!isHeroAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHeroAutoPlaying, heroSlides.length]);

  const nextHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevHeroSlide = useCallback(() => {
    setCurrentHeroSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    loadBanners();
    loadArticles();
    loadSettings();
    checkLoginStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await articlesAPI.getAll({ isPublished: true, limit: 3 });
      setArticles(response.data || []);
    } catch (error) {
      console.error('Failed to load articles');
    }
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.getAll({ type: 'slider', isActive: true });
      setBanners(response.data);
    } catch (error) {
      console.error('Failed to load banners');
    }
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('user_token');
    const user = localStorage.getItem('user_data');
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Popup Banner */}
      <PopupBanner />

      {/* NEW: Attractive Hero Slider */}
      <section 
        className="relative min-h-[600px] md:min-h-[700px] overflow-hidden"
        onMouseEnter={() => setIsHeroAutoPlaying(false)}
        onMouseLeave={() => setIsHeroAutoPlaying(true)}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-purple-500/10 animate-pulse"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Slides */}
        {heroSlides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = index === currentHeroSlide;
          
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[600px] md:min-h-[700px]">
                {/* Content */}
                <div className={`space-y-6 ${isActive ? 'animate-fade-in-up' : ''}`}>
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">NEWME CLASS</span>
                  </div>
                  
                  {/* Title */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                    {slide.title}{' '}
                    <span className="relative inline-block">
                      <span className="text-yellow-400">{slide.highlight}</span>
                      <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                        <path d="M2 10C50 2 150 2 198 10" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-lg md:text-xl text-gray-300 max-w-lg leading-relaxed">
                    {slide.subtitle}
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link to="/register">
                      <Button size="lg" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold group w-full sm:w-auto">
                        Mulai Sekarang 
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link to="/user-test">
                      <Button size="lg" variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 w-full sm:w-auto">
                        <Play className="mr-2 h-5 w-5" />
                        Coba Test Gratis
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-8 pt-6 border-t border-gray-700/50">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-yellow-400">{slide.stats.users}</p>
                      <p className="text-gray-400 text-sm">Pengguna</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                        {slide.stats.rating} <Star className="w-5 h-5 fill-yellow-400" />
                      </p>
                      <p className="text-gray-400 text-sm">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-yellow-400">{slide.stats.accuracy}</p>
                      <p className="text-gray-400 text-sm">Akurasi AI</p>
                    </div>
                  </div>
                </div>
                
                {/* Image */}
                <div className={`relative hidden md:block ${isActive ? 'animate-fade-in-right' : ''}`}>
                  <div className="relative">
                    {/* Main Image */}
                    <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-yellow-400/20">
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-[450px] object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 via-transparent to-transparent"></div>
                    </div>
                    
                    {/* Floating Card 1 */}
                    <div className="absolute -bottom-4 -left-4 bg-[#2a2a2a]/95 backdrop-blur-md border border-yellow-400/30 rounded-xl p-4 shadow-xl z-20 animate-float">
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
                    
                    {/* Floating Card 2 */}
                    <div className="absolute -top-4 -right-4 bg-[#2a2a2a]/95 backdrop-blur-md border border-yellow-400/30 rounded-xl p-4 shadow-xl z-20 animate-float animation-delay-1000">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Terpercaya</p>
                          <p className="text-gray-400 text-sm">5 Element System</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-400/30 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-8 left-8 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Navigation Arrows */}
        <button 
          onClick={prevHeroSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-[#2a2a2a]/80 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-gray-700 hover:border-yellow-400 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={nextHeroSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-[#2a2a2a]/80 hover:bg-yellow-400 text-white hover:text-black rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border border-gray-700 hover:border-yellow-400 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentHeroSlide 
                  ? 'w-10 h-3 bg-yellow-400' 
                  : 'w-3 h-3 bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-30">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
            style={{ width: `${((currentHeroSlide + 1) / heroSlides.length) * 100}%` }}
          ></div>
        </div>
      </section>

      {/* Banner Slider Section (from database) */}
      {banners.length > 0 && (
        <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a]/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">{banner.title}</h2>
                {banner.description && (
                  <p className="text-gray-300 text-lg mb-4 max-w-2xl">{banner.description}</p>
                )}
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                      Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {/* Slider Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block mb-6">
            {settings?.logoUrl ? (
              <img 
                src={`${BACKEND_URL}${settings.logoUrl}`}
                alt={settings.siteName || "NEWME CLASS Logo"}
                className="w-32 h-32 mx-auto object-contain animate-pulse"
                onError={(e) => {
                  e.target.src = "/logo.png";
                }}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="NEWME CLASS Logo" 
                className="w-32 h-32 mx-auto object-contain animate-pulse"
              />
            )}
          </div>
          
          {isLoggedIn && userData ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Selamat Datang Kembali!
              </h1>
              <p className="text-2xl text-yellow-400 mb-4">{userData.fullName}</p>
              <p className="text-lg text-gray-400 mb-8">
                Lanjutkan perjalanan menemukan potensi diri Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/dashboard">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold px-8 py-6 text-lg rounded-xl">
                    Dashboard Saya
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/user-test">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-8 py-6 text-lg rounded-xl">
                    Mulai Test
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                Selamat Berinteraksi
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
                Kelas Peduli Talenta
              </p>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Temukan potensi tersembunyi Anda bersama NEWME CLASS. 
                Kami hadir untuk membantu Anda mengenal jati diri dan mengoptimalkan bakat alami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link to="/register">
                  <Button className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-yellow-400/30 transition-all hover:scale-105">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105">
                    Sudah Punya Akun? Login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Social & Referral Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mt-8">
            <div className="flex items-center space-x-2">
              <span>Email:</span>
              <a href="mailto:newmeclass@gmail.com" className="text-yellow-400 hover:underline">
                newmeclass@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span>Instagram:</span>
              <a href="https://instagram.com/newmeclass" className="text-yellow-400 hover:underline">
                @newmeclass
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Free Test Promo Section */}
      <section className="py-16 bg-gradient-to-r from-yellow-400/10 to-yellow-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2a2a2a] rounded-2xl p-8 md:p-12 border border-yellow-400/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-1 bg-yellow-400 text-black text-sm font-semibold rounded-full mb-4">
                  GRATIS
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  5 Test Dasar Gratis!
                </h2>
                <p className="text-gray-400 mb-6">
                  Daftar sekarang dan dapatkan akses ke 5 test dasar gratis untuk mengenal potensi diri Anda. 
                  Setelah itu, lanjutkan ke test lengkap untuk hasil yang lebih komprehensif.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Test Kepribadian Dasar
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Test Minat Dasar
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Test Bakat Dasar
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Hasil Instant
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-2" /> Rekomendasi Pengembangan
                  </li>
                </ul>
                {!isLoggedIn && (
                  <Link to="/register">
                    <Button className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-4 text-lg">
                      Daftar & Mulai Test Gratis
                    </Button>
                  </Link>
                )}
              </div>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1598162942982-5cb74331817c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxwZXJzb25hbGl0eSUyMHNlbGYlMjBkaXNjb3ZlcnklMjBncm93dGglMjBtaW5kc2V0fGVufDB8fHx8MTc2OTM4ODM5OHww&ixlib=rb-4.1.0&q=85"
                  alt="Growth Mindset"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-xl border border-yellow-400/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mengapa <span className="text-yellow-400">NEWME CLASS</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Kami menggunakan pendekatan holistik untuk membantu Anda menemukan dan mengembangkan potensi terbaik.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a1a] border-yellow-400/20 hover:border-yellow-400/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Tes Akurat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Metode pengujian yang telah teruji dan dikembangkan oleh para ahli psikologi.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-yellow-400/20 hover:border-yellow-400/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Konsultasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Dapatkan bimbingan personal dari konselor berpengalaman untuk pengembangan diri.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-yellow-400/20 hover:border-yellow-400/50 transition-all">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Pengembangan Berkelanjutan</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Program pengembangan yang terstruktur untuk memaksimalkan potensi Anda.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Layanan <span className="text-yellow-400">Kami</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Berbagai layanan untuk memenuhi kebutuhan pengembangan potensi Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link key={index} to={service.link}>
                <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all h-full group cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-yellow-400 transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Artikel & Insight Terbaru
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Pelajari lebih dalam tentang kepribadian, bakat, dan pengembangan diri melalui artikel-artikel pilihan kami.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link 
                  key={article._id} 
                  to={`/articles/${article._id}`}
                  className="group"
                >
                  <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all h-full group-hover:transform group-hover:scale-105 duration-300">
                    {article.featuredImage && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={article.featuredImage.startsWith('http') ? article.featuredImage : `${BACKEND_URL}${article.featuredImage}`}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(article.createdAt).toLocaleDateString('id-ID', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-yellow-400 text-sm group-hover:translate-x-2 transition-transform">
                        Baca Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/articles">
                <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-8 py-4">
                  Lihat Semua Artikel
                  <BookOpen className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
            Siap Menemukan Potensi Anda?
          </h2>
          <p className="text-[#1a1a1a]/80 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang yang telah menemukan jati diri mereka bersama NEWME CLASS.
          </p>
          {isLoggedIn ? (
            <Link to="/user-test">
              <Button className="bg-[#1a1a1a] text-yellow-400 hover:bg-[#2a2a2a] px-8 py-6 text-lg rounded-xl">
                Mulai Test Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="bg-[#1a1a1a] text-yellow-400 hover:bg-[#2a2a2a] px-8 py-6 text-lg rounded-xl">
                Daftar Sekarang - GRATIS!
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
