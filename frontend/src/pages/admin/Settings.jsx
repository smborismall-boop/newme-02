import React, { useState, useEffect } from 'react';
import { Save, Upload, Palette, Mail, Phone, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Settings = () => {
  const { toast } = useToast();
  const { reloadSettings, applyTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(`${API_URL}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Apply theme immediately after save
      applyTheme(settings);
      
      // Reload settings from server
      await reloadSettings();
      
      toast({
        title: 'Berhasil!',
        description: 'Settings berhasil disimpan',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan settings',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (type, file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const response = await axios.post(
        `${API_URL}/api/settings/upload/${type}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast({
        title: 'Berhasil!',
        description: `${type} berhasil diupload`,
      });

      loadSettings();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal upload file',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <Button onClick={handleSave} className="bg-yellow-400 hover:bg-yellow-500 text-[#1a1a1a]">
          <Save className="w-4 h-4 mr-2" />
          Simpan Semua
        </Button>
      </div>

      {/* Site Info */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Informasi Situs</CardTitle>
          <CardDescription className="text-gray-400">Pengaturan dasar website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Nama Situs</Label>
              <Input
                value={settings.siteName || ''}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Site Title</Label>
              <Input
                value={settings.siteTitle || ''}
                onChange={(e) => handleChange('siteTitle', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white">Site Description</Label>
            <Textarea
              value={settings.siteDescription || ''}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              className="bg-[#1a1a1a] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Informasi Kontak</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Email</Label>
              <Input
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Phone</Label>
              <Input
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
            <div>
              <Label className="text-white">WhatsApp (dengan 62)</Label>
              <Input
                value={settings.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="6289502671691"
                className="bg-[#1a1a1a] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Instagram</Label>
              <Input
                value={settings.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="@newmeclass"
                className="bg-[#1a1a1a] text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-white">Alamat</Label>
            <Textarea
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="bg-[#1a1a1a] text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Tema & Warna</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.primaryColor || '#FFD700'}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.primaryColor || ''}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="bg-[#1a1a1a] text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.secondaryColor || '#1a1a1a'}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.secondaryColor || ''}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="bg-[#1a1a1a] text-white"
                />
              </div>
            </div>
            <div>
              <Label className="text-white">Background Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={settings.backgroundColor || '#1a1a1a'}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="w-16 h-10"
                />
                <Input
                  value={settings.backgroundColor || ''}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="bg-[#1a1a1a] text-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Upload */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Logo & Favicon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Upload Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileUpload('logo', e.target.files[0])}
                className="bg-[#1a1a1a] text-white"
              />
              {settings.logoUrl && (
                <img src={`${API_URL}${settings.logoUrl}`} alt="Logo" className="mt-2 h-16" />
              )}
            </div>
            <div>
              <Label className="text-white">Upload Favicon</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files[0] && handleFileUpload('favicon', e.target.files[0])}
                className="bg-[#1a1a1a] text-white"
              />
              {settings.faviconUrl && (
                <img src={`${API_URL}${settings.faviconUrl}`} alt="Favicon" className="mt-2 h-8" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>SEO Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">SEO Keywords (pisahkan dengan koma)</Label>
            <Input
              value={settings.seoKeywords || ''}
              onChange={(e) => handleChange('seoKeywords', e.target.value)}
              placeholder="newme class, talent development, bakat alami"
              className="bg-[#1a1a1a] text-white"
            />
          </div>
          <div>
            <Label className="text-white">Meta Description</Label>
            <Textarea
              value={settings.seoMetaDescription || ''}
              onChange={(e) => handleChange('seoMetaDescription', e.target.value)}
              className="bg-[#1a1a1a] text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Google Analytics ID</Label>
              <Input
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="bg-[#1a1a1a] text-white"
              />
            </div>
            <div>
              <Label className="text-white">Facebook Pixel ID</Label>
              <Input
                value={settings.facebookPixelId || ''}
                onChange={(e) => handleChange('facebookPixelId', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Site Features */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Pengaturan Fitur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Maintenance Mode</Label>
              <p className="text-gray-400 text-sm">Aktifkan untuk menonaktifkan akses publik</p>
            </div>
            <Switch
              checked={settings.maintenanceMode || false}
              onCheckedChange={(checked) => handleChange('maintenanceMode', checked)}
            />
          </div>
          {settings.maintenanceMode && (
            <div>
              <Label className="text-white">Pesan Maintenance</Label>
              <Input
                value={settings.maintenanceMessage || ''}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                className="bg-[#1a1a1a] text-white"
              />
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Izinkan Registrasi</Label>
              <p className="text-gray-400 text-sm">Buka/tutup pendaftaran user baru</p>
            </div>
            <Switch
              checked={settings.allowRegistration !== false}
              onCheckedChange={(checked) => handleChange('allowRegistration', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Aktifkan Popup Banner</Label>
              <p className="text-gray-400 text-sm">Tampilkan popup promosi di halaman utama</p>
            </div>
            <Switch
              checked={settings.popupEnabled !== false}
              onCheckedChange={(checked) => handleChange('popupEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings for Test */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Pengaturan Pembayaran Test</CardTitle>
          <CardDescription className="text-gray-400">Pengaturan pembayaran untuk NEWME Test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Wajib Pembayaran</Label>
              <p className="text-gray-400 text-sm">User harus bayar sebelum bisa test</p>
            </div>
            <Switch
              checked={settings.requirePayment !== false}
              onCheckedChange={(checked) => handleChange('requirePayment', checked)}
            />
          </div>
          {settings.requirePayment !== false && (
            <>
              <div>
                <Label className="text-white">Harga Test (IDR)</Label>
                <Input
                  type="number"
                  value={settings.paymentAmount || 50000}
                  onChange={(e) => handleChange('paymentAmount', parseFloat(e.target.value))}
                  className="bg-[#1a1a1a] text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Nama Bank</Label>
                  <Input
                    value={settings.bankName || ''}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="BCA, Mandiri, BNI, dll"
                    className="bg-[#1a1a1a] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">No. Rekening</Label>
                  <Input
                    value={settings.bankAccountNumber || ''}
                    onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                    placeholder="1234567890"
                    className="bg-[#1a1a1a] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Atas Nama</Label>
                  <Input
                    value={settings.bankAccountName || ''}
                    onChange={(e) => handleChange('bankAccountName', e.target.value)}
                    placeholder="PT NEWME CLASS"
                    className="bg-[#1a1a1a] text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Instruksi Pembayaran</Label>
                <Textarea
                  value={settings.paymentInstructions || ''}
                  onChange={(e) => handleChange('paymentInstructions', e.target.value)}
                  placeholder="Transfer ke rekening di atas lalu upload bukti pembayaran..."
                  className="bg-[#1a1a1a] text-white"
                  rows={4}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Midtrans Settings for Shop */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Pengaturan Midtrans (Shop)</CardTitle>
          <CardDescription className="text-gray-400">Konfigurasi payment gateway untuk Shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Aktifkan Midtrans</Label>
              <p className="text-gray-400 text-sm">Gunakan Midtrans untuk pembayaran di Shop</p>
            </div>
            <Switch
              checked={settings.midtransEnabled || false}
              onCheckedChange={(checked) => handleChange('midtransEnabled', checked)}
            />
          </div>
          {settings.midtransEnabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Server Key</Label>
                  <Input
                    type="password"
                    value={settings.midtransServerKey || ''}
                    onChange={(e) => handleChange('midtransServerKey', e.target.value)}
                    placeholder="SB-Mid-server-xxx atau Mid-server-xxx"
                    className="bg-[#1a1a1a] text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Client Key</Label>
                  <Input
                    value={settings.midtransClientKey || ''}
                    onChange={(e) => handleChange('midtransClientKey', e.target.value)}
                    placeholder="SB-Mid-client-xxx atau Mid-client-xxx"
                    className="bg-[#1a1a1a] text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Mode Production</Label>
                  <p className="text-gray-400 text-sm">Matikan untuk mode Sandbox (testing)</p>
                </div>
                <Switch
                  checked={settings.midtransIsProduction || false}
                  onCheckedChange={(checked) => handleChange('midtransIsProduction', checked)}
                />
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-lg">
                <p className="text-gray-400 text-sm">
                  <strong className="text-yellow-400">Catatan:</strong> Dapatkan API keys dari{' '}
                  <a href="https://dashboard.midtrans.com" target="_blank" rel="noopener noreferrer" className="text-yellow-400 underline">
                    Midtrans Dashboard
                  </a>
                  {' '}→ Settings → Access Keys
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Board of Directors */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Board of Directors (BOD)</CardTitle>
          <CardDescription className="text-gray-400">Dewan Direksi Perusahaan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={JSON.stringify(settings.boardOfDirectors || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange('boardOfDirectors', parsed);
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            placeholder='[{"name": "John Doe", "position": "CEO", "photo": "/uploads/team/ceo.jpg"}]'
            className="bg-[#1a1a1a] text-white font-mono text-sm"
            rows={6}
          />
          <p className="text-gray-400 text-xs">Format JSON: Array of objects dengan fields: name, position, photo</p>
        </CardContent>
      </Card>

      {/* Team Support */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Team Support</CardTitle>
          <CardDescription className="text-gray-400">Tim Pendukung & Staff</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={JSON.stringify(settings.teamSupport || [], null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleChange('teamSupport', parsed);
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            placeholder='[{"name": "Jane Smith", "position": "Support Manager", "photo": "/uploads/team/manager.jpg"}]'
            className="bg-[#1a1a1a] text-white font-mono text-sm"
            rows={6}
          />
          <p className="text-gray-400 text-xs">Format JSON: Array of objects dengan fields: name, position, photo</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;