import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const NewmeTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    recommenderId: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Mohon isi nama dan email Anda',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Import API service
      const { registrationAPI } = await import('../services/api');
      
      // Submit to backend
      const response = await registrationAPI.create({
        name: formData.name,
        email: formData.email,
        recommenderId: formData.recommenderId || null
      });

      toast({
        title: 'Pendaftaran Berhasil!',
        description: response.data.message || 'Data Anda telah tersimpan.',
      });

      // Proceed to next step
      setTimeout(() => {
        setStep(2);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan. Silakan coba lagi.';
      toast({
        title: 'Pendaftaran Gagal',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader className="text-center">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-white text-3xl">Pendaftaran Berhasil!</CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Terima kasih, {formData.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-[#1a1a1a] p-6 rounded-xl">
                <p className="text-gray-300 mb-4">
                  Anda telah terdaftar sebagai peserta NEWME Test. Sertifikat digital dan hasil observasi akan dikirimkan ke:
                </p>
                <p className="text-yellow-400 font-semibold text-lg">{formData.email}</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-400/10 to-transparent p-6 rounded-xl border border-yellow-400/30">
                <h3 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span>Catatan Penting:</span>
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Tes akan dimulai setelah pembayaran dikonfirmasi</li>
                  <li>• Durasi tes sekitar 30-45 menit</li>
                  <li>• Jawab dengan jujur sesuai kondisi Anda</li>
                  <li>• Hasil observasi akan tersedia dalam 2-3 hari kerja</li>
                  <li>• Anda akan menjadi member NEWME Community</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold py-6"
                  onClick={() => {
                    toast({
                      title: 'Fitur Segera Hadir',
                      description: 'Tes NMC akan segera tersedia',
                    });
                  }}
                >
                  Mulai Tes Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 py-6"
                  onClick={() => navigate('/')}
                >
                  Kembali ke Beranda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 shadow-2xl">
            <ClipboardList className="w-12 h-12 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            NEWME_TEST
          </h1>
          <p className="text-xl text-[#2a2a2a] max-w-3xl mx-auto">
            Observasi Mandiri untuk Mengenal Potensi dan Bakat Alami Anda
          </p>
        </div>
      </section>

      {/* Disclaimer & Form Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Disclaimer */}
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-2xl p-8 mb-12">
            <div className="flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-400 font-semibold text-xl mb-3">Disclaimer</h3>
                <p className="text-gray-300 leading-relaxed">
                  Untuk keakuratan hasil observasi dan kebutuhan jejaring komunitas NMC, sangat penting Anda mengisi data aktual 
                  (bukan berdasarkan KTP/informasi lain). Juga centang yang paling cocok untuk diri Anda sendiri.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Formulir Pendaftaran</CardTitle>
              <CardDescription className="text-gray-400">
                Silakan isi data diri Anda dengan lengkap dan akurat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white text-lg">NAMA</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400 h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white text-lg">EMAIL</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="alamat@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400 h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommenderId" className="text-white text-lg">
                    NO. ID REKOMENDATOR (BILA ADA)
                  </Label>
                  <Input
                    id="recommenderId"
                    name="recommenderId"
                    type="text"
                    placeholder="Masukkan ID rekomendator (opsional)"
                    value={formData.recommenderId}
                    onChange={handleInputChange}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400 h-12 text-lg"
                  />
                  <p className="text-gray-500 text-sm">Kosongkan jika tidak ada rekomendator</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold py-6 text-lg rounded-xl shadow-lg"
                >
                  Selanjutnya
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1a1a1a]">1</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Isi Formulir</h4>
              <p className="text-gray-400 text-sm">Data diri untuk pendaftaran</p>
            </div>

            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1a1a1a]">2</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Ikuti Tes</h4>
              <p className="text-gray-400 text-sm">Observasi bakat & potensi</p>
            </div>

            <div className="bg-[#2a2a2a] p-6 rounded-xl border border-yellow-400/20 text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#1a1a1a]">3</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Terima Sertifikat</h4>
              <p className="text-gray-400 text-sm">Hasil & rekomendasi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewmeTest;