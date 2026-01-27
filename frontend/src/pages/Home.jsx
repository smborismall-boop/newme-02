import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* FREE TEST PROMO - TOPIK UTAMA */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#D4A017] via-[#C49515] to-[#B8900F]" data-testid="promo-section-main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center md:text-left">
              <span className="inline-block px-4 sm:px-6 py-2 bg-[#1a1a1a] text-[#D4A017] text-sm sm:text-base font-bold rounded-full mb-4 sm:mb-6 shadow-lg">
                GRATIS
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-4 sm:mb-6 leading-tight">
                5 Test Dasar<br />Gratis!
              </h2>
              <p className="text-[#1a1a1a]/80 mb-6 sm:mb-8 text-base sm:text-lg max-w-lg mx-auto md:mx-0">
                Daftar sekarang dan dapatkan akses ke 5 test dasar gratis untuk mengenal potensi diri Anda.
              </p>
              
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-left max-w-md mx-auto md:mx-0">
                {['Test Kepribadian Dasar', 'Test Minat Dasar', 'Test Bakat Dasar', 'Hasil Instant', 'Rekomendasi Pengembangan'].map((item, i) => (
                  <li key={i} className="flex items-center text-[#1a1a1a] text-sm sm:text-base font-medium">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 mr-3 flex-shrink-0" /> 
                    {item}
                  </li>
                ))}
              </ul>
              
              {!isLoggedIn && (
                <Link to="/register">
                  <Button 
                    size="lg"
                    className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto" 
                    data-testid="promo-cta-main"
                  >
                    Daftar & Mulai Test Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
              {isLoggedIn && (
                <Link to="/user-test">
                  <Button 
                    size="lg"
                    className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-8 sm:px-10 py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto" 
                    data-testid="promo-cta-test"
                  >
                    Mulai Test Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
            
            {/* Right Image */}
            <div className="hidden md:block relative">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-[#1a1a1a]/20 rounded-2xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1598162942982-5cb74331817c?w=600&q=80"
                  alt="Growth Mindset"
                  className="relative z-10 w-full max-w-md mx-auto rounded-2xl shadow-2xl border-4 border-[#1a1a1a]/20"
                />
                {/* Badge */}
                <div className="absolute -bottom-4 -right-4 bg-[#1a1a1a] text-[#D4A017] px-6 py-3 rounded-full shadow-xl z-20">
                  <p className="font-bold text-sm sm:text-base">100% GRATIS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Banner Slider Section (from database) - Only show if banners exist */}
      {banners.length > 0 && (
        <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden" data-testid="banner-slider">
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
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-12">
                <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2">{banner.title}</h2>
                {banner.description && (
                  <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-4 max-w-2xl line-clamp-2">{banner.description}</p>
                )}
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#D4A017] text-black hover:bg-[#B8900F] text-sm sm:text-base">
                      Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
          
          {banners.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#D4A017] text-white hover:text-black p-2 rounded-full transition-all"
                data-testid="banner-prev"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-[#D4A017] text-white hover:text-black p-2 rounded-full transition-all"
                data-testid="banner-next"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${index === currentSlide ? 'bg-[#D4A017] w-6 sm:w-8' : 'bg-white/50 hover:bg-white/70'}`}
                    data-testid={`banner-dot-${index}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Articles Section */}
      {articles.length > 0 && (
        <section className="py-12 sm:py-20 bg-[#2a2a2a]" data-testid="articles-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Artikel & Insight Terbaru
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Pelajari lebih dalam tentang kepribadian, bakat, dan pengembangan diri.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {articles.map((article) => (
                <Link 
                  key={article._id} 
                  to={`/articles/${article._id}`}
                  className="group"
                  data-testid={`article-card-${article._id}`}
                >
                  <Card className="bg-[#1a1a1a] border-[#D4A017]/20 hover:border-[#D4A017]/50 transition-all h-full">
                    {article.featuredImage && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img 
                          src={article.featuredImage.startsWith('http') ? article.featuredImage : `${BACKEND_URL}${article.featuredImage}`}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs text-[#D4A017] bg-[#D4A017]/10 px-2 py-1 rounded">
                          {article.category}
                        </span>
                      </div>
                      <CardTitle className="text-white group-hover:text-[#D4A017] transition-colors line-clamp-2 text-base sm:text-lg">
                        {article.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <CardDescription className="text-gray-400 line-clamp-2 text-sm">
                        {article.excerpt}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-[#D4A017] text-sm">
                        Baca Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8 sm:mt-12">
              <Link to="/articles">
                <Button variant="outline" className="border-[#D4A017] text-[#D4A017] hover:bg-[#D4A017]/10 px-6 sm:px-8 py-3 sm:py-4" data-testid="articles-cta">
                  Lihat Semua Artikel
                  <BookOpen className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-[#D4A017] to-[#B8900F]" data-testid="cta-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
            Siap Menemukan Potensi Anda?
          </h2>
          <p className="text-[#1a1a1a]/80 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Bergabunglah dengan ribuan orang yang telah menemukan jati diri mereka bersama NEWME CLASS.
          </p>
          {isLoggedIn ? (
            <Link to="/user-test">
              <Button className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl" data-testid="cta-test-btn">
                Mulai Test Sekarang
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/register">
              <Button className="bg-[#1a1a1a] text-[#D4A017] hover:bg-[#2a2a2a] px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-xl" data-testid="cta-register-btn">
                Daftar Sekarang - GRATIS!
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
