import React, { useState, useEffect } from 'react';
import { Users, Plus, Key, Trash2, Shield, UserCog } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  
  // New Admin Form
  const [newAdminOpen, setNewAdminOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin'
  });
  
  // Change Password Form
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchAdmins();
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    setCurrentAdmin(adminUser);
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAdminUsers();
      setAdmins(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal memuat data admin',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createAdminUser(newAdminData);
      toast({
        title: 'Berhasil',
        description: 'Admin baru berhasil dibuat'
      });
      setNewAdminOpen(false);
      setNewAdminData({ username: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error.response?.data?.detail || 'Gagal membuat admin',
        variant: 'destructive'
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    
    try {
      await adminAPI.changeAdminPassword(selectedAdmin._id, { newPassword });
      toast({
        title: 'Berhasil',
        description: 'Password berhasil diubah'
      });
      setChangePasswordOpen(false);
      setNewPassword('');
      setSelectedAdmin(null);
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error.response?.data?.detail || 'Gagal mengubah password',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (!window.confirm(`Hapus admin ${admin.email}?`)) return;
    
    try {
      await adminAPI.deleteAdminUser(admin._id);
      toast({
        title: 'Berhasil',
        description: 'Admin berhasil dihapus'
      });
      fetchAdmins();
    } catch (error) {
      toast({
        title: 'Gagal',
        description: error.response?.data?.detail || 'Gagal menghapus admin',
        variant: 'destructive'
      });
    }
  };

  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            Manajemen Admin
          </h1>
          <p className="text-gray-400">Kelola akun administrator</p>
        </div>
        
        {isSuperAdmin && (
          <Dialog open={newAdminOpen} onOpenChange={setNewAdminOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2a2a2a] border-yellow-400/20">
              <DialogHeader>
                <DialogTitle className="text-white">Tambah Admin Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <Label className="text-white">Username</Label>
                  <Input
                    value={newAdminData.username}
                    onChange={(e) => setNewAdminData({...newAdminData, username: e.target.value})}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white"
                    placeholder="Nama admin"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={newAdminData.email}
                    onChange={(e) => setNewAdminData({...newAdminData, email: e.target.value})}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Password</Label>
                  <Input
                    type="password"
                    value={newAdminData.password}
                    onChange={(e) => setNewAdminData({...newAdminData, password: e.target.value})}
                    className="bg-[#1a1a1a] border-yellow-400/30 text-white"
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label className="text-white">Role</Label>
                  <Select 
                    value={newAdminData.role} 
                    onValueChange={(value) => setNewAdminData({...newAdminData, role: value})}
                  >
                    <SelectTrigger className="bg-[#1a1a1a] border-yellow-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#2a2a2a] border-yellow-400/30 z-[100]">
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  Buat Admin
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admin List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6 text-center text-gray-400">
              Memuat data...
            </CardContent>
          </Card>
        ) : admins.length === 0 ? (
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6 text-center text-gray-400">
              Belum ada admin terdaftar
            </CardContent>
          </Card>
        ) : (
          admins.map((admin) => (
            <Card key={admin._id} className="bg-[#2a2a2a] border-yellow-400/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      admin.role === 'superadmin' ? 'bg-purple-400/20' : 'bg-yellow-400/20'
                    }`}>
                      {admin.role === 'superadmin' ? (
                        <Shield className="w-6 h-6 text-purple-400" />
                      ) : (
                        <UserCog className="w-6 h-6 text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{admin.username}</h3>
                      <p className="text-gray-400 text-sm">{admin.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                        admin.role === 'superadmin' 
                          ? 'bg-purple-400/20 text-purple-400' 
                          : 'bg-yellow-400/20 text-yellow-400'
                      }`}>
                        {admin.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Change Password Button */}
                    {(isSuperAdmin || currentAdmin?.id === admin._id) && (
                      <Dialog open={changePasswordOpen && selectedAdmin?._id === admin._id} onOpenChange={(open) => {
                        setChangePasswordOpen(open);
                        if (!open) {
                          setSelectedAdmin(null);
                          setNewPassword('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
                            onClick={() => setSelectedAdmin(admin)}
                          >
                            <Key className="w-4 h-4 mr-1" />
                            Ganti Password
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#2a2a2a] border-yellow-400/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Ganti Password</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleChangePassword} className="space-y-4">
                            <p className="text-gray-400 text-sm">
                              Ganti password untuk: <span className="text-yellow-400">{selectedAdmin?.email}</span>
                            </p>
                            <div>
                              <Label className="text-white">Password Baru</Label>
                              <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#1a1a1a] border-yellow-400/30 text-white"
                                placeholder="Minimal 6 karakter"
                                required
                                minLength={6}
                              />
                            </div>
                            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                              Simpan Password
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                    
                    {/* Delete Button - Superadmin only, can't delete self */}
                    {isSuperAdmin && currentAdmin?.id !== admin._id && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                        onClick={() => handleDeleteAdmin(admin)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Info Card */}
      {!isSuperAdmin && (
        <Card className="bg-yellow-400/10 border-yellow-400/30">
          <CardContent className="p-4">
            <p className="text-yellow-400 text-sm">
              <Shield className="w-4 h-4 inline mr-1" />
              Hanya Super Admin yang dapat menambah/menghapus admin. Anda dapat mengubah password sendiri.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;
