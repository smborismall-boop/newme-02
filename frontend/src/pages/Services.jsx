import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import { services } from '../utils/mock';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const Services = () => {
  const { serviceId } = useParams();
  const service = services.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Layanan Tidak Ditemukan</h1>
          <Link to="/">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const IconComponent = require('lucide-react')[service.icon];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center text-[#1a1a1a] hover:text-[#2a2a2a] mb-8 font-semibold">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
          
          <div className="flex items-center space-x-6 mb-6">
            <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center shadow-2xl">
              <IconComponent className="w-12 h-12 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a]">
                {service.name}
              </h1>
              <p className="text-xl text-[#2a2a2a] mt-2">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Fitur & Layanan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.features.map((feature, index) => (
              <Card key={index} className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-yellow-400" />
                    <span>{feature}</span>
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details based on type */}
      <section className="py-20 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {serviceId === 'clinic' && (
            <div className="space-y-8">
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-yellow-400/20">
                <h3 className="text-3xl font-bold text-white mb-6">Tentang NEWME CLINIC</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  NEWME CLINIC adalah layanan konsultasi personal yang membantu Anda dalam pengembangan diri dan perencanaan karir. 
                  Kami menyediakan pendampingan profesional untuk memaksimalkan potensi Anda.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#2a2a2a] p-6 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-xl mb-3">Sesi Konsultasi</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Durasi: 60-90 menit per sesi</li>
                      <li>• Online atau offline</li>
                      <li>• Dengan psikolog profesional</li>
                    </ul>
                  </div>
                  <div className="bg-[#2a2a2a] p-6 rounded-xl">
                    <h4 className="text-yellow-400 font-semibold text-xl mb-3">Topik Konsultasi</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Pengembangan karir</li>
                      <li>• Pemilihan jurusan</li>
                      <li>• Manajemen stress</li>
                      <li>• Life coaching</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {serviceId === 'class' && (
            <div className="space-y-8">
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-yellow-400/20">
                <h3 className="text-3xl font-bold text-white mb-6">Program Kelas</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  NEWME CLASS menawarkan berbagai program kelas untuk menggali dan mengoptimalkan potensi Anda.
                </p>
                <div className="space-y-4">
                  <Card className="bg-[#2a2a2a] border-yellow-400/20">
                    <CardHeader>
                      <CardTitle className="text-white">Kelas Gali Bakat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 mb-4">Program observasi untuk menemukan bakat alami siswa</p>
                      <Link to="/kelas-gali-bakat">
                        <Button className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold">
                          Pelajari Lebih Lanjut
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {serviceId === 'gallery' && (
            <div className="space-y-8">
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-yellow-400/20 text-center">
                <h3 className="text-3xl font-bold text-white mb-6">NEWME GALLERY</h3>
                <p className="text-gray-300 text-lg mb-8">
                  Dokumentasi kegiatan, testimoni, dan portfolio peserta program NEWME CLASS
                </p>
                <p className="text-yellow-400 text-xl font-semibold">
                  Galeri foto dan video akan segera hadir
                </p>
              </div>
            </div>
          )}

          {serviceId === 'net' && (
            <div className="space-y-8">
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-yellow-400/20">
                <h3 className="text-3xl font-bold text-white mb-6">NEWME NET - Komunitas & Jaringan</h3>
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  NEWME NET adalah platform networking yang menghubungkan member, mitra, dan merchant dalam ekosistem NEWME Community.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
                    <h4 className="text-yellow-400 font-semibold text-lg mb-3">Member Community</h4>
                    <p className="text-gray-400 text-sm">Akses eksklusif untuk peserta program NEWME</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
                    <h4 className="text-yellow-400 font-semibold text-lg mb-3">Networking Events</h4>
                    <p className="text-gray-400 text-sm">Pertemuan rutin dan acara khusus member</p>
                  </div>
                  <div className="bg-[#2a2a2a] p-6 rounded-xl text-center">
                    <h4 className="text-yellow-400 font-semibold text-lg mb-3">Merchant Partners</h4>
                    <p className="text-gray-400 text-sm">Diskon dan benefit dari mitra NEWME</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">
            Tertarik dengan {service.title}?
          </h2>
          <p className="text-xl text-[#2a2a2a] mb-8">
            Hubungi kami untuk informasi lebih lanjut
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-[#1a1a1a] hover:bg-[#2a2a2a] text-yellow-400 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl">
                Hubungi Kami
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/newme-test">
              <Button variant="outline" className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a]/10 px-8 py-6 text-lg rounded-xl">
                Mulai Tes NMC
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;