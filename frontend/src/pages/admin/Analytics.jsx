import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Eye, Globe, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { analyticsAPI } from '../../services/api';

const Analytics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, onlineRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getOnlineUsers()
      ]);
      setStats(statsRes.data);
      setOnlineUsers(onlineRes.data);
    } catch (error) {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await analyticsAPI.cleanup();
      toast({ title: 'Sukses', description: 'Data lama berhasil dibersihkan' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal membersihkan data', variant: 'destructive' });
    }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Statistik pengunjung dan aktivitas website</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" className="border-yellow-400/50 text-yellow-400">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={handleCleanup} variant="outline" className="border-red-400/50 text-red-400">
            Cleanup Data Lama
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Page Views</p>
                <p className="text-3xl font-bold text-white">{stats?.totalViews || 0}</p>
              </div>
              <Eye className="w-10 h-10 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Views Hari Ini</p>
                <p className="text-3xl font-bold text-white">{stats?.viewsToday || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pengunjung Unik</p>
                <p className="text-3xl font-bold text-white">{stats?.uniqueVisitors || 0}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Online Sekarang</p>
                <p className="text-3xl font-bold text-green-400">{onlineUsers?.count || 0}</p>
              </div>
              <Globe className="w-10 h-10 text-green-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" /> Views 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.dailyViews?.map((day, idx) => {
                const maxViews = Math.max(...stats.dailyViews.map(d => d.views)) || 1;
                const percentage = (day.views / maxViews) * 100;
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-24">{new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' })}</span>
                    <div className="flex-1 bg-[#1a1a1a] rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full flex items-center justify-end px-2"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      >
                        <span className="text-xs text-black font-semibold">{day.views}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2" /> Halaman Populer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.topPages?.length > 0 ? (
                stats.topPages.map((page, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-white">{page._id || 'Unknown'}</span>
                    </div>
                    <span className="text-yellow-400 font-semibold">{page.count} views</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">Belum ada data</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Online Users */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" /> Pengguna Online ({onlineUsers?.count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {onlineUsers?.users?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-gray-400 text-sm text-left">
                      <th className="pb-3">Session</th>
                      <th className="pb-3">Halaman</th>
                      <th className="pb-3">IP Address</th>
                      <th className="pb-3">Terakhir Aktif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onlineUsers.users.slice(0, 10).map((user, idx) => (
                      <tr key={idx} className="border-t border-yellow-400/10">
                        <td className="py-3 text-gray-400 font-mono text-sm">{user.sessionId?.slice(0, 8)}...</td>
                        <td className="py-3 text-white">{user.currentPage}</td>
                        <td className="py-3 text-gray-400">{user.ipAddress}</td>
                        <td className="py-3 text-gray-400 text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(user.lastActivity).toLocaleTimeString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Tidak ada pengguna online saat ini</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Views Minggu Ini</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.viewsThisWeek || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Views Bulan Ini</p>
            <p className="text-2xl font-bold text-white mt-1">{stats?.viewsThisMonth || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Rata-rata Harian</p>
            <p className="text-2xl font-bold text-white mt-1">
              {stats?.dailyViews ? Math.round(stats.dailyViews.reduce((a, b) => a + b.views, 0) / 7) : 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
