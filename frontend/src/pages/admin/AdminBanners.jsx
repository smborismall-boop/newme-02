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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, GripVertical } from "lucide-react";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    type: 'slider',
    order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API}/banners`);
      setBanners(response.data);
    } catch (error) {
      toast.error('Gagal memuat banner');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedBanner(null);
    setFile(null);
    setFormData({
      title: '',
      description: '',
      link: '',
      type: 'slider',
      order: banners.length
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (banner) => {
    setSelectedBanner(banner);
    setFile(null);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      link: banner.link || '',
      type: banner.type,
      order: banner.order
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
        toast.error('Hanya file gambar yang diperbolehkan');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 10MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedBanner && !file) {
      toast.error('Pilih gambar untuk banner');
      return;
    }

    setUploading(true);
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      };

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('link', formData.link);
      uploadData.append('type', formData.type);
      uploadData.append('order', formData.order);
      
      if (file) {
        uploadData.append('file', file);
      }

      if (selectedBanner) {
        // Update
        await axios.put(`${API}/banners/${selectedBanner._id}`, uploadData, { headers });
        toast.success('Banner berhasil diupdate');
      } else {
        // Create
        await axios.post(`${API}/banners`, uploadData, { headers });
        toast.success('Banner berhasil ditambahkan');
      }
      
      setDialogOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API}/banners/${selectedBanner._id}`, { headers });
      toast.success('Banner berhasil dihapus');
      setDeleteDialogOpen(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menghapus banner');
    }
  };

  const toggleActive = async (banner) => {
    try {
      const headers = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      };
      const uploadData = new FormData();
      uploadData.append('isActive', (!banner.isActive).toString());
      
      await axios.put(`${API}/banners/${banner._id}`, uploadData, { headers });
      toast.success('Status banner diupdate');
      fetchBanners();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <AdminLayout activeMenu="banners">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Kelola Banner</h2>
            <p className="text-gray-400">Kelola banner dan slider di halaman utama</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
            <Plus className="mr-2 h-4 w-4" /> Tambah Banner
          </Button>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Daftar Banner</CardTitle>
            <CardDescription className="text-gray-400">
              Banner akan ditampilkan di halaman utama website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400">Memuat...</p>
            ) : banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                <p className="text-gray-400 mt-4">Belum ada banner.</p>
                <Button onClick={handleOpenCreate} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Banner Pertama
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                  <Card key={banner._id} className="bg-gray-700 border-gray-600 overflow-hidden">
                    <div className="relative aspect-video">
                      {banner.imageUrl && (
                        <img 
                          src={`${BACKEND_URL}${banner.imageUrl}`} 
                          alt={banner.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2">
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => toggleActive(banner)}
                        />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-white truncate">{banner.title}</h3>
                      {banner.description && (
                        <p className="text-gray-400 text-sm mt-1 truncate">{banner.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          banner.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-600 text-gray-400'
                        }`}>
                          {banner.isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenEdit(banner)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenDelete(banner)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedBanner ? 'Edit Banner' : 'Tambah Banner'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">Judul Banner *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Masukkan judul banner"
                />
              </div>

              <div>
                <Label className="text-white">Deskripsi</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Masukkan deskripsi (opsional)"
                />
              </div>

              <div>
                <Label className="text-white">Link (URL)</Label>
                <Input
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="https://example.com (opsional)"
                />
              </div>

              <div>
                <Label className="text-white">Tipe Banner</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white">Gambar Banner {!selectedBanner && '*'}</Label>
                <div className="mt-2">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">
                        {file ? file.name : 'Klik untuk upload gambar'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, WEBP, GIF (Max. 10MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {(file || (selectedBanner?.imageUrl)) && (
                  <div className="mt-2">
                    <img 
                      src={file ? URL.createObjectURL(file) : `${BACKEND_URL}${selectedBanner.imageUrl}`} 
                      alt="Preview" 
                      className="max-h-40 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-600">
                  Batal
                </Button>
                <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900" disabled={uploading}>
                  {uploading ? 'Menyimpan...' : (selectedBanner ? 'Update' : 'Simpan')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Hapus Banner</DialogTitle>
            </DialogHeader>
            <p className="text-gray-300">
              Apakah Anda yakin ingin menghapus banner "{selectedBanner?.title}"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-gray-600">
                Batal
              </Button>
              <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                Hapus
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
