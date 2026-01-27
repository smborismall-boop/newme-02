import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Mail, Lock, User, MapPin, Phone, Calendar, Building, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { authAPI } from '../../services/api';
import axios from 'axios';

// Indonesian Location API
const LOCATION_API = 'https://www.emsifa.com/api-wilayah-indonesia/api';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState('individual');
  const [settings, setSettings] = useState(null);
  
  // Location state
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState({ provinces: false, cities: false, districts: false, villages: false });
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    birthDate: '',
    whatsapp: '',
    referralSource: '',
    referralOther: '',
    referralCode: searchParams.get('ref') || '', // Get referral code from URL
    // Location fields
    provinceId: '',
    provinceName: '',
    cityId: '',
    cityName: '',
    districtId: '',
    districtName: '',
    villageId: '',
    villageName: '',
    // Institution fields
    institutionName: '',
    institutionAddress: '',
    position: ''
  });

  // Load provinces and settings on mount
  useEffect(() => {
    loadProvinces();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadProvinces = async () => {
    setLoadingLocation(prev => ({ ...prev, provinces: true }));
    try {
      const response = await fetch(`${LOCATION_API}/provinces.json`);
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
      toast({
        title: 'Peringatan',
        description: 'Gagal memuat data provinsi. Anda bisa mengisi manual.',
        variant: 'default'
      });
    } finally {
      setLoadingLocation(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async (provinceId) => {
    if (!provinceId) {
      setCities([]);
      return;
    }
    setLoadingLocation(prev => ({ ...prev, cities: true }));
    try {
      const response = await fetch(`${LOCATION_API}/regencies/${provinceId}.json`);
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error('Failed to load cities:', error);
    } finally {
      setLoadingLocation(prev => ({ ...prev, cities: false }));
    }
  };

  const loadDistricts = async (cityId) => {
    if (!cityId) {
      setDistricts([]);
      return;
    }
    setLoadingLocation(prev => ({ ...prev, districts: true }));
    try {
      const response = await fetch(`${LOCATION_API}/districts/${cityId}.json`);
      const data = await response.json();
      setDistricts(data);
    } catch (error) {
      console.error('Failed to load districts:', error);
    } finally {
      setLoadingLocation(prev => ({ ...prev, districts: false }));
    }
  };

  const loadVillages = async (districtId) => {
    if (!districtId) {
      setVillages([]);
      return;
    }
    setLoadingLocation(prev => ({ ...prev, villages: true }));
    try {
      const response = await fetch(`${LOCATION_API}/villages/${districtId}.json`);
      const data = await response.json();
      setVillages(data);
    } catch (error) {
      console.error('Failed to load villages:', error);
    } finally {
      setLoadingLocation(prev => ({ ...prev, villages: false }));
    }
  };

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => p.id === provinceId);
    setFormData(prev => ({
      ...prev,
      provinceId,
      provinceName: province?.name || '',
      cityId: '',
      cityName: '',
      districtId: '',
      districtName: '',
      villageId: '',
      villageName: ''
    }));
    setCities([]);
    setDistricts([]);
    setVillages([]);
    loadCities(provinceId);
  };

  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const city = cities.find(c => c.id === cityId);
    setFormData(prev => ({
      ...prev,
      cityId,
      cityName: city?.name || '',
      districtId: '',
      districtName: '',
      villageId: '',
      villageName: ''
    }));
    setDistricts([]);
    setVillages([]);
    loadDistricts(cityId);
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district = districts.find(d => d.id === districtId);
    setFormData(prev => ({
      ...prev,
      districtId,
      districtName: district?.name || '',
      villageId: '',
      villageName: ''
    }));
    setVillages([]);
    loadVillages(districtId);
  };

  const handleVillageChange = (e) => {
    const villageId = e.target.value;
    const village = villages.find(v => v.id === villageId);
    setFormData(prev => ({
      ...prev,
      villageId,
      villageName: village?.name || ''
    }));
  };

  const referralOptions = [
    { value: 'google', label: 'Google' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'iklan', label: 'Iklan' },
    { value: 'kerabat', label: 'Kerabat/Teman' },
    { value: 'other', label: 'Lainnya' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Password dan konfirmasi password tidak sama',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password minimal 6 karakter',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        address: formData.address,
        birthDate: formData.birthDate,
        whatsapp: formData.whatsapp,
        userType: userType,
        referralSource: formData.referralSource,
        referralOther: formData.referralSource === 'other' ? formData.referralOther : null,
        referralCode: formData.referralCode || null,
        // Location
        province: formData.provinceName || formData.provinceId,
        city: formData.cityName || formData.cityId,
        district: formData.districtName || formData.districtId,
        village: formData.villageName || formData.villageId,
        // Institution
        institutionName: userType === 'institution' ? formData.institutionName : null,
        institutionAddress: userType === 'institution' ? formData.institutionAddress : null,
        position: userType === 'institution' ? formData.position : null
      };

      const response = await authAPI.register(payload);
      
      if (response.data.success) {
        localStorage.setItem('user_token', response.data.token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        toast({
          title: 'Pendaftaran Berhasil',
          description: response.data.message
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Pendaftaran Gagal',
        description: error.response?.data?.detail || 'Terjadi kesalahan saat mendaftar',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-12 px-4">
      <Card className="w-full max-w-2xl mx-auto bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader className="text-center">
          {settings?.logoUrl ? (
            <img 
              src={`${BACKEND_URL}${settings.logoUrl}`}
              alt={settings.siteName || "NEWME CLASS"}
              className="h-16 mx-auto mb-4 object-contain"
              onError={(e) => {
                e.target.src = "/logo.png";
              }}
            />
          ) : (
            <img src="/logo.png" alt="NEWME CLASS" className="h-16 mx-auto mb-4 object-contain" />
          )}
          <CardTitle className="text-2xl font-bold text-white">Daftar Akun</CardTitle>
          <p className="text-gray-400">Buat akun NEWME CLASS Anda</p>
        </CardHeader>
        <CardContent>
          {/* User Type Selection */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              onClick={() => setUserType('individual')}
              className={`flex-1 ${userType === 'individual' ? 'bg-yellow-400 text-black' : 'bg-[#1a1a1a] text-gray-400 border border-yellow-400/20'}`}
            >
              <User className="w-4 h-4 mr-2" /> Individu
            </Button>
            <Button
              type="button"
              onClick={() => setUserType('institution')}
              className={`flex-1 ${userType === 'institution' ? 'bg-yellow-400 text-black' : 'bg-[#1a1a1a] text-gray-400 border border-yellow-400/20'}`}
            >
              <Building className="w-4 h-4 mr-2" /> Yayasan/Institusi
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Nama Lengkap *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    placeholder="Nama lengkap Anda"
                    className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@example.com"
                    className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">No. WhatsApp *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                    placeholder="08xxxxxxxxxx"
                    className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Tanggal Lahir *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                    className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm">Alamat Lengkap</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Alamat lengkap (nama jalan, nomor rumah, RT/RW)"
                  className="w-full pl-10 bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[80px]"
                />
              </div>
            </div>

            {/* Location Dropdowns */}
            <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-yellow-400/20">
              <h3 className="text-yellow-400 font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-2" /> Lokasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Province */}
                <div>
                  <label className="text-gray-400 text-sm">Provinsi *</label>
                  <div className="relative">
                    <select
                      value={formData.provinceId}
                      onChange={handleProvinceChange}
                      required
                      className="w-full bg-[#2a2a2a] border border-yellow-400/20 rounded-md p-2.5 text-white appearance-none pr-10"
                    >
                      <option value="">Pilih Provinsi</option>
                      {provinces.map(province => (
                        <option key={province.id} value={province.id}>{province.name}</option>
                      ))}
                    </select>
                    {loadingLocation.provinces ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="text-gray-400 text-sm">Kota/Kabupaten *</label>
                  <div className="relative">
                    <select
                      value={formData.cityId}
                      onChange={handleCityChange}
                      required
                      disabled={!formData.provinceId}
                      className="w-full bg-[#2a2a2a] border border-yellow-400/20 rounded-md p-2.5 text-white appearance-none pr-10 disabled:opacity-50"
                    >
                      <option value="">Pilih Kota/Kabupaten</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                    {loadingLocation.cities ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* District */}
                <div>
                  <label className="text-gray-400 text-sm">Kecamatan *</label>
                  <div className="relative">
                    <select
                      value={formData.districtId}
                      onChange={handleDistrictChange}
                      required
                      disabled={!formData.cityId}
                      className="w-full bg-[#2a2a2a] border border-yellow-400/20 rounded-md p-2.5 text-white appearance-none pr-10 disabled:opacity-50"
                    >
                      <option value="">Pilih Kecamatan</option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>{district.name}</option>
                      ))}
                    </select>
                    {loadingLocation.districts ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Village */}
                <div>
                  <label className="text-gray-400 text-sm">Kelurahan/Desa</label>
                  <div className="relative">
                    <select
                      value={formData.villageId}
                      onChange={handleVillageChange}
                      disabled={!formData.districtId}
                      className="w-full bg-[#2a2a2a] border border-yellow-400/20 rounded-md p-2.5 text-white appearance-none pr-10 disabled:opacity-50"
                    >
                      <option value="">Pilih Kelurahan/Desa</option>
                      {villages.map(village => (
                        <option key={village.id} value={village.id}>{village.name}</option>
                      ))}
                    </select>
                    {loadingLocation.villages ? (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400 animate-spin" />
                    ) : (
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Code (if from URL) */}
            {formData.referralCode && (
              <div className="bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                <p className="text-green-400 text-sm flex items-center">
                  <span className="mr-2">🎉</span>
                  Kode Referral: <strong className="ml-1">{formData.referralCode}</strong>
                </p>
              </div>
            )}

            {/* Institution Fields */}
            {userType === 'institution' && (
              <div className="space-y-4 p-4 bg-[#1a1a1a] rounded-lg border border-yellow-400/20">
                <h3 className="text-yellow-400 font-semibold">Informasi Institusi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Nama Yayasan/Institusi *</label>
                    <Input
                      type="text"
                      value={formData.institutionName}
                      onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                      required={userType === 'institution'}
                      placeholder="Nama institusi"
                      className="bg-[#2a2a2a] border-yellow-400/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Jabatan *</label>
                    <Input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      required={userType === 'institution'}
                      placeholder="e.g., Kepala Sekolah, HRD"
                      className="bg-[#2a2a2a] border-yellow-400/20 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Alamat Institusi *</label>
                  <textarea
                    value={formData.institutionAddress}
                    onChange={(e) => setFormData({ ...formData, institutionAddress: e.target.value })}
                    required={userType === 'institution'}
                    placeholder="Alamat lengkap institusi"
                    className="w-full bg-[#2a2a2a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[60px]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-gray-400 text-sm">Mengetahui NEWME dari mana? *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {referralOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, referralSource: option.value })}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      formData.referralSource === option.value
                        ? 'bg-yellow-400 text-black'
                        : 'bg-[#1a1a1a] text-gray-400 border border-yellow-400/20 hover:border-yellow-400/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {formData.referralSource === 'other' && (
                <Input
                  type="text"
                  value={formData.referralOther}
                  onChange={(e) => setFormData({ ...formData, referralOther: e.target.value })}
                  placeholder="Sebutkan dari mana..."
                  className="mt-2 bg-[#1a1a1a] border-yellow-400/20 text-white"
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    className="pl-10 pr-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Konfirmasi Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    placeholder="Ulangi password"
                    className="pl-10 bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Policy Agreement */}
            <div className="flex items-start space-x-2 p-4 bg-[#1a1a1a] rounded-lg border border-yellow-400/20">
              <input
                type="checkbox"
                id="privacyAgreement"
                required
                className="mt-1 w-4 h-4 rounded border-yellow-400/20 text-yellow-400 focus:ring-yellow-400"
              />
              <label htmlFor="privacyAgreement" className="text-sm text-gray-400 flex-1">
                Saya telah membaca dan menyetujui{' '}
                <Link 
                  to="/privacy-policy" 
                  target="_blank"
                  className="text-yellow-400 hover:text-yellow-300 underline"
                >
                  Kebijakan Privasi
                </Link>
                {' '}NEWME CLASS dan memberikan persetujuan untuk pemrosesan data pribadi saya sesuai dengan kebijakan yang berlaku.
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.referralSource}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center">
                  <UserPlus className="w-4 h-4 mr-2" /> Daftar Sekarang
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-yellow-400 hover:underline">
                Login
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 text-sm hover:text-gray-400">
              ← Kembali ke Beranda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
