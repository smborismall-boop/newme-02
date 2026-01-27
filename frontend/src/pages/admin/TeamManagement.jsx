import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, Users, Briefcase, Handshake } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TeamManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('bod'); // 'bod', 'team', 'partners'
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    photo: '',
    description: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/settings`);
      setSettings(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memuat data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentList = () => {
    if (!settings) return [];
    switch (activeTab) {
      case 'bod':
        return settings.boardOfDirectors || [];
      case 'team':
        return settings.teamSupport || [];
      case 'partners':
        return settings.partners || [];
      default:
        return [];
    }
  };

  const getFieldName = () => {
    switch (activeTab) {
      case 'bod': return 'boardOfDirectors';
      case 'team': return 'teamSupport';
      case 'partners': return 'partners';
      default: return '';
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', position: '', photo: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (item, index) => {
    setEditingItem(index);
    setFormData({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Yakin ingin menghapus?')) return;

    try {
      const currentList = getCurrentList();
      const newList = currentList.filter((_, i) => i !== index);
      
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${BACKEND_URL}/api/settings`,
        { [getFieldName()]: newList },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      await loadSettings();
      toast({ title: 'Sukses', description: 'Data berhasil dihapus' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus data', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.position) {
      toast({ title: 'Error', description: 'Nama dan posisi wajib diisi', variant: 'destructive' });
      return;
    }

    try {
      const currentList = getCurrentList();
      let newList;
      
      if (editingItem !== null) {
        // Edit existing
        newList = currentList.map((item, i) => i === editingItem ? formData : item);
      } else {
        // Add new
        newList = [...currentList, formData];
      }

      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${BACKEND_URL}/api/settings`,
        { [getFieldName()]: newList },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      await loadSettings();
      setShowModal(false);
      toast({ title: 'Sukses', description: 'Data berhasil disimpan' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan data', variant: 'destructive' });
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.post(
        `${BACKEND_URL}/api/settings/upload/team`,
        formDataUpload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFormData({ ...formData, photo: response.data.url });
      toast({ title: 'Sukses', description: 'Foto berhasil diupload' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal upload foto', variant: 'destructive' });
    }
  };

  const tabs = [
    { id: 'bod', label: 'Board of Directors', icon: Briefcase, color: 'yellow' },
    { id: 'team', label: 'Team Support', icon: Users, color: 'blue' },
    { id: 'partners', label: 'Mitra Yayasan & Korporasi', icon: Handshake, color: 'green' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-gray-400">Kelola BOD, Tim Support, dan Mitra</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-yellow-400/20">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={handleAdd} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" />
          Tambah {activeTab === 'bod' ? 'BOD' : activeTab === 'team' ? 'Team' : 'Mitra'}
        </Button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getCurrentList().map((item, index) => (
          <Card key={index} className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6">
              {item.photo && (
                <div className="mb-4">
                  <img
                    src={item.photo.startsWith('http') ? item.photo : `${BACKEND_URL}${item.photo}`}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
              <p className="text-yellow-400 mb-2">{item.position}</p>
              {item.description && (
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{item.description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(item, index)}
                  className="flex-1 text-yellow-400 hover:bg-yellow-400/10"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(index)}
                  className="flex-1 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {getCurrentList().length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400">Belum ada data. Klik "Tambah" untuk menambah.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl bg-[#2a2a2a] border-yellow-400/20 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">
                {editingItem !== null ? 'Edit' : 'Tambah'} {activeTab === 'bod' ? 'BOD' : activeTab === 'team' ? 'Team' : 'Mitra'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Isi form di bawah untuk {editingItem !== null ? 'mengubah' : 'menambah'} data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Nama *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nama lengkap"
                  className="bg-[#1a1a1a] text-white border-yellow-400/20"
                />
              </div>

              <div>
                <Label className="text-white">Posisi / Jabatan *</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="CEO, Manager, Partner, dll"
                  className="bg-[#1a1a1a] text-white border-yellow-400/20"
                />
              </div>

              <div>
                <Label className="text-white">Deskripsi (opsional)</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi singkat"
                  className="bg-[#1a1a1a] text-white border-yellow-400/20"
                />
              </div>

              <div>
                <Label className="text-white">Foto</Label>
                {formData.photo && (
                  <div className="mb-2">
                    <img
                      src={formData.photo.startsWith('http') ? formData.photo : `${BACKEND_URL}${formData.photo}`}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadPhoto}
                    className="bg-[#1a1a1a] text-white border-yellow-400/20"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-yellow-400/20 text-yellow-400"
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Atau paste URL gambar langsung di field Photo URL
                </p>
                <Input
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="bg-[#1a1a1a] text-white border-yellow-400/20 mt-2"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  Simpan
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1 border-yellow-400/20 text-gray-400"
                >
                  Batal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
