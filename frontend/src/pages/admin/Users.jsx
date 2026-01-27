import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Search, Ban, CheckCircle, Eye, X, User, Mail, Phone, MapPin, Calendar, Building, CreditCard, Gift } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [searchTerm, filterStatus]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterStatus === 'banned') params.isBanned = true;
      if (filterStatus === 'paid') params.paymentStatus = 'approved';
      if (filterStatus === 'pending') params.paymentStatus = 'pending';
      
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data user',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/users/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleViewDetail = async (user) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setShowDetailDialog(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat detail user',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      whatsapp: user.whatsapp,
      birthDate: user.birthDate,
      province: user.province,
      city: user.city,
      district: user.district,
      village: user.village,
      address: user.address,
      userType: user.userType,
      paymentStatus: user.paymentStatus,
      freeTestStatus: user.freeTestStatus,
      paidTestStatus: user.paidTestStatus
    });
    setShowEditDialog(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleBan = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setShowBanDialog(true);
  };

  const confirmEdit = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API_URL}/api/users/${selectedUser._id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: 'Berhasil!',
        description: 'Data user berhasil diupdate',
      });

      setShowEditDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal mengupdate data user',
        variant: 'destructive'
      });
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.delete(`${API_URL}/api/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Berhasil!',
        description: 'User berhasil dihapus',
      });

      setShowDeleteDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus user',
        variant: 'destructive'
      });
    }
  };

  const confirmBan = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const endpoint = selectedUser.isBanned 
        ? `${API_URL}/api/users/${selectedUser._id}/unban`
        : `${API_URL}/api/users/${selectedUser._id}/ban?reason=${encodeURIComponent(banReason || 'Pelanggaran aturan')}`;
      
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Berhasil!',
        description: selectedUser.isBanned ? 'User berhasil di-unban' : 'User berhasil diblokir',
      });

      setShowBanDialog(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status ban user',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, type = 'payment') => {
    const statusColors = {
      payment: {
        unpaid: 'bg-red-400/20 text-red-400',
        pending: 'bg-yellow-400/20 text-yellow-400',
        approved: 'bg-green-400/20 text-green-400',
        rejected: 'bg-red-400/20 text-red-400'
      },
      test: {
        not_started: 'bg-gray-400/20 text-gray-400',
        in_progress: 'bg-purple-400/20 text-purple-400',
        completed: 'bg-green-400/20 text-green-400'
      }
    };
    return statusColors[type][status] || 'bg-gray-400/20 text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Manajemen User</h1>
        <p className="text-gray-400">Kelola pengguna terdaftar</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Aktif</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Diblokir</p>
              <p className="text-2xl font-bold text-red-400">{stats.banned}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Sudah Bayar</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.paid}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Baru Hari Ini</p>
              <p className="text-2xl font-bold text-blue-400">{stats.newToday}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2a2a2a] border-yellow-400/30 text-white"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-48 bg-[#2a2a2a] border-yellow-400/30 text-white">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a2a] border-yellow-400/20">
            <SelectItem value="all" className="text-white">Semua</SelectItem>
            <SelectItem value="paid" className="text-white">Sudah Bayar</SelectItem>
            <SelectItem value="pending" className="text-white">Pending</SelectItem>
            <SelectItem value="banned" className="text-white">Diblokir</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Daftar User ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-400/20">
                  <th className="text-left py-3 px-4 text-gray-400">User</th>
                  <th className="text-left py-3 px-4 text-gray-400">Kontak</th>
                  <th className="text-left py-3 px-4 text-gray-400">Pembayaran</th>
                  <th className="text-left py-3 px-4 text-gray-400">Test</th>
                  <th className="text-left py-3 px-4 text-gray-400">Referral</th>
                  <th className="text-left py-3 px-4 text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={`border-b border-gray-700 hover:bg-[#1a1a1a] ${user.isBanned ? 'opacity-60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.isBanned ? 'bg-red-400/20' : 'bg-yellow-400/20'}`}>
                          <User className={`w-5 h-5 ${user.isBanned ? 'text-red-400' : 'text-yellow-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.fullName}</p>
                          <p className="text-gray-400 text-xs">{user.userType === 'institution' ? 'Institusi' : 'Individu'}</p>
                          {user.isBanned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-400/20 text-red-400">
                              <Ban className="w-3 h-3 mr-1" /> Diblokir
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-300 text-sm">{user.email}</p>
                      <p className="text-gray-400 text-xs">{user.whatsapp}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(user.paymentStatus, 'payment')}`}>
                        {user.paymentStatus === 'approved' ? 'Lunas' : 
                         user.paymentStatus === 'pending' ? 'Pending' : 
                         user.paymentStatus === 'rejected' ? 'Ditolak' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusBadge(user.freeTestStatus, 'test')}`}>
                          Free: {user.freeTestStatus === 'completed' ? '✓' : user.freeTestStatus === 'in_progress' ? '⏳' : '-'}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusBadge(user.paidTestStatus, 'test')}`}>
                          Paid: {user.paidTestStatus === 'completed' ? '✓' : user.paidTestStatus === 'in_progress' ? '⏳' : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Gift className="w-4 h-4" />
                        <span className="text-sm">{user.referralCount || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleViewDetail(user)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(user)} className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleBan(user)} className={user.isBanned ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' : 'text-orange-400 hover:text-orange-300 hover:bg-orange-400/10'}>
                          {user.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(user)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Tidak ada user ditemukan</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2" /> Detail User
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm flex items-center"><User className="w-3 h-3 mr-1" /> Nama</p>
                  <p className="text-white">{selectedUser.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm flex items-center"><Mail className="w-3 h-3 mr-1" /> Email</p>
                  <p className="text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm flex items-center"><Phone className="w-3 h-3 mr-1" /> WhatsApp</p>
                  <p className="text-white">{selectedUser.whatsapp}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm flex items-center"><Calendar className="w-3 h-3 mr-1" /> Tanggal Lahir</p>
                  <p className="text-white">{selectedUser.birthDate || '-'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Lokasi
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Provinsi</p>
                    <p className="text-white">{selectedUser.province || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kota/Kabupaten</p>
                    <p className="text-white">{selectedUser.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kecamatan</p>
                    <p className="text-white">{selectedUser.district || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kelurahan/Desa</p>
                    <p className="text-white">{selectedUser.village || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">Alamat Lengkap</p>
                    <p className="text-white">{selectedUser.address || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Institution Info */}
              {selectedUser.userType === 'institution' && (
                <div className="p-4 bg-[#1a1a1a] rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                    <Building className="w-4 h-4 mr-2" /> Institusi
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Nama Institusi</p>
                      <p className="text-white">{selectedUser.institutionName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Jabatan</p>
                      <p className="text-white">{selectedUser.position || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400">Alamat Institusi</p>
                      <p className="text-white">{selectedUser.institutionAddress || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" /> Status
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-gray-400 text-sm">Pembayaran</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusBadge(selectedUser.paymentStatus, 'payment')}`}>
                      {selectedUser.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Test Gratis</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusBadge(selectedUser.freeTestStatus, 'test')}`}>
                      {selectedUser.freeTestStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Test Premium</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getStatusBadge(selectedUser.paidTestStatus, 'test')}`}>
                      {selectedUser.paidTestStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral */}
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <Gift className="w-4 h-4 mr-2" /> Referral
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Kode Referral</p>
                    <p className="text-white font-mono">{selectedUser.myReferralCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Referral</p>
                    <p className="text-yellow-400 font-bold">{selectedUser.referralCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Kode Digunakan</p>
                    <p className="text-white">{selectedUser.usedReferralCode || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-sm text-gray-400 space-y-1">
                <p>Terdaftar: {formatDate(selectedUser.createdAt)}</p>
                <p>Login Terakhir: {formatDate(selectedUser.lastLoginAt)}</p>
                <p>IP Address: {selectedUser.ipAddress || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label className="text-gray-400">Nama Lengkap</Label>
              <Input value={editForm.fullName || ''} onChange={(e) => setEditForm({...editForm, fullName: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
            </div>
            <div>
              <Label className="text-gray-400">Email</Label>
              <Input value={editForm.email || ''} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
            </div>
            <div>
              <Label className="text-gray-400">WhatsApp</Label>
              <Input value={editForm.whatsapp || ''} onChange={(e) => setEditForm({...editForm, whatsapp: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
            </div>
            <div>
              <Label className="text-gray-400">Tanggal Lahir</Label>
              <Input type="date" value={editForm.birthDate || ''} onChange={(e) => setEditForm({...editForm, birthDate: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">Provinsi</Label>
                <Input value={editForm.province || ''} onChange={(e) => setEditForm({...editForm, province: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">Kota/Kab</Label>
                <Input value={editForm.city || ''} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">Kecamatan</Label>
                <Input value={editForm.district || ''} onChange={(e) => setEditForm({...editForm, district: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">Kelurahan</Label>
                <Input value={editForm.village || ''} onChange={(e) => setEditForm({...editForm, village: e.target.value})} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
            </div>
            <div>
              <Label className="text-gray-400">Alamat Lengkap</Label>
              <textarea 
                value={editForm.address || ''} 
                onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
                className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[60px]"
              />
            </div>
            <div>
              <Label className="text-gray-400">Status Pembayaran</Label>
              <Select value={editForm.paymentStatus} onValueChange={(value) => setEditForm({...editForm, paymentStatus: value})}>
                <SelectTrigger className="bg-[#1a1a1a] border-yellow-400/20 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-yellow-400/20">
                  <SelectItem value="unpaid" className="text-white">Belum Bayar</SelectItem>
                  <SelectItem value="pending" className="text-white">Pending</SelectItem>
                  <SelectItem value="approved" className="text-white">Approved</SelectItem>
                  <SelectItem value="rejected" className="text-white">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-3 pt-4">
              <Button onClick={confirmEdit} className="bg-yellow-400 text-black hover:bg-yellow-500">Simpan</Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-gray-600 text-gray-400">Batal</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-white">Hapus User</DialogTitle>
            <DialogDescription className="text-gray-400">
              Apakah Anda yakin ingin menghapus user <strong className="text-white">{selectedUser?.fullName}</strong>? 
              Semua data terkait termasuk pembayaran dan referral akan ikut terhapus.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3 mt-4">
            <Button onClick={confirmDelete} variant="destructive">Hapus</Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-600 text-gray-400">Batal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedUser?.isBanned ? 'Unban User' : 'Blokir User'}
            </DialogTitle>
          </DialogHeader>
          {selectedUser?.isBanned ? (
            <div>
              <p className="text-gray-400 mb-4">
                Apakah Anda yakin ingin meng-unban user <strong className="text-white">{selectedUser?.fullName}</strong>?
              </p>
              {selectedUser?.bannedReason && (
                <p className="text-red-400 text-sm mb-4">
                  Alasan ban: {selectedUser.bannedReason}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-400">
                Blokir user <strong className="text-white">{selectedUser?.fullName}</strong>? User tidak akan bisa login.
              </p>
              <div>
                <Label className="text-gray-400">Alasan (opsional)</Label>
                <Input 
                  value={banReason} 
                  onChange={(e) => setBanReason(e.target.value)} 
                  placeholder="Masukkan alasan pemblokiran..."
                  className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                />
              </div>
            </div>
          )}
          <div className="flex space-x-3 mt-4">
            <Button 
              onClick={confirmBan} 
              className={selectedUser?.isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}
            >
              {selectedUser?.isBanned ? 'Unban' : 'Blokir'}
            </Button>
            <Button variant="outline" onClick={() => setShowBanDialog(false)} className="border-gray-600 text-gray-400">Batal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
