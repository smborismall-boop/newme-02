import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Globe } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Contact = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Data Tidak Lengkap',
        description: 'Mohon isi semua field yang wajib',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Import API service
      const { contactAPI } = await import('../services/api');
      
      // Submit to backend
      const response = await contactAPI.create(formData);

      toast({
        title: 'Pesan Terkirim!',
        description: response.data.message || 'Terima kasih telah menghubungi kami.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan. Silakan coba lagi.';
      toast({
        title: 'Pengiriman Gagal',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  const handleWhatsApp = () => {
    const phoneNumber = (settings?.whatsapp || settings?.phone || '089502671691').replace(/\D/g, '');
    const message = encodeURIComponent(`Halo ${settings?.siteName || 'NEWME CLASS'}, saya ingin bertanya tentang program Anda.`);
    window.open(`https://wa.me/62${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a1a1a] mb-6">
            Hubungi Kami
          </h1>
          <p className="text-xl text-[#2a2a2a] max-w-2xl mx-auto">
            Punya pertanyaan atau ingin konsultasi? Kami siap membantu Anda!
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-7 h-7 text-[#1a1a1a]" />
                </div>
                <CardTitle className="text-white">Telepon</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`tel:${settings?.phone || '089502671691'}`} className="text-yellow-400 hover:underline text-lg">
                  {settings?.phone || '0895.0267.1691'}
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-7 h-7 text-[#1a1a1a]" />
                </div>
                <CardTitle className="text-white">Email</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`mailto:${settings?.email || 'newmeclass@gmail.com'}`} className="text-yellow-400 hover:underline text-lg break-all">
                  {settings?.email || 'newmeclass@gmail.com'}
                </a>
              </CardContent>
            </Card>

            <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400 transition-all hover:scale-105">
              <CardHeader>
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-7 h-7 text-[#1a1a1a]" />
                </div>
                <CardTitle className="text-white">Alamat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  {settings?.address || 'Jl. Puskesmas I - Komp. Golden Seroja - A1'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Kirim Pesan</h2>
              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardHeader>
                  <CardDescription className="text-gray-400">
                    Isi formulir di bawah ini dan kami akan segera merespons pesan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">Nama Lengkap *</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nama Anda"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">No. Telepon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xx-xxxx-xxxx"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-white">Subjek</Label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        placeholder="Subjek pesan"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-white">Pesan *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Tulis pesan Anda di sini..."
                        value={formData.message}
                        onChange={handleInputChange}
                        className="bg-[#1a1a1a] border-yellow-400/30 text-white placeholder:text-gray-500 focus:border-yellow-400 min-h-[150px]"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a] font-semibold py-6"
                    >
                      Kirim Pesan
                      <Send className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info & Social */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Informasi Kontak</h2>
                <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-yellow-400/20 space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Telepon</h4>
                      <a href={`tel:${settings?.phone || '089502671691'}`} className="text-gray-300 hover:text-yellow-400">
                        {settings?.phone || '0895.0267.1691'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Email</h4>
                      <a href={`mailto:${settings?.email || 'newmeclass@gmail.com'}`} className="text-gray-300 hover:text-yellow-400 break-all">
                        {settings?.email || 'newmeclass@gmail.com'}
                      </a>
                    </div>
                  </div>

                  {settings?.website && (
                    <div className="flex items-start space-x-4">
                      <Globe className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="text-white font-semibold mb-1">Website</h4>
                        <a href={`https://${settings.website}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-yellow-400">
                          {settings.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start space-x-4">
                    <Instagram className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Instagram</h4>
                      <a href={`https://instagram.com/${(settings?.instagram || '@newmeclass').replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-yellow-400">
                        {settings?.instagram || '@newmeclass'}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-white font-semibold mb-1">Alamat</h4>
                      <p className="text-gray-300">{settings?.address || 'Jl. Puskesmas I - Komp. Golden Seroja - A1'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Chat via WhatsApp</h3>
                <p className="text-white/90 mb-6">Butuh respons cepat? Hubungi kami langsung via WhatsApp!</p>
                <Button 
                  onClick={handleWhatsApp}
                  className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-8 py-6 text-lg"
                >
                  Buka WhatsApp
                </Button>
              </div>

              {/* Office Hours */}
              <div className="bg-[#2a2a2a] rounded-2xl p-8 border border-yellow-400/20">
                <h3 className="text-xl font-bold text-white mb-4">Jam Operasional</h3>
                <div className="space-y-2 text-gray-300">
                  <div className="flex justify-between">
                    <span>Senin - Jumat</span>
                    <span className="text-yellow-400 font-semibold">08:00 - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabtu</span>
                    <span className="text-yellow-400 font-semibold">08:00 - 13:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Minggu</span>
                    <span className="text-gray-500">Tutup</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;