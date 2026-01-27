import { useState, useEffect } from "react";
import axios from "axios";
import { API, BACKEND_URL } from "@/App";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, Eye, CreditCard } from "lucide-react";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchPayments = async () => {
    try {
      const headers = getAuthHeaders();
      const statusFilter = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const response = await axios.get(`${API}/payments${statusFilter}`, { headers });
      setPayments(response.data);
    } catch (error) {
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(`${API}/payments/stats/summary`, { headers });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setViewDialogOpen(true);
  };

  const handleApproveOpen = (payment) => {
    setSelectedPayment(payment);
    setApproveDialogOpen(true);
  };

  const handleRejectOpen = (payment) => {
    setSelectedPayment(payment);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API}/payments/${selectedPayment._id}/approve`, {
        status: 'approved'
      }, { headers });
      toast.success('Pembayaran berhasil disetujui');
      setApproveDialogOpen(false);
      fetchPayments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyetujui pembayaran');
    }
  };

  const handleReject = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API}/payments/${selectedPayment._id}/approve`, {
        status: 'rejected',
        rejectionReason: rejectionReason
      }, { headers });
      toast.success('Pembayaran ditolak');
      setRejectDialogOpen(false);
      fetchPayments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menolak pembayaran');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="mr-1 h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout activeMenu="payments">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Kelola Pembayaran</h2>
          <p className="text-gray-400">Verifikasi bukti pembayaran dari user</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.approved || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-red-400">{stats?.rejected || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">Rp {(stats?.totalRevenue || 0).toLocaleString('id-ID')}</p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800">
            <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              Pending ({stats?.pending || 0})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              Rejected
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              Semua
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-0">
                {loading ? (
                  <p className="text-gray-400 p-6">Memuat...</p>
                ) : payments.length === 0 ? (
                  <p className="text-gray-400 p-6">Tidak ada data pembayaran.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400">Jumlah</TableHead>
                        <TableHead className="text-gray-400">Metode</TableHead>
                        <TableHead className="text-gray-400">Tanggal</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id} className="border-gray-700">
                          <TableCell>
                            <div>
                              <p className="text-white font-medium">{payment.userName}</p>
                              <p className="text-sm text-gray-400">{payment.userEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            Rp {payment.paymentAmount?.toLocaleString('id-ID')}
                          </TableCell>
                          <TableCell className="text-gray-300">{payment.paymentMethod}</TableCell>
                          <TableCell className="text-gray-300">
                            {formatDate(payment.uploadedAt)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleView(payment)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payment.status === 'pending' && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleApproveOpen(payment)}
                                    className="text-green-400 hover:text-green-300"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRejectOpen(payment)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Detail Pembayaran</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Nama</p>
                    <p className="text-white">{selectedPayment.userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Jumlah</p>
                    <p className="text-white font-semibold">Rp {selectedPayment.paymentAmount?.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Metode</p>
                    <p className="text-white">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tanggal Upload</p>
                    <p className="text-white">{formatDate(selectedPayment.uploadedAt)}</p>
                  </div>
                </div>
                {selectedPayment.notes && (
                  <div>
                    <p className="text-sm text-gray-400">Catatan User</p>
                    <p className="text-white">{selectedPayment.notes}</p>
                  </div>
                )}
                {selectedPayment.rejectionReason && (
                  <div>
                    <p className="text-sm text-gray-400">Alasan Penolakan</p>
                    <p className="text-red-400">{selectedPayment.rejectionReason}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400 mb-2">Bukti Pembayaran</p>
                  {selectedPayment.paymentProofUrl && (
                    <img 
                      src={`${BACKEND_URL}${selectedPayment.paymentProofUrl}`} 
                      alt="Bukti Pembayaran" 
                      className="max-w-full rounded-lg border border-gray-600"
                    />
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="border-gray-600">
                Tutup
              </Button>
              {selectedPayment?.status === 'pending' && (
                <>
                  <Button onClick={() => { setViewDialogOpen(false); handleApproveOpen(selectedPayment); }} className="bg-green-500 hover:bg-green-600">
                    Approve
                  </Button>
                  <Button onClick={() => { setViewDialogOpen(false); handleRejectOpen(selectedPayment); }} className="bg-red-500 hover:bg-red-600">
                    Reject
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Setujui Pembayaran</DialogTitle>
            </DialogHeader>
            <p className="text-gray-300">
              Apakah Anda yakin ingin menyetujui pembayaran dari <span className="text-white font-semibold">{selectedPayment?.userName}</span> sebesar <span className="text-yellow-400 font-semibold">Rp {selectedPayment?.paymentAmount?.toLocaleString('id-ID')}</span>?
            </p>
            <p className="text-sm text-gray-400">
              User akan dapat mengakses Test Premium setelah pembayaran disetujui.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)} className="border-gray-600">
                Batal
              </Button>
              <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600">
                Ya, Setujui
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Tolak Pembayaran</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">
                Apakah Anda yakin ingin menolak pembayaran dari <span className="text-white font-semibold">{selectedPayment?.userName}</span>?
              </p>
              <div>
                <Label className="text-white">Alasan Penolakan</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Masukkan alasan penolakan (opsional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="border-gray-600">
                Batal
              </Button>
              <Button onClick={handleReject} className="bg-red-500 hover:bg-red-600">
                Ya, Tolak
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
