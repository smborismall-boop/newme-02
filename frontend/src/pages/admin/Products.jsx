import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Search, Upload, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { productsAPI } from '../../services/api';

const Products = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    features: '',
    images: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memuat produk', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await productsAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrls = formData.images;

      if (imageFile) {
        const uploadRes = await productsAPI.uploadImage(imageFile);
        imageUrls = [...imageUrls, uploadRes.data.url];
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        features: formData.features.split('\n').filter(f => f.trim()),
        images: imageUrls,
        isActive: true
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        toast({ title: 'Sukses', description: 'Produk berhasil diupdate' });
      } else {
        await productsAPI.create(productData);
        toast({ title: 'Sukses', description: 'Produk berhasil ditambahkan' });
      }

      setShowModal(false);
      resetForm();
      loadProducts();
      loadStats();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan produk', variant: 'destructive' });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      features: product.features?.join('\n') || '',
      images: product.images || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await productsAPI.delete(id);
      toast({ title: 'Sukses', description: 'Produk berhasil dihapus' });
      loadProducts();
      loadStats();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus produk', variant: 'destructive' });
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      await productsAPI.update(product._id, { isActive: !product.isActive });
      loadProducts();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', category: '', stock: '', features: '', images: [] });
    setEditingProduct(null);
    setImageFile(null);
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400">Kelola produk untuk Shop</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Total Produk</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Aktif</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Non-Aktif</p>
              <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-4">
              <p className="text-gray-400 text-sm">Stok Habis</p>
              <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#2a2a2a] border-yellow-400/20 text-white"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product._id} className="bg-[#2a2a2a] border-yellow-400/20">
              <CardContent className="p-4">
                <div className="aspect-video bg-[#1a1a1a] rounded-lg mb-3 overflow-hidden">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-white font-semibold">{product.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${product.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'}`}>
                    {product.isActive ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-yellow-400 font-bold">{formatPrice(product.price)}</span>
                  <span className="text-gray-400 text-sm">Stok: {product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 border-yellow-400/50 text-yellow-400" onClick={() => handleEdit(product)}>
                    <Edit className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-400/50 text-gray-400" onClick={() => toggleProductStatus(product)}>
                    {product.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                  <Button size="sm" variant="outline" className="border-red-400/50 text-red-400" onClick={() => handleDelete(product._id)}>
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
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-yellow-400/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingProduct ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Nama Produk</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Deskripsi</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Harga (IDR)</label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Stok</label>
                  <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Kategori</label>
                <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required placeholder="e.g., Kelas, Buku, Merchandise" className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Fitur (satu per baris)</label>
                <textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="Fitur 1\nFitur 2\nFitur 3" className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[60px]" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Upload Gambar</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-gray-400 text-sm" />
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

export default Products;
