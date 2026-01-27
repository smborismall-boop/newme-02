import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  ClipboardCheck, 
  Award,
  CheckCircle,
  ArrowRight,
  Music,
  Palette,
  Trophy,
  BookOpen,
  Calculator,
  Globe
} from 'lucide-react';
import { kelasGaliBakat } from '../utils/mock';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const KelasGaliBakat = () => {
  const talentIcons = [Music, Palette, Trophy, BookOpen, Calculator, Globe];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            {kelasGaliBakat.title}
          </h1>
          <p className="text-2xl text-[#2a2a2a] font-semibold mb-4">
            {kelasGaliBakat.subtitle}
          </p>
          <p className="text-lg text-[#1a1a1a] max-w-3xl mx-auto">
            {kelasGaliBakat.description}
          </p>

          {/* Talent Icons */}
          <div className="flex justify-center flex-wrap gap-4 mt-12">
            {talentIcons.map((Icon, index) => (
              <div key={index} className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-[#1a1a1a]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Info */}
      <section className="py-20 bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 md:p-12 border border-yellow-400/20">
            <div className="flex items-start space-x-4 mb-6">
              <Sparkles className="w-10 h-10 text-yellow-400 flex-shrink-0" />
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">Tentang Program</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {kelasGaliBakat.purpose}
                </p>
              </div>
            </div>

            <div className="bg-yellow-400/10 rounded-xl p-6 mt-8 border border-yellow-400/30">
              <p className="text-gray-300">
                <span className="text-yellow-400 font-semibold">Program ini diselenggarakan</span> bekerjasama dengan institusi pendidikan swasta hingga negeri. 
                Sifat program berbentuk event, yang difasilitasi oleh pihak institusi sekolah, dari pembayaran hingga ruangan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Phases */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            PROYEK KELAS GALI BAKAT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {kelasGaliBakat.phases.map((phase, index) => {
              const icons = [Users, ClipboardCheck, Award];
              const Icon = icons[index];
              return (
                <Card key={index} className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-8 h-8 text-[#1a1a1a]" />
                    </div>
                    <CardTitle className="text-white text-xl">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{phase.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-[#1a1a1a] text-center mb-12">
            Mengapa perlu ikut kelas GALI BAKAT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kelasGaliBakat.benefits.map((benefit, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-[#1a1a1a] font-medium">{benefit}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-[#1a1a1a] p-8 rounded-2xl inline-block shadow-2xl">
              <p className="text-3xl font-bold text-yellow-400">
                SETIAP KITA JENIUS,<br />
                TERLEBIH SESUAI BAKAT ALAMI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Procedures */}
      <section className="py-20 bg-[#2a2a2a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            PROSEDUR PENDAMPINGAN PRODUK "KELAS"
          </h2>

          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-yellow-400/20">
            <h3 className="text-2xl font-bold text-yellow-400 mb-8">1. KELAS GALI BAKAT</h3>
            <div className="space-y-4">
              {kelasGaliBakat.procedures.map((procedure, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-[#2a2a2a] rounded-lg hover:bg-[#2a2a2a]/80 transition-colors">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#1a1a1a] font-bold">{index + 1}</span>
                  </div>
                  <p className="text-gray-300 font-medium">{procedure}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-yellow-400/10 to-transparent p-8 rounded-2xl border border-yellow-400/30">
            <h3 className="text-2xl font-bold text-yellow-400 mb-4">2. KELAS OPTIMASI POTENSI</h3>
            <p className="text-gray-300 mb-4">
              Program lanjutan setelah Kelas Gali Bakat untuk mengoptimalkan potensi yang telah ditemukan.
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Diskusi dengan guru kurikulum</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Pemilihan ekstrakurikuler sesuai bakat</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Training mentor oleh NMC untuk guru</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Evaluasi berkala</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Kompetisi dan lomba</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-yellow-400" />
                <span>Reward dan Brand Ambassador NMC</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Tertarik dengan Program Kelas Gali Bakat?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Hubungi kami untuk informasi lebih lanjut atau daftarkan institusi Anda
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold px-8 py-6 text-lg rounded-xl shadow-lg">
                Hubungi Kami
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/newme-test">
              <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 px-8 py-6 text-lg rounded-xl">
                Coba Tes NMC
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KelasGaliBakat;