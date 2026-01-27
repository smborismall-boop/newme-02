import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { adminAPI } from '../../services/api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Payments = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data pembayaran',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/payments/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = (payment) => {
    setSelectedPayment(payment);
    setActionType('approve');
    setShowDialog(true);
  };

  const handleReject = (payment) => {
    setSelectedPayment(payment);
    setActionType('reject');
    setShowDialog(true);
  };

  const confirmAction = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API_URL}/api/payments/${selectedPayment._id}/approve`,
        {
          status: actionType === 'approve' ? 'approved' : 'rejected',
          rejectionReason: actionType === 'reject' ? rejectionReason : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Berhasil!',
        description: `Pembayaran berhasil ${actionType === 'approve' ? 'disetujui' : 'ditolak'}`,
      });

      setShowDialog(false);
      setRejectionReason('');
      loadPayments();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memproses pembayaran',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Disetujui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-sm text-gray-400">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments List */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Belum ada pembayaran</p>
            ) : (
              payments.map((payment) => (
                <div key={payment._id} className="bg-[#1a1a1a] p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{payment.userName}</h3>
                      <p className="text-gray-400 text-sm">{payment.userEmail}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {payment.status === 'pending' && (
                        <span className="flex items-center space-x-1 text-yellow-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Pending</span>
                        </span>
                      )}
                      {payment.status === 'approved' && (
                        <span className="flex items-center space-x-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Disetujui</span>
                        </span>
                      )}
                      {payment.status === 'rejected' && (
                        <span className="flex items-center space-x-1 text-red-400 text-sm">
                          <XCircle className="w-4 h-4" />
                          <span>Ditolak</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                    <div>
                      <span className="text-gray-500">Jumlah:</span>
                      <span className="text-white ml-2 font-semibold">{formatCurrency(payment.paymentAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Metode:</span>
                      <span className="text-white ml-2">{payment.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tanggal:</span>
                      <span className="text-white ml-2">{formatDate(payment.uploadedAt)}</span>
                    </div>
                  </div>

                  {payment.notes && (
                    <p className="text-gray-400 text-sm mb-3">Catatan: {payment.notes}</p>
                  )}

                  <div className="flex items-center space-x-3">
                    <a 
                      href={`${API_URL}${payment.paymentProofUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-400 hover:text-yellow-500 text-sm flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Lihat Bukti</span>
                    </a>
                    
                    {payment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Setujui
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(payment)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === 'approve' ? 'Setujui' : 'Tolak'} Pembayaran
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {actionType === 'approve' 
                ? 'Apakah Anda yakin ingin menyetujui pembayaran ini? User akan mendapatkan akses ke tes.'
                : 'Berikan alasan penolakan pembayaran ini.'}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-white">Alasan Penolakan</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Masukkan alasan penolakan..."
                className="bg-[#1a1a1a] border-yellow-400/30 text-white"
              />
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              Konfirmasi
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-yellow-400 text-yellow-400"
            >
              Batal
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;