import React, { useState, useEffect } from 'react';
import { Gift, Users, DollarSign, TrendingUp, Edit2, Save, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { referralAPI } from '../../services/api';

const Referrals = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [editingSettings, setEditingSettings] = useState(false);
  const [formData, setFormData] = useState({
    bonusPerReferral: 10000,
    minimumWithdraw: 50000,
    isActive: true,
    title: '',
    description: '',
    termsAndConditions: '',
    benefits: []
  });
  const [newBenefit, setNewBenefit] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, statsRes, leaderboardRes] = await Promise.all([
        referralAPI.getSettings(),
        referralAPI.getStats(),
        referralAPI.getLeaderboard(10)
      ]);
      
      setSettings(settingsRes.data);
      setStats(statsRes.data);
      setLeaderboard(leaderboardRes.data);
      
      setFormData({
        bonusPerReferral: settingsRes.data.bonusPerReferral || 10000,
        minimumWithdraw: settingsRes.data.minimumWithdraw || 50000,
        isActive: settingsRes.data.isActive ?? true,
        title: settingsRes.data.title || '',
        description: settingsRes.data.description || '',
        termsAndConditions: settingsRes.data.termsAndConditions || '',
        benefits: settingsRes.data.benefits || []
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data referral',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('bonusPerReferral', formData.bonusPerReferral);
      data.append('minimumWithdraw', formData.minimumWithdraw);
      data.append('isActive', formData.isActive);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('termsAndConditions', formData.termsAndConditions);
      data.append('benefits', JSON.stringify(formData.benefits));

      await referralAPI.updateSettings(data);
      
      toast({
        title: 'Berhasil',
        description: 'Pengaturan referral berhasil disimpan'
      });
      
      setEditingSettings(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit.trim()]
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index)
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price || 0);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Program Referral</h1>
          <p className="text-gray-400">Kelola program referral dan bonus</p>
        </div>
        {editingSettings ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingSettings(false)}
              className="border-gray-600"
            >
              Batal
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setEditingSettings(true)}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Pengaturan
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Referrer</p>
                <p className="text-2xl font-bold text-white">{stats?.totalReferrers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Referral</p>
                <p className="text-2xl font-bold text-green-400">{stats?.totalReferrals || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bonus Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.pendingBonus || 0}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bonus Dibayar</p>
                <p className="text-2xl font-bold text-white">{formatPrice(stats?.totalBonusPaid)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Gift className="w-5 h-5 mr-2 text-yellow-400" /> Pengaturan Referral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
              <span className="text-gray-400">Status Program</span>
              {editingSettings ? (
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                </label>
              ) : (
                <span className={`px-2 py-1 rounded text-xs ${formData.isActive ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}>
                  {formData.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm">Bonus Per Referral (IDR)</label>
              <Input
                type="number"
                value={formData.bonusPerReferral}
                onChange={(e) => setFormData({ ...formData, bonusPerReferral: parseFloat(e.target.value) })}
                disabled={!editingSettings}
                className="bg-[#1a1a1a] border-yellow-400/20 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Minimum Withdraw (IDR)</label>
              <Input
                type="number"
                value={formData.minimumWithdraw}
                onChange={(e) => setFormData({ ...formData, minimumWithdraw: parseFloat(e.target.value) })}
                disabled={!editingSettings}
                className="bg-[#1a1a1a] border-yellow-400/20 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Judul Program</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={!editingSettings}
                className="bg-[#1a1a1a] border-yellow-400/20 text-white"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={!editingSettings}
                rows={3}
                className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-3 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Syarat & Ketentuan</label>
              <textarea
                value={formData.termsAndConditions}
                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                disabled={!editingSettings}
                rows={4}
                className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-3 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Keuntungan</label>
              <div className="space-y-2 mt-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 bg-[#1a1a1a] p-2 rounded">
                    <span className="text-white flex-1">{benefit}</span>
                    {editingSettings && (
                      <button
                        onClick={() => removeBenefit(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {editingSettings && (
                  <div className="flex gap-2">
                    <Input
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Tambah keuntungan..."
                      className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    />
                    <Button onClick={addBenefit} size="sm" className="bg-yellow-400 text-black">
                      +
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" /> Top Referrer
            </CardTitle>
            <CardDescription className="text-gray-400">
              User dengan referral terbanyak
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Belum ada referral</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={user._id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-400/10 border border-yellow-400/30' :
                      index === 1 ? 'bg-gray-400/10 border border-gray-400/30' :
                      index === 2 ? 'bg-orange-400/10 border border-orange-400/30' :
                      'bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-400 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-400 text-black' :
                        'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{user.fullName}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{user.referralCount}</p>
                      <p className="text-gray-400 text-xs">referral</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
