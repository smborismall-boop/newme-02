import React, { useState, useEffect } from 'react';
import { Users, Mail, Building2, TrendingUp, CreditCard, Package, Eye, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { adminAPI, paymentAPI, productsAPI, analyticsAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';

const DashboardHome = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [analyticsStats, setAnalyticsStats] = useState(null);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [dashboardRes, paymentRes, productRes, analyticsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        paymentAPI.getStats().catch(() => ({ data: null })),
        productsAPI.getStats().catch(() => ({ data: null })),
        analyticsAPI.getStats().catch(() => ({ data: null }))
      ]);
      
      setStats(dashboardRes.data);
      setPaymentStats(paymentRes.data);
      setProductStats(productRes.data);
      setAnalyticsStats(analyticsRes.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memuat statistik', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Selamat datang di Admin Panel NEWME CLASS</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Registrasi</CardTitle>
            <Users className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.registrations?.total || 0}</div>
            <p className="text-xs text-gray-500">{stats?.registrations?.pending || 0} pending</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pesan Kontak</CardTitle>
            <Mail className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.contacts?.total || 0}</div>
            <p className="text-xs text-gray-500">{stats?.contacts?.new || 0} baru</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(paymentStats?.totalRevenue)}</div>
            <p className="text-xs text-gray-500">{paymentStats?.approved || 0} pembayaran sukses</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analyticsStats?.viewsToday || 0}</div>
            <p className="text-xs text-gray-500">hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{productStats?.total || 0}</div>
            <p className="text-xs text-gray-500">{productStats?.active || 0} aktif, {productStats?.outOfStock || 0} habis</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pembayaran Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{paymentStats?.pending || 0}</div>
            <p className="text-xs text-gray-500">menunggu approval</p>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Online Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{analyticsStats?.onlineUsers || 0}</div>
            <p className="text-xs text-gray-500">saat ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Registrasi Terbaru</CardTitle>
            <CardDescription className="text-gray-400">
              {stats?.registrations?.recent?.length || 0} registrasi terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.registrations?.recent?.slice(0, 5).map((reg) => (
                <div key={reg._id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                  <div>
                    <p className="text-white font-medium">{reg.name}</p>
                    <p className="text-gray-400 text-sm">{reg.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    reg.testStatus === 'approved' ? 'bg-green-400/20 text-green-400' :
                    reg.testStatus === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                    'bg-gray-400/20 text-gray-400'
                  }`}>
                    {reg.testStatus}
                  </span>
                </div>
              ))}
              {!stats?.registrations?.recent?.length && (
                <p className="text-gray-400 text-center py-4">Belum ada registrasi</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Pesan Terbaru</CardTitle>
            <CardDescription className="text-gray-400">
              {stats?.contacts?.recent?.length || 0} pesan terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.contacts?.recent?.slice(0, 5).map((contact) => (
                <div key={contact._id} className="p-3 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-medium">{contact.name}</p>
                    {contact.status === 'new' && (
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{contact.message}</p>
                </div>
              ))}
              {!stats?.contacts?.recent?.length && (
                <p className="text-gray-400 text-center py-4">Belum ada pesan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
