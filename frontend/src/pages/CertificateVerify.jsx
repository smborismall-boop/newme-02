import React, { useState } from 'react';
import { Search, Award, CheckCircle, XCircle, Calendar, User, BookOpen, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { certificatesAPI } from '../services/api';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CertificateVerify = () => {
  const { toast } = useToast();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!certificateNumber.trim()) {
      toast({
        title: 'Error',
        description: 'Masukkan nomor sertifikat',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await certificatesAPI.verify(certificateNumber.trim());
      setResult(response.data);
    } catch (error) {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <Award className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Verifikasi Sertifikat</h1>
          <p className="text-gray-400">
            Masukkan nomor sertifikat untuk memverifikasi keaslian sertifikat NEWME CLASS
          </p>
        </div>

        {/* Search Form */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleVerify} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  value={certificateNumber}
                  onChange={(e) => setCertificateNumber(e.target.value.toUpperCase())}
                  placeholder="Masukkan nomor sertifikat (e.g., NEWME-20241216-ABCD1234)"
                  className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white text-lg h-12"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-yellow-400 text-black hover:bg-yellow-500 h-12 px-6"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Verifikasi'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Result */}
        {searched && result && (
          <Card className={`border-2 ${result.valid ? 'bg-green-900/20 border-green-400/50' : 'bg-red-900/20 border-red-400/50'}`}>
            <CardHeader className="text-center pb-4">
              {result.valid ? (
                <>
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-400">Sertifikat Valid</CardTitle>
                  <p className="text-gray-400">Sertifikat ini terdaftar dan sah</p>
                </>
              ) : (
                <>
                  <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-red-400">Sertifikat Tidak Ditemukan</CardTitle>
                  <p className="text-gray-400">Nomor sertifikat tidak terdaftar dalam sistem kami</p>
                </>
              )}
            </CardHeader>

            {result.valid && (
              <CardContent className="pt-0">
                <div className="bg-[#1a1a1a] rounded-lg p-6 space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-yellow-400 font-mono text-lg">{result.certificateNumber}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Nama Penerima</p>
                        <p className="text-white font-semibold">{result.userName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Program/Kursus</p>
                        <p className="text-white font-semibold">{result.courseName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 md:col-span-2">
                      <Calendar className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-gray-400 text-sm">Tanggal Terbit</p>
                        <p className="text-white font-semibold">{formatDate(result.issuedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-yellow-400/20 pt-4 mt-4">
                    <p className="text-gray-400 text-sm text-center mb-4">
                      Sertifikat ini diterbitkan oleh NEWME CLASS dan dapat diverifikasi kapan saja melalui halaman ini.
                    </p>
                    <div className="flex justify-center">
                      <a 
                        href={`${API_URL}/api/certificates/download/${result.certificateNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                          <Download className="w-4 h-4 mr-2" />
                          Download Sertifikat PDF
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Instructions */}
        <div className="mt-10 text-center">
          <h3 className="text-white font-semibold mb-3">Cara Menemukan Nomor Sertifikat</h3>
          <p className="text-gray-400 text-sm">
            Nomor sertifikat dapat ditemukan di bagian bawah sertifikat Anda.
            Format nomor sertifikat: NEWME-YYYYMMDD-XXXXXXXX
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerify;
