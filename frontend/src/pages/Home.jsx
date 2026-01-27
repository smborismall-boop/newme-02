import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Target, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  BookOpen,
  Award,
  ChevronLeft,
  ChevronRight,
  Star,
  Play
} from 'lucide-react';
import { services } from '../utils/mock';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { bannersAPI, articlesAPI } from '../services/api';
import PopupBanner from '../components/PopupBanner';
import HeroCarousel from '../components/HeroCarousel';
import AboutSection from '../components/AboutSection';
import ProductSlider from '../components/ProductSlider';
import ServicesSection from '../components/ServicesSection';
import TestimonialSlider from '../components/TestimonialSlider';
import BenefitsSection from '../components/BenefitsSection';
import ActivitiesSection from '../components/ActivitiesSection';
import VisiMisiSection from '../components/VisiMisiSection';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
  const [banners, setBanners] = useState([]);
  const [articles, setArticles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [settings, setSettings] = useState(null);

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
    <div className="min-h-screen bg-[#1a1a1a]" data-testid="home-page">
      {/* Popup Banner */}
      <PopupBanner />

      {/* NEW: Hero Carousel sesuai desain Canva */}
      <HeroCarousel />

      {/* About Section - Siapa Kami */}
      <AboutSection />

      {/* Product Slider */}
      <ProductSlider />

      {/* Services Section - Produk Jasa */}
      <ServicesSection />

      {/* Testimonial Slider */}
      <TestimonialSlider />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Activities Section */}
      <ActivitiesSection />

      {/* Visi Misi Section */}
      <VisiMisiSection />

      {/* Banner Slider Section (from database) */}
      {banners.length > 0 && (
        <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden" data-testid="banner-slider">
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
                    <Button className="bg-[#D4A017] text-black hover:bg-[#B8900F]">
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
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#D4A017] text-white hover:text-black p-2 rounded-full transition-all"
                data-testid="banner-prev"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#D4A017] text-white hover:text-black p-2 rounded-full transition-all"
                data-testid="banner-next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-[#D4A017] w-8' : 'bg-white/50 hover:bg-white/70'}`}
                    data-testid={`banner-dot-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Welcome Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a]" data-testid="welcome-section">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A017]/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-block mb-6">
            {settings?.logoUrl ? (
              <img 
                src={`${BACKEND_URL}${settings.logoUrl}`}
                alt={settings.siteName || "NEWME CLASS Logo"}
                className="w-32 h-32 mx-auto object-contain"
                onError={(e) => {
                  e.target.src = "/logo.png";
                }}
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="NEWME CLASS Logo" 
                className="w-32 h-32 mx-auto object-contain"
              />
            )}
          </div>
          
          {isLoggedIn && userData ? (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Selamat Datang Kembali!
              </h1>
              <p className="text-2xl text-[#D4A017] mb-4">{userData.fullName}</p>
              <p className="text-lg text-gray-400 mb-8">
                Lanjutkan perjalanan menemukan potensi diri Anda
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/dashboard">
                  <Button className="bg-[#D4A017] hover:bg-[#B8900F] text-[#1a1a1a] font-semibold px-8 py-6 text-lg rounded-xl" data-testid="dashboard-btn">
                    Dashboard Saya
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/user-test">
                  <Button variant="outline" className="border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10 px-8 py-6 text-lg rounded-xl" data-testid="test-btn">
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
                  <Button className="bg-[#D4A017] hover:bg-[#B8900F] text-[#1a1a1a] font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#D4A017]/30 transition-all hover:scale-105" data-testid="register-btn">
                    Daftar Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10 px-8 py-6 text-lg rounded-xl transition-all hover:scale-105" data-testid="login-btn">
                    Sudah Punya Akun? Login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Social & Contact Info */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400 mt-8">
            <div className="flex items-center space-x-2">
              <span>Email:</span>
              <a href="mailto:newmeclass@gmail.com" className="text-[#D4A017] hover:underline">
                newmeclass@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <span>Instagram:</span>
              <a href="https://instagram.com/newmeclass" className="text-[#D4A017] hover:underline">
                @newmeclass
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Free Test Promo Section */}
      <section className="py-16 bg-gradient-to-r from-[#D4A017]/10 to-[#D4A017]/5" data-testid="promo-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#2a2a2a] rounded-2xl p-8 md:p-12 border border-[#D4A017]/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-4 py-1 bg-[#D4A017] text-black text-sm font-semibold rounded-full mb-4">
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
                    <Button className="bg-[#D4A017] text-black hover:bg-[#B8900F] px-8 py-4 text-lg" data-testid="promo-cta">
                      Daftar & Mulai Test Gratis
                    </Button>
                  </Link>
                )}
              </div>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1598162942982-5cb74331817c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxwZXJzb25hbGl0eSUyMHNlbGYlMjBkaXNjb3ZlcnklMjBncm93dGglMjBtaW5kc2V0fGVufDB8fHx8MTc2OTM4ODM5OHww&ixlib=rb-4.1.0&q=85"
                  alt="Growth Mindset"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-xl border border-[#D4A017]/20"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-[#2a2a2a]" data-testid="value-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Mengapa <span className="text-[#D4A017]">NEWME CLASS</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Kami menggunakan pendekatan holistik untuk membantu Anda menemukan dan mengembangkan potensi terbaik.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-[#1a1a1a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all" data-testid="value-card-1">
              <CardHeader>
                <div className="w-14 h-14 bg-[#D4A017]/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-[#D4A017]" />
                </div>
                <CardTitle className="text-white">Tes Akurat</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Metode pengujian yang telah teruji dan dikembangkan oleh para ahli psikologi.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all" data-testid="value-card-2">
              <CardHeader>
                <div className="w-14 h-14 bg-[#D4A017]/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-[#D4A017]" />
                </div>
                <CardTitle className="text-white">Konsultasi Pribadi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Dapatkan bimbingan personal dari konselor berpengalaman untuk pengembangan diri.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all" data-testid="value-card-3">
              <CardHeader>
                <div className="w-14 h-14 bg-[#D4A017]/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-[#D4A017]" />
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

      {/* Services Cards Section */}
      <section className="py-20 bg-[#1a1a1a]" data-testid="services-cards-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Layanan <span className="text-[#D4A017]">Kami</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Berbagai layanan untuk memenuhi kebutuhan pengembangan potensi Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Link key={index} to={service.link} data-testid={`service-card-${index}`}>
                <Card className="bg-[#2a2a2a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all h-full group cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-white group-hover:text-[#D4A017] transition-colors">
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
        <section className="py-20 bg-[#2a2a2a]" data-testid="articles-section">
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
                  data-testid={`article-card-${article._id}`}
                >
                  <Card className="bg-[#1a1a1a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all h-full group-hover:transform group-hover:scale-105 duration-300">
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
                        <span className="text-xs text-[#D4A017] bg-[#D4A017]/10 px-2 py-1 rounded">
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
                      <CardTitle className="text-white group-hover:text-[#D4A017] transition-colors line-clamp-2">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-[#D4A017] text-sm group-hover:translate-x-2 transition-transform">
                        Baca Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/articles">
                <Button variant="outline" className="border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10 px-8 py-4" data-testid="articles-cta">
                  Lihat Semua Artikel
                  <BookOpen className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#D4A017] to-[#B8900F]" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
            Siap Menemukan Potensi Anda?
          </h2>
          <p className="text-[#1a1a1a]/80 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan orang yang telah menemukan jati diri mereka bersama NEWME CLASS.
          </p>
          {isLoggedIn ? (
            <Link to="/user-test">
              <Button className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-8 py-6 text-lg rounded-xl" data-testid="cta-test-btn">
                Mulai Test Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-8 py-6 text-lg rounded-xl" data-testid="cta-register-btn">
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
