import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  QrCode,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { authAPI } from '../services/api';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Wallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopup, setShowTopup] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [processingTopup, setProcessingTopup] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await authAPI.getProfile();
      setUser(response.data);
      loadWalletData(response.data._id);
    } catch (error) {
      navigate('/login');
    }
  };

  const loadWalletData = async (userId) => {
    try {
      setLoading(true);
      const [balanceRes, transactionsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/wallet/balance/${userId}`),
        axios.get(`${BACKEND_URL}/api/wallet/transactions/${userId}`)
      ]);
      setBalance(balanceRes.data.balance || 0);
      setTransactions(transactionsRes.data || []);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 10000) {
      toast({
        title: 'Error',
        description: 'Minimal top-up Rp 10.000',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessingTopup(true);
      const response = await axios.post(`${BACKEND_URL}/api/wallet/topup`, {
        userId: user._id,
        amount: amount
      });
      
      setQrData(response.data);
      toast({
        title: 'QR Code Dibuat',
        description: 'Silakan scan QR Code untuk melakukan pembayaran'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal membuat top-up',
        variant: 'destructive'
      });
    } finally {
      setProcessingTopup(false);
    }
  };

  const handleDemoTopup = async () => {
    const amount = parseInt(topupAmount);
    if (!amount || amount < 10000) {
      toast({
        title: 'Error',
        description: 'Minimal top-up Rp 10.000',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessingTopup(true);
      const response = await axios.post(`${BACKEND_URL}/api/wallet/demo-topup`, {
        userId: user._id,
        amount: amount
      });
      
      setBalance(response.data.newBalance);
      toast({
        title: 'Top-up Berhasil!',
        description: `Saldo bertambah Rp ${amount.toLocaleString('id-ID')}`
      });
      setShowTopup(false);
      setTopupAmount('');
      setQrData(null);
      loadWalletData(user._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal top-up',
        variant: 'destructive'
      });
    } finally {
      setProcessingTopup(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!qrData?.orderId) return;
    
    try {
      setCheckingStatus(true);
      const response = await axios.get(`${BACKEND_URL}/api/wallet/check-status/${qrData.orderId}`);
      
      if (response.data.status === 'settlement' || response.data.status === 'capture') {
        toast({
          title: 'Pembayaran Berhasil!',
          description: 'Saldo wallet Anda telah bertambah'
        });
        setShowTopup(false);
        setQrData(null);
        setTopupAmount('');
        loadWalletData(user._id);
      } else if (response.data.status === 'pending') {
        toast({
          title: 'Menunggu Pembayaran',
          description: 'Silakan selesaikan pembayaran Anda'
        });
      } else {
        toast({
          title: 'Status: ' + response.data.status,
          description: 'Cek kembali nanti',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Check status error:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const quickAmounts = [50000, 100000, 200000, 500000];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-8" data-testid="wallet-page">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Saya</h1>
          <p className="text-gray-400">Kelola saldo dan pembayaran Anda</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-yellow-400 to-yellow-600 border-none mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-900 text-sm mb-1">Saldo Tersedia</p>
                <p className="text-4xl font-bold text-[#1a1a1a]">{formatCurrency(balance)}</p>
              </div>
              <div className="w-16 h-16 bg-[#1a1a1a]/20 rounded-full flex items-center justify-center">
                <WalletIcon className="w-8 h-8 text-[#1a1a1a]" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button 
                onClick={() => setShowTopup(true)}
                className="bg-[#1a1a1a] text-yellow-400 hover:bg-[#2a2a2a]"
              >
                <Plus className="w-4 h-4 mr-2" /> Top Up
              </Button>
              <Button 
                onClick={() => loadWalletData(user._id)}
                variant="outline"
                className="border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a]/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top-up Modal */}
        {showTopup && (
          <Card className="bg-[#2a2a2a] border-yellow-400/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <QrCode className="w-5 h-5 mr-2 text-yellow-400" />
                Top Up Saldo
              </CardTitle>
              <CardDescription className="text-gray-400">
                Pilih nominal atau masukkan jumlah top-up
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick amounts */}
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={topupAmount === amount.toString() ? 'default' : 'outline'}
                    onClick={() => setTopupAmount(amount.toString())}
                    className={topupAmount === amount.toString() 
                      ? 'bg-yellow-400 text-black' 
                      : 'border-yellow-400/30 text-gray-300 hover:bg-yellow-400/10'}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>

              {/* Custom amount */}
              <div>
                <label className="text-white text-sm mb-2 block">Atau masukkan nominal:</label>
                <Input
                  type="number"
                  placeholder="Minimal Rp 10.000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="bg-[#1a1a1a] border-yellow-400/30 text-white"
                />
              </div>

              {/* QR Code display */}
              {qrData && (
                <div className="bg-white rounded-lg p-6 text-center">
                  <p className="text-gray-800 font-semibold mb-4">Scan QR Code untuk membayar</p>
                  {qrData.qrCode ? (
                    <img 
                      src={qrData.qrCode} 
                      alt="QR Code" 
                      className="w-48 h-48 mx-auto mb-4"
                    />
                  ) : (
                    <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 flex items-center justify-center rounded-lg">
                      <QrCode className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                  <p className="text-2xl font-bold text-gray-900 mb-2">{formatCurrency(qrData.amount)}</p>
                  <p className="text-gray-600 text-sm mb-4">Order ID: {qrData.orderId}</p>
                  <Button 
                    onClick={checkPaymentStatus}
                    disabled={checkingStatus}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {checkingStatus ? 'Mengecek...' : 'Cek Status Pembayaran'}
                  </Button>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                {!qrData ? (
                  <>
                    <Button 
                      onClick={handleTopup}
                      disabled={processingTopup || !topupAmount}
                      className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      {processingTopup ? 'Memproses...' : 'Buat QR Code QRIS'}
                    </Button>
                    <Button 
                      onClick={handleDemoTopup}
                      disabled={processingTopup || !topupAmount}
                      className="flex-1 bg-green-600 text-white hover:bg-green-700"
                    >
                      {processingTopup ? 'Memproses...' : 'Demo Top-up (Instant)'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => {
                      setQrData(null);
                      setTopupAmount('');
                    }}
                    variant="outline"
                    className="flex-1 border-gray-500 text-gray-300"
                  >
                    Batal
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setShowTopup(false);
                    setQrData(null);
                    setTopupAmount('');
                  }}
                  variant="outline"
                  className="border-gray-500 text-gray-300"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions History */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Riwayat Transaksi</CardTitle>
            <CardDescription className="text-gray-400">
              Transaksi terakhir Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <WalletIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div 
                    key={tx._id}
                    className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'topup' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {tx.type === 'topup' ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {tx.type === 'topup' ? 'Top Up' : tx.description || 'Pembayaran'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        {getStatusIcon(tx.status)}
                        <span className="text-gray-400 text-xs capitalize">{tx.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <strong>Info:</strong> Saldo wallet dapat digunakan untuk membayar test berbayar. 
            Top-up menggunakan QRIS yang didukung oleh GoPay, OVO, DANA, dan e-wallet lainnya.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
