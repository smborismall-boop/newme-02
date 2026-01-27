import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image, X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { bannersAPI } from '../../services/api';

const Banners = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: 'slider',
    order: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState('slider');

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.getAll();
      setBanners(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memuat banner', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description || '');
      formDataObj.append('link', formData.link || '');
      formDataObj.append('type', formData.type);
      formDataObj.append('order', formData.order);

      if (editingBanner) {
        if (imageFile) {
          formDataObj.append('file', imageFile);
        }
        await bannersAPI.update(editingBanner._id, formDataObj);
        toast({ title: 'Sukses', description: 'Banner berhasil diupdate' });
      } else {
        if (!imageFile) {
          toast({ title: 'Error', description: 'Pilih gambar untuk banner', variant: 'destructive' });
          return;
        }
        formDataObj.append('file', imageFile);
        await bannersAPI.create(formDataObj);
        toast({ title: 'Sukses', description: 'Banner berhasil ditambahkan' });
      }

      setShowModal(false);
      resetForm();
      loadBanners();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan banner', variant: 'destructive' });
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      type: banner.type,
      order: banner.order
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus banner ini?')) return;
    try {
      await bannersAPI.delete(id);
      toast({ title: 'Sukses', description: 'Banner berhasil dihapus' });
      loadBanners();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus banner', variant: 'destructive' });
    }
  };

  const toggleBannerStatus = async (banner) => {
    try {
      const formDataObj = new FormData();
      formDataObj.append('isActive', !banner.isActive);
      await bannersAPI.update(banner._id, formDataObj);
      loadBanners();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', link: '', type: 'slider', order: 0 });
    setEditingBanner(null);
    setImageFile(null);
  };

  const filteredBanners = banners.filter(b => b.type === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Banners</h1>
          <p className="text-gray-400">Kelola banner slider dan popup</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Tambah Banner
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'slider' ? 'default' : 'outline'}
          onClick={() => setActiveTab('slider')}
          className={activeTab === 'slider' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          Slider ({banners.filter(b => b.type === 'slider').length})
        </Button>
        <Button
          variant={activeTab === 'popup' ? 'default' : 'outline'}
          onClick={() => setActiveTab('popup')}
          className={activeTab === 'popup' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          Popup ({banners.filter(b => b.type === 'popup').length})
        </Button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredBanners.length === 0 ? (
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-10 text-center">
            <Image className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Belum ada banner {activeTab}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBanners.sort((a, b) => a.order - b.order).map((banner) => (
            <Card key={banner._id} className="bg-[#2a2a2a] border-yellow-400/20 overflow-hidden">
              <div className="aspect-video relative">
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded text-xs ${banner.isActive ? 'bg-green-400 text-black' : 'bg-gray-400 text-white'}`}>
                    {banner.isActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-1">{banner.title}</h3>
                {banner.description && (
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{banner.description}</p>
                )}
                {banner.link && (
                  <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-yellow-400 text-sm flex items-center gap-1 mb-3">
                    <ExternalLink className="w-3 h-3" /> {banner.link}
                  </a>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-yellow-400/50 text-yellow-400" onClick={() => handleEdit(banner)}>
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-400/50 text-gray-400" onClick={() => toggleBannerStatus(banner)}>
                    {banner.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-400/50 text-red-400" onClick={() => handleDelete(banner._id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-yellow-400/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingBanner ? 'Edit Banner' : 'Tambah Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Judul</label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Deskripsi (opsional)</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[60px]" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Link (opsional)</label>
                <Input value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} placeholder="https://..." className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Tipe</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white">
                    <option value="slider">Slider</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Urutan</label>
                  <Input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Gambar {!editingBanner && '*'}</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-gray-400 text-sm mt-1" />
                {editingBanner && !imageFile && (
                  <p className="text-gray-500 text-xs mt-1">Biarkan kosong jika tidak ingin mengubah gambar</p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="flex-1 border-gray-400 text-gray-400">Batal</Button>
                <Button type="submit" className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
