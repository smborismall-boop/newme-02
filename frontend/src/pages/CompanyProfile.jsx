import React, { useState, useEffect } from 'react';
import { Building2, Target, Award, Users, CheckCircle, Star, Handshake, Briefcase } from 'lucide-react';
import { visiMisi, testimonials, clientBenefits } from '../utils/mock';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CompanyProfile = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  };

  // Get team data from settings or use defaults
  const boardOfDirectors = settings?.boardOfDirectors || [];
  const teamSupport = settings?.teamSupport || [];
  const partners = settings?.partners || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Header */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {settings?.logoUrl ? (
            <img 
              src={getImageUrl(settings.logoUrl)}
              alt={`${settings.siteName || 'NEWME CLASS'} Logo`}
              className="w-24 h-24 mx-auto object-contain mb-6"
              onError={(e) => {
                e.target.src = "/logo.png";
              }}
            />
          ) : (
            <img 
              src="/logo.png" 
              alt="NEWME CLASS Logo" 
              className="w-24 h-24 mx-auto object-contain mb-6"
            />
          )}
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-4">
            Company Profile
          </h1>
          <p className="text-2xl text-[#2a2a2a] font-semibold">
            {settings?.siteName || 'NEWME CLASS'}
          </p>
          <p className="text-lg text-[#2a2a2a]">
            {settings?.siteDescription || 'Kelas Peduli Talenta'}
          </p>
        </div>
      </section>

      {/* Siapa Kami */}
      <section className="py-20 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-8">
            <Building2 className="w-10 h-10 text-yellow-400" />
            <h2 className="text-4xl font-bold text-white">SIAPA KAMI?</h2>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-8 mb-8 border border-yellow-400/20">
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              <span className="text-yellow-400 font-semibold">{settings?.siteName || 'NEWME CLASS'}</span> adalah platform pengembangan diri dan talenta.
              Kami berkomitmen menjadikan usaha ini bukan hanya mencari keuntungan, tetapi juga membuat dampak nyata 
              dan menjadi investasi bagi klien.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#2a2a2a] p-6 rounded-xl">
                <h3 className="text-yellow-400 font-semibold text-xl mb-3">Lini Produk B2B</h3>
                <p className="text-gray-300">
                  Pendidikan, bimbingan belajar, dan training upscaling yang fokus pada pengembangan bakat dan potensi.
                </p>
              </div>
              <div className="bg-[#2a2a2a] p-6 rounded-xl">
                <h3 className="text-yellow-400 font-semibold text-xl mb-3">Lini Produk B2C</h3>
                <p className="text-gray-300">
                  Produk komunitas (merchandise, dll) yang dikembangkan melalui afiliasi dan strategi jejaring komunitas NEWME.
                </p>
              </div>
            </div>
          </div>

          {settings && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings.email && (
                <div className="bg-gradient-to-br from-yellow-400/10 to-transparent p-6 rounded-xl border border-yellow-400/30">
                  <p className="text-gray-400 text-sm mb-2">Email</p>
                  <a href={`mailto:${settings.email}`} className="text-yellow-400 text-xl font-bold hover:underline break-all">
                    {settings.email}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div className="bg-gradient-to-br from-yellow-400/10 to-transparent p-6 rounded-xl border border-yellow-400/30">
                  <p className="text-gray-400 text-sm mb-2">Telepon</p>
                  <a href={`tel:${settings.phone}`} className="text-yellow-400 text-xl font-bold hover:underline">
                    {settings.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Visi */}
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 p-8 rounded-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-10 h-10 text-[#1a1a1a]" />
                <h2 className="text-4xl font-bold text-[#1a1a1a]">VISI</h2>
              </div>
              <p className="text-[#1a1a1a] text-lg leading-relaxed">
                {visiMisi.visi}
              </p>
            </div>

            {/* Misi */}
            <div className="bg-[#2a2a2a] p-8 rounded-2xl border border-yellow-400/30">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-10 h-10 text-yellow-400" />
                <h2 className="text-4xl font-bold text-white">MISI</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                {visiMisi.misi}
              </p>
              <div className="bg-yellow-400/10 p-4 rounded-xl border border-yellow-400/30">
                <p className="text-yellow-400 font-semibold text-sm mb-2">Sub. MISI</p>
                <p className="text-gray-300">{visiMisi.subMisi}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Board of Directors */}
      {boardOfDirectors.length > 0 && (
        <section className="py-20 bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-12">
              <Briefcase className="w-10 h-10 text-yellow-400" />
              <h2 className="text-4xl font-bold text-white">BOARD OF DIRECTORS</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boardOfDirectors.map((member, index) => (
                <Card key={index} className="bg-[#1a1a1a] border-yellow-400/20 hover:border-yellow-400 transition-all overflow-hidden">
                  {member.photo && (
                    <div className="w-full h-56 overflow-hidden">
                      <img 
                        src={getImageUrl(member.photo)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {!member.photo && (
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-yellow-400 text-[#1a1a1a] text-xl font-bold">
                            {member.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                        <p className="text-yellow-400 text-sm font-semibold">{member.position}</p>
                      </div>
                    </div>
                  </CardHeader>
                  {member.description && (
                    <CardContent>
                      <p className="text-gray-400 text-sm">{member.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team Support */}
      {teamSupport.length > 0 && (
        <section className="py-20 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-12">
              <Users className="w-10 h-10 text-yellow-400" />
              <h2 className="text-4xl font-bold text-white">TEAM SUPPORT</h2>
            </div>

            <p className="text-gray-400 mb-12 text-lg">
              NEWMECLASS sebagai pionir dalam bidang ini berkomitmen untuk menjalankan operasional dengan standar kualitas terbaik.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teamSupport.map((member, index) => (
                <Card key={index} className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all overflow-hidden">
                  {member.photo && (
                    <div className="w-full h-56 overflow-hidden">
                      <img 
                        src={getImageUrl(member.photo)}
                        alt={member.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      {!member.photo && (
                        <Avatar className="w-16 h-16">
                          <AvatarFallback className="bg-yellow-400 text-[#1a1a1a] text-xl font-bold">
                            {member.name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <CardTitle className="text-white text-lg">{member.name}</CardTitle>
                        <p className="text-yellow-400 text-sm font-semibold">{member.position}</p>
                      </div>
                    </div>
                  </CardHeader>
                  {member.description && (
                    <CardContent>
                      <p className="text-gray-400 text-sm">{member.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mitra / Partners */}
      {partners.length > 0 && (
        <section className="py-20 bg-[#2a2a2a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Handshake className="w-10 h-10 text-yellow-400" />
                <h2 className="text-4xl font-bold text-white">MITRA - MITRA YAYASAN & KORPORASI</h2>
              </div>
              <div className="flex justify-center space-x-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {partners.map((partner, index) => (
                <div key={index} className="bg-[#1a1a1a] p-6 rounded-xl border border-yellow-400/20 hover:border-yellow-400 transition-all text-center">
                  {partner.photo ? (
                    <img 
                      src={getImageUrl(partner.photo)}
                      alt={partner.name}
                      className="w-20 h-20 mx-auto mb-4 object-contain rounded-lg"
                      onError={(e) => {
                        e.target.src = '';
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/10 rounded-full flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-yellow-400" />
                    </div>
                  )}
                  <p className="text-white font-medium">{partner.name}</p>
                  {partner.position && (
                    <p className="text-gray-400 text-sm mt-1">{partner.position}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Show default message if no team/partners data */}
      {boardOfDirectors.length === 0 && teamSupport.length === 0 && partners.length === 0 && !loading && (
        <section className="py-20 bg-[#1a1a1a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3 mb-12">
              <Users className="w-10 h-10 text-yellow-400" />
              <h2 className="text-4xl font-bold text-white">B.O.D & TEAM SUPPORT</h2>
            </div>
            <p className="text-gray-400 mb-12 text-lg">
              NEWMECLASS sebagai pionir dalam bidang ini berkomitmen untuk menjalankan operasional dengan standar kualitas terbaik.
            </p>
            <div className="text-center py-12 bg-[#2a2a2a] rounded-xl border border-yellow-400/20">
              <p className="text-gray-400">Informasi tim akan segera ditampilkan.</p>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            TANGGAPAN MITRA & KLIEN
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-[#2a2a2a] border-yellow-400/20">
                <CardHeader>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback className="bg-yellow-400 text-[#1a1a1a] text-lg font-bold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-white text-lg">{testimonial.name}</CardTitle>
                      <p className="text-gray-400 text-sm">{testimonial.institution}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Client Benefits */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#1a1a1a] text-center mb-12">
            APA YANG DITERIMA KLIEN
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clientBenefits.map((benefit, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-[#1a1a1a] font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompanyProfile;
