import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Mail, 
  Building2, 
  TrendingUp, 
  LogOut,
  ClipboardList,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { adminAPI, registrationAPI, contactAPI, institutionAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }

    setAdminUser(JSON.parse(user));
    loadDashboardStats();
  }, [navigate]);

  const loadDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast({
        title: 'Gagal Memuat Data',
        description: 'Tidak dapat memuat statistik dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast({
      title: 'Logout Berhasil',
      description: 'Anda telah keluar dari dashboard'
    });
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a]">
      {/* Header */}
      <div className="bg-[#2a2a2a] border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-[#1a1a1a]">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">NEWME CLASS</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-white font-semibold">{adminUser?.username}</p>
                <p className="text-gray-400 text-sm">{adminUser?.role}</p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Registrasi</CardTitle>
              <Users className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.registrations?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.registrations?.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Pesan Kontak</CardTitle>
              <Mail className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.contacts?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.contacts?.new || 0} baru
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Inquiry Institusi</CardTitle>
              <Building2 className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats?.institutions?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.institutions?.pending || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+{stats?.registrations?.total || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Registrations */}
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <ClipboardList className="w-5 h-5" />
                <span>Registrasi Terbaru</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {stats?.registrations?.recent?.length || 0} registrasi terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.registrations?.recent?.slice(0, 5).map((reg) => (
                  <div key={reg._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{reg.name}</p>
                      <p className="text-gray-400 text-sm">{reg.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {reg.testStatus === 'pending' ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-xs text-gray-400">{reg.testStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Contacts */}
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Pesan Terbaru</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                {stats?.contacts?.recent?.length || 0} pesan terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.contacts?.recent?.slice(0, 5).map((contact) => (
                  <div key={contact._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                    <div className="flex-1">
                      <p className="text-white font-medium">{contact.name}</p>
                      <p className="text-gray-400 text-sm truncate">{contact.message}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {contact.status === 'new' ? (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;