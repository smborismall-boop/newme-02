import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, CreditCard, Award, FileText, LogOut, Upload, Clock, CheckCircle, XCircle, 
  ShoppingBag, ChevronRight, Copy, Share2, Gift, AlertCircle, Play, Lock, Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { authAPI, userPaymentsAPI, settingsAPI, runningInfoAPI, referralAPI } from '../services/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [runningInfo, setRunningInfo] = useState([]);
  const [referralSettings, setReferralSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [qrisData, setQrisData] = useState(null);
  const [loadingQris, setLoadingQris] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadUserData(),
      loadSettings(),
      loadRunningInfo(),
      loadReferralSettings()
    ]);
    setLoading(false);
  };

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        navigate('/login');
      }
    }
  };

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const loadRunningInfo = async () => {
    try {
      const response = await runningInfoAPI.getActive();
      setRunningInfo(response.data);
    } catch (error) {
      console.error('Failed to load running info');
    }
  };

  const loadReferralSettings = async () => {
    try {
      const response = await referralAPI.getSettings();
      setReferralSettings(response.data);
    } catch (error) {
      console.error('Failed to load referral settings');
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile) {
      toast({
        title: 'Error',
        description: 'Pilih file bukti pembayaran',
        variant: 'destructive'
      });
      return;
    }

    setUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('paymentType', 'test');
      formData.append('paymentMethod', paymentMethod === 'bank' ? 'Transfer Bank' : 'QRIS');
      formData.append('paymentAmount', settings?.paymentAmount || 50000);

      await userPaymentsAPI.uploadProof(formData);
      
      toast({
        title: 'Berhasil',
        description: 'Bukti pembayaran berhasil diupload. Menunggu verifikasi admin.'
      });
      
      setProofFile(null);
      loadUserData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal upload bukti pembayaran',
        variant: 'destructive'
      });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.myReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Berhasil',
      description: 'Link referral berhasil disalin!'
    });
  };

  const handleShareReferral = async () => {
    const referralLink = `${window.location.origin}/register?ref=${user?.myReferralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daftar di NEWME CLASS',
          text: `Daftar di NEWME CLASS dan temukan potensi terbaikmu! Gunakan kode referral saya: ${user?.myReferralCode}`,
          url: referralLink
        });
      } catch (error) {
        handleCopyReferral();
      }
    } else {
      handleCopyReferral();
    }
  };

  const handleCreateQRIS = async () => {
    setLoadingQris(true);
    try {
      const response = await userPaymentsAPI.createQRIS();
      
      if (response.data.success) {
        setQrisData(response.data);
        toast({
          title: 'QRIS Dibuat!',
          description: 'Scan QR code untuk melanjutkan pembayaran'
        });
        
        // Auto check payment status every 5 seconds
        const interval = setInterval(async () => {
          await handleCheckPaymentStatus(response.data.orderId);
        }, 5000);
        
        // Clear interval after 1 hour (expiry time)
        setTimeout(() => {
          clearInterval(interval);
        }, 60 * 60 * 1000);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal membuat QRIS payment',
        variant: 'destructive'
      });
    } finally {
      setLoadingQris(false);
    }
  };

  const handleCheckPaymentStatus = async (orderId) => {
    if (checkingPayment) return;
    
    setCheckingPayment(true);
    try {
      const response = await userPaymentsAPI.checkPayment(orderId);
      
      if (response.data.status === 'settlement') {
        toast({
          title: 'Pembayaran Berhasil!',
          description: 'Pembayaran Anda telah dikonfirmasi'
        });
        setQrisData(null);
        await loadUserData();
      }
    } catch (error) {
      console.error('Error checking payment:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    navigate('/login');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price || 0);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'not_started': { label: 'Belum Mulai', color: 'bg-gray-400/20 text-gray-400', icon: AlertCircle },
      'in_progress': { label: 'Sedang Berlangsung', color: 'bg-purple-400/20 text-purple-400', icon: Play },
      'completed': { label: 'Selesai', color: 'bg-green-400/20 text-green-400', icon: CheckCircle },
      'unpaid': { label: 'Belum Bayar', color: 'bg-red-400/20 text-red-400', icon: XCircle },
      'pending': { label: 'Menunggu Verifikasi', color: 'bg-yellow-400/20 text-yellow-400', icon: Clock },
      'approved': { label: 'Disetujui', color: 'bg-green-400/20 text-green-400', icon: CheckCircle },
      'rejected': { label: 'Ditolak', color: 'bg-red-400/20 text-red-400', icon: XCircle }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-400/20 text-gray-400', icon: AlertCircle };
  };

  const canStartFreeTest = user?.freeTestStatus !== 'completed';
  const canStartPaidTest = user?.paymentStatus === 'approved' && user?.paidTestStatus !== 'completed';
  const needsPayment = settings?.requirePayment && user?.paymentStatus !== 'approved';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Running Information Marquee */}
      {runningInfo.length > 0 && (
        <div className="bg-yellow-400 text-black py-2 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {runningInfo.map((info, idx) => (
              <span key={idx} className="mx-8 inline-flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                {info.message}
                {info.linkUrl && (
                  <a href={info.linkUrl} className="ml-2 underline font-semibold">{info.linkText || 'Selengkapnya'}</a>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Selamat Datang, {user?.fullName}</h1>
            <p className="text-gray-400">Dashboard NEWME CLASS</p>
          </div>
          <div className="flex gap-3">
            <Link to="/shop">
              <Button variant="outline" className="border-yellow-400/50 text-yellow-400">
                <ShoppingBag className="w-4 h-4 mr-2" /> Shop
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="outline" className="border-red-400/50 text-red-400">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: User },
            { id: 'test', label: 'Test', icon: FileText },
            { id: 'payment', label: 'Pembayaran', icon: CreditCard },
            { id: 'referral', label: 'Referral', icon: Gift }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id 
                ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                : 'border-yellow-400/30 text-gray-400'
              }
            >
              <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Test Gratis</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-1 rounded text-xs ${getStatusBadge(user?.freeTestStatus).color}`}>
                        {React.createElement(getStatusBadge(user?.freeTestStatus).icon, { className: 'w-3 h-3 mr-1' })}
                        {getStatusBadge(user?.freeTestStatus).label}
                      </span>
                    </div>
                    <Sparkles className="w-8 h-8 text-green-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Test Premium</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-1 rounded text-xs ${getStatusBadge(user?.paidTestStatus).color}`}>
                        {React.createElement(getStatusBadge(user?.paidTestStatus).icon, { className: 'w-3 h-3 mr-1' })}
                        {getStatusBadge(user?.paidTestStatus).label}
                      </span>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pembayaran</p>
                      <span className={`inline-flex items-center mt-1 px-2 py-1 rounded text-xs ${getStatusBadge(user?.paymentStatus).color}`}>
                        {React.createElement(getStatusBadge(user?.paymentStatus).icon, { className: 'w-3 h-3 mr-1' })}
                        {getStatusBadge(user?.paymentStatus).label}
                      </span>
                    </div>
                    <CreditCard className="w-8 h-8 text-yellow-400/30" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Referral</p>
                      <p className="text-2xl font-bold text-yellow-400">{user?.referralCount || 0}</p>
                    </div>
                    <Gift className="w-8 h-8 text-yellow-400/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Info */}
            <Card className="bg-[#2a2a2a] border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" /> Profil Saya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Nama Lengkap</p>
                    <p className="text-white">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">WhatsApp</p>
                    <p className="text-white">{user?.whatsapp}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Tanggal Lahir</p>
                    <p className="text-white">{user?.birthDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Provinsi</p>
                    <p className="text-white">{user?.province || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kota/Kabupaten</p>
                    <p className="text-white">{user?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kecamatan</p>
                    <p className="text-white">{user?.district || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Kelurahan/Desa</p>
                    <p className="text-white">{user?.village || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Tab */}
        {activeTab === 'test' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Test */}
            <Card className="bg-[#2a2a2a] border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-green-400" /> Test Gratis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Test dasar untuk mengenal potensi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusBadge(user?.freeTestStatus).color}`}>
                    {getStatusBadge(user?.freeTestStatus).label}
                  </span>
                </div>
                
                {user?.freeTestStatus === 'completed' ? (
                  <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Test Gratis sudah selesai!</span>
                    </div>
                  </div>
                ) : (
                  <Link to="/user-test?type=free">
                    <Button className="w-full bg-green-500 text-white hover:bg-green-600">
                      <Play className="w-4 h-4 mr-2" />
                      {user?.freeTestStatus === 'in_progress' ? 'Lanjutkan Test' : 'Mulai Test Gratis'}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Paid Test */}
            <Card className="bg-[#2a2a2a] border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" /> Test Premium
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Test lengkap dengan analisis mendalam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getStatusBadge(user?.paidTestStatus).color}`}>
                    {getStatusBadge(user?.paidTestStatus).label}
                  </span>
                </div>
                
                {user?.paidTestStatus === 'completed' ? (
                  <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center text-green-400">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span>Test Premium sudah selesai!</span>
                    </div>
                    {user?.certificateNumber && (
                      <p className="text-gray-400 text-sm mt-2">
                        No. Sertifikat: {user?.certificateNumber}
                      </p>
                    )}
                  </div>
                ) : needsPayment ? (
                  <div className="space-y-3">
                    <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
                      <div className="flex items-center text-yellow-400">
                        <Lock className="w-5 h-5 mr-2" />
                        <span>Perlu pembayaran untuk mengakses</span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setActiveTab('payment')}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      <CreditCard className="w-4 h-4 mr-2" /> Lakukan Pembayaran
                    </Button>
                  </div>
                ) : (
                  <Link to="/user-test?type=paid">
                    <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                      <Play className="w-4 h-4 mr-2" />
                      {user?.paidTestStatus === 'in_progress' ? 'Lanjutkan Test' : 'Mulai Test Premium'}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            {user?.paymentStatus === 'approved' ? (
              <Card className="bg-[#2a2a2a] border-green-400/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Pembayaran Disetujui!</h3>
                    <p className="text-gray-400">Anda sudah dapat mengakses Test Premium.</p>
                    <Button 
                      onClick={() => setActiveTab('test')}
                      className="mt-4 bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      Mulai Test Premium
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : user?.paymentStatus === 'pending' ? (
              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Menunggu Verifikasi</h3>
                    <p className="text-gray-400">Bukti pembayaran Anda sedang diverifikasi oleh admin. Mohon tunggu 1x24 jam.</p>
                  </div>
                </CardContent>
              </Card>
            ) : user?.paymentStatus === 'rejected' ? (
              <Card className="bg-[#2a2a2a] border-red-400/20">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Pembayaran Ditolak</h3>
                    <p className="text-gray-400">Silakan upload ulang bukti pembayaran yang valid.</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {(user?.paymentStatus === 'unpaid' || user?.paymentStatus === 'rejected') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Info */}
                <Card className="bg-[#2a2a2a] border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Informasi Pembayaran</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm">Biaya Test Premium</p>
                      <p className="text-3xl font-bold text-yellow-400">{formatPrice(settings?.paymentAmount)}</p>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Pilih Metode Pembayaran:</p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('bank')}
                          className={`p-4 rounded-lg border-2 transition ${
                            paymentMethod === 'bank' 
                              ? 'border-yellow-400 bg-yellow-400/10' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <CreditCard className={`w-8 h-8 mx-auto mb-2 ${paymentMethod === 'bank' ? 'text-yellow-400' : 'text-gray-400'}`} />
                          <p className={`text-sm ${paymentMethod === 'bank' ? 'text-yellow-400' : 'text-gray-400'}`}>Transfer Bank</p>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('qris')}
                          className={`p-4 rounded-lg border-2 transition ${
                            paymentMethod === 'qris' 
                              ? 'border-yellow-400 bg-yellow-400/10' 
                              : 'border-gray-600 hover:border-gray-500'
                          }`}
                        >
                          <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center ${paymentMethod === 'qris' ? 'text-yellow-400' : 'text-gray-400'}`}>
                            <span className="text-xs font-bold">QRIS</span>
                          </div>
                          <p className={`text-sm ${paymentMethod === 'qris' ? 'text-yellow-400' : 'text-gray-400'}`}>QRIS Payment</p>
                        </button>
                      </div>
                    </div>

                    {/* Bank Transfer Info */}
                    {paymentMethod === 'bank' && (
                      <div className="bg-[#1a1a1a] rounded-lg p-4 space-y-3">
                        <p className="text-yellow-400 font-semibold">Transfer ke:</p>
                        <div>
                          <p className="text-gray-400 text-sm">Bank</p>
                          <p className="text-white font-semibold">{settings?.bankName || 'BCA'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">No. Rekening</p>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-mono text-lg">{settings?.bankAccountNumber || '1234567890'}</p>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(settings?.bankAccountNumber || '1234567890');
                                toast({ title: 'Disalin!', description: 'No. rekening berhasil disalin' });
                              }}
                              className="text-yellow-400 hover:text-yellow-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Atas Nama</p>
                          <p className="text-white">{settings?.bankAccountName || 'NEWME CLASS'}</p>
                        </div>
                        {settings?.paymentInstructions && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-400 text-sm whitespace-pre-line">{settings.paymentInstructions}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* QRIS Info */}
                    {paymentMethod === 'qris' && (
                      <div className="bg-[#1a1a1a] rounded-lg p-4">
                        <p className="text-yellow-400 font-semibold mb-3 text-center">Pembayaran QRIS</p>
                        
                        {!qrisData ? (
                          <div className="text-center space-y-4">
                            <p className="text-gray-400 text-sm">
                              Klik tombol di bawah untuk generate QRIS code
                            </p>
                            <Button
                              onClick={handleCreateQRIS}
                              disabled={loadingQris}
                              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                            >
                              {loadingQris ? (
                                <span className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Membuat QRIS...
                                </span>
                              ) : (
                                'Generate QRIS Code'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* QRIS Image */}
                            <div className="text-center">
                              <p className="text-white text-lg font-semibold mb-2">
                                Scan QRIS untuk bayar Rp {qrisData.grossAmount?.toLocaleString('id-ID')}
                              </p>
                              <div className="bg-white p-4 rounded-lg inline-block">
                                <img 
                                  src={qrisData.qrisUrl} 
                                  alt="QRIS Code" 
                                  className="w-[250px] h-[250px] mx-auto"
                                />
                              </div>
                              <p className="text-gray-400 text-sm mt-3">
                                Scan kode QR di atas menggunakan aplikasi e-wallet atau m-banking
                              </p>
                              <p className="text-yellow-400 text-xs mt-1">
                                Merchant: {qrisData.merchant || 'BTBTBT57'}
                              </p>
                            </div>
                            
                            {/* Instructions */}
                            {qrisData.instructions && (
                              <div className="bg-[#2a2a2a] rounded-lg p-4 text-left">
                                <p className="text-yellow-400 font-semibold mb-2">Instruksi Pembayaran:</p>
                                <ul className="text-gray-300 text-sm space-y-1">
                                  {qrisData.instructions.map((inst, idx) => (
                                    <li key={idx}>{inst}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            <div className="bg-[#2a2a2a] rounded-lg p-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Order ID:</span>
                                <span className="text-white font-mono text-xs">{qrisData.orderId}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Amount:</span>
                                <span className="text-yellow-400 font-semibold">{formatPrice(qrisData.grossAmount)}</span>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => handleCheckPaymentStatus(qrisData.orderId)}
                              disabled={checkingPayment}
                              variant="outline"
                              className="w-full border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                            >
                              {checkingPayment ? (
                                <span className="flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Mengecek Status...
                                </span>
                              ) : (
                                <span className="flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Sudah Bayar? Cek Status
                                </span>
                              )}
                            </Button>
                            
                            <button
                              onClick={() => setQrisData(null)}
                              className="w-full text-gray-400 hover:text-gray-300 text-sm underline"
                            >
                              Buat QRIS Baru
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Upload Proof */}
                <Card className="bg-[#2a2a2a] border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Upload Bukti Pembayaran</CardTitle>
                    <CardDescription className="text-gray-400">
                      Upload screenshot atau foto bukti transfer Anda
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-[#1a1a1a] hover:bg-[#252525] transition">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-gray-400" />
                          <p className="text-sm text-gray-400">
                            {proofFile ? proofFile.name : 'Klik untuk upload'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (Max. 5MB)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={(e) => setProofFile(e.target.files[0])}
                        />
                      </label>
                    </div>

                    {proofFile && (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(proofFile)} 
                          alt="Preview" 
                          className="max-h-40 mx-auto rounded-lg"
                        />
                        <button 
                          onClick={() => setProofFile(null)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <Button
                      onClick={handleUploadProof}
                      disabled={!proofFile || uploadingProof}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      {uploadingProof ? (
                        <span className="flex items-center">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                          Mengupload...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Upload className="w-4 h-4 mr-2" /> Upload Bukti Pembayaran
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Referral Tab */}
        {activeTab === 'referral' && (
          <div className="space-y-6">
            {/* Referral Link Card */}
            <Card className="bg-[#2a2a2a] border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-yellow-400" /> Link Referral Anda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Kode Referral:</p>
                  <p className="text-2xl font-bold text-yellow-400 font-mono">{user?.myReferralCode}</p>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Link Referral:</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text"
                      readOnly
                      value={`${window.location.origin}/register?ref=${user?.myReferralCode}`}
                      className="flex-1 bg-transparent text-white text-sm truncate"
                    />
                    <Button onClick={handleCopyReferral} size="sm" variant="outline" className="border-yellow-400/50 text-yellow-400">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button onClick={handleShareReferral} size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-yellow-400">{user?.referralCount || 0}</p>
                    <p className="text-gray-400 text-sm">Total Referral</p>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-green-400">{formatPrice(user?.referralBonus)}</p>
                    <p className="text-gray-400 text-sm">Total Bonus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referral Info */}
            {referralSettings && (
              <Card className="bg-[#2a2a2a] border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white">{referralSettings.title}</CardTitle>
                  <CardDescription className="text-gray-400">{referralSettings.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold mb-2">Keuntungan:</p>
                    <ul className="space-y-2">
                      {referralSettings.benefits?.map((benefit, idx) => (
                        <li key={idx} className="flex items-center text-gray-300">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#1a1a1a] rounded-lg p-4">
                    <p className="text-yellow-400 font-semibold mb-2">Syarat & Ketentuan:</p>
                    <p className="text-gray-400 text-sm whitespace-pre-line">{referralSettings.termsAndConditions}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
