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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Upload, Globe, Palette, CreditCard, Search, Settings2 } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API}/settings`, settings, { headers });
      toast.success('Pengaturan berhasil disimpan');
      
      // Update document SEO
      if (settings.siteTitle) {
        document.title = settings.siteTitle;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (assetType, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [assetType]: true }));
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      };

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/settings/upload/${assetType}`, formData, { headers });
      
      if (response.data.success) {
        toast.success(`${assetType} berhasil diupload`);
        fetchSettings();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || `Gagal upload ${assetType}`);
    } finally {
      setUploading(prev => ({ ...prev, [assetType]: false }));
    }
  };

  if (loading) {
    return (
      <AdminLayout activeMenu="settings">
        <p className="text-gray-400">Memuat pengaturan...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeMenu="settings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Pengaturan</h2>
            <p className="text-gray-400">Kelola pengaturan website dan SEO</p>
          </div>
          <Button onClick={handleSave} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900" disabled={saving}>
            <Save className="mr-2 h-4 w-4" /> {saving ? 'Menyimpan...' : 'Simpan Semua'}
          </Button>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="general" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <Settings2 className="mr-2 h-4 w-4" /> Umum
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <Search className="mr-2 h-4 w-4" /> SEO
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <CreditCard className="mr-2 h-4 w-4" /> Pembayaran
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <Palette className="mr-2 h-4 w-4" /> Tampilan
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Informasi Website</CardTitle>
                <CardDescription className="text-gray-400">Pengaturan dasar website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nama Website</Label>
                    <Input
                      value={settings?.siteName || ''}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Judul Website</Label>
                    <Input
                      value={settings?.siteTitle || ''}
                      onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Deskripsi Website</Label>
                  <Textarea
                    value={settings?.siteDescription || ''}
                    onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Kontak</CardTitle>
                <CardDescription className="text-gray-400">Informasi kontak yang ditampilkan di website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input
                      type="email"
                      value={settings?.email || ''}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">No. Telepon</Label>
                    <Input
                      value={settings?.phone || ''}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">WhatsApp</Label>
                    <Input
                      value={settings?.whatsapp || ''}
                      onChange={(e) => setSettings({...settings, whatsapp: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Instagram</Label>
                    <Input
                      value={settings?.instagram || ''}
                      onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="@username"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Alamat</Label>
                  <Textarea
                    value={settings?.address || ''}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Logo & Favicon</CardTitle>
                <CardDescription className="text-gray-400">Upload logo dan favicon website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white">Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {settings?.logoUrl && (
                        <img src={`${BACKEND_URL}${settings.logoUrl}`} alt="Logo" className="h-16 object-contain" />
                      )}
                      <label className="flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600">
                        <Upload className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{uploading.logo ? 'Uploading...' : 'Upload Logo'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleUpload('logo', e.target.files[0])}
                          disabled={uploading.logo}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Favicon</Label>
                    <div className="mt-2 flex items-center gap-4">
                      {settings?.faviconUrl && (
                        <img src={`${BACKEND_URL}${settings.faviconUrl}`} alt="Favicon" className="h-8 object-contain" />
                      )}
                      <label className="flex items-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-600">
                        <Upload className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{uploading.favicon ? 'Uploading...' : 'Upload Favicon'}</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleUpload('favicon', e.target.files[0])}
                          disabled={uploading.favicon}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Settings */}
          <TabsContent value="seo" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-yellow-400" />
                  SEO (Search Engine Optimization)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Pengaturan untuk meningkatkan visibilitas di mesin pencari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Meta Title</Label>
                  <Input
                    value={settings?.siteTitle || ''}
                    onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="NEWME CLASS - Kelas Peduli Talenta"
                  />
                  <p className="text-xs text-gray-500 mt-1">Judul yang muncul di hasil pencarian Google (maks. 60 karakter)</p>
                </div>
                <div>
                  <Label className="text-white">Meta Description</Label>
                  <Textarea
                    value={settings?.seoMetaDescription || ''}
                    onChange={(e) => setSettings({...settings, seoMetaDescription: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Deskripsi singkat tentang website Anda..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">Deskripsi yang muncul di hasil pencarian (maks. 160 karakter)</p>
                </div>
                <div>
                  <Label className="text-white">Meta Keywords</Label>
                  <Textarea
                    value={settings?.seoKeywords || ''}
                    onChange={(e) => setSettings({...settings, seoKeywords: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="talenta, potensi diri, pengembangan diri, test kepribadian"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Kata kunci yang relevan, pisahkan dengan koma</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Analytics & Tracking</CardTitle>
                <CardDescription className="text-gray-400">
                  Integrasi dengan tools analitik
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-white">Google Analytics ID</Label>
                  <Input
                    value={settings?.googleAnalyticsId || ''}
                    onChange={(e) => setSettings({...settings, googleAnalyticsId: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="UA-XXXXXXXXX-X atau G-XXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID Google Analytics untuk tracking pengunjung</p>
                </div>
                <div>
                  <Label className="text-white">Facebook Pixel ID</Label>
                  <Input
                    value={settings?.facebookPixelId || ''}
                    onChange={(e) => setSettings({...settings, facebookPixelId: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="XXXXXXXXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500 mt-1">ID Facebook Pixel untuk tracking iklan Facebook</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-yellow-400" />
                  Pengaturan Pembayaran
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Konfigurasi pembayaran Test Premium
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <Label className="text-white">Wajib Pembayaran</Label>
                    <p className="text-sm text-gray-400">Aktifkan jika Test Premium memerlukan pembayaran</p>
                  </div>
                  <Switch
                    checked={settings?.requirePayment ?? true}
                    onCheckedChange={(checked) => setSettings({...settings, requirePayment: checked})}
                  />
                </div>
                <div>
                  <Label className="text-white">Harga Test Premium (Rp)</Label>
                  <Input
                    type="number"
                    value={settings?.paymentAmount || 50000}
                    onChange={(e) => setSettings({...settings, paymentAmount: parseFloat(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Rekening Bank</CardTitle>
                <CardDescription className="text-gray-400">
                  Informasi rekening untuk transfer manual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Nama Bank</Label>
                    <Input
                      value={settings?.bankName || ''}
                      onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="BCA, Mandiri, BNI, dll"
                    />
                  </div>
                  <div>
                    <Label className="text-white">No. Rekening</Label>
                    <Input
                      value={settings?.bankAccountNumber || ''}
                      onChange={(e) => setSettings({...settings, bankAccountNumber: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="1234567890"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Nama Pemilik Rekening</Label>
                  <Input
                    value={settings?.bankAccountName || ''}
                    onChange={(e) => setSettings({...settings, bankAccountName: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Nama sesuai rekening"
                  />
                </div>
                <div>
                  <Label className="text-white">Instruksi Pembayaran</Label>
                  <Textarea
                    value={settings?.paymentInstructions || ''}
                    onChange={(e) => setSettings({...settings, paymentInstructions: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Instruksi tambahan untuk pembayaran..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="mt-6 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5 text-yellow-400" />
                  Warna Theme
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Kustomisasi warna tampilan website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white">Warna Primer</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings?.primaryColor || '#FFD700'}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="w-12 h-10 p-1 bg-gray-700 border-gray-600"
                      />
                      <Input
                        value={settings?.primaryColor || '#FFD700'}
                        onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Warna Sekunder</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings?.secondaryColor || '#1a1a1a'}
                        onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                        className="w-12 h-10 p-1 bg-gray-700 border-gray-600"
                      />
                      <Input
                        value={settings?.secondaryColor || '#1a1a1a'}
                        onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white">Warna Background</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings?.backgroundColor || '#1a1a1a'}
                        onChange={(e) => setSettings({...settings, backgroundColor: e.target.value})}
                        className="w-12 h-10 p-1 bg-gray-700 border-gray-600"
                      />
                      <Input
                        value={settings?.backgroundColor || '#1a1a1a'}
                        onChange={(e) => setSettings({...settings, backgroundColor: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Mode Maintenance</CardTitle>
                <CardDescription className="text-gray-400">
                  Tampilkan halaman maintenance saat website sedang diperbaiki
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <Label className="text-white">Aktifkan Mode Maintenance</Label>
                    <p className="text-sm text-gray-400">Website tidak dapat diakses oleh pengunjung</p>
                  </div>
                  <Switch
                    checked={settings?.maintenanceMode ?? false}
                    onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                  />
                </div>
                {settings?.maintenanceMode && (
                  <div>
                    <Label className="text-white">Pesan Maintenance</Label>
                    <Textarea
                      value={settings?.maintenanceMessage || ''}
                      onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Website sedang dalam perbaikan. Silakan kembali lagi nanti."
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
