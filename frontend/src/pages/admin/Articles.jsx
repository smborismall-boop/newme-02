import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Eye, EyeOff, Image, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { articlesAPI } from '../../services/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Articles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'berita',
    tags: '',
    isPublished: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [articlesRes, statsRes] = await Promise.all([
        articlesAPI.getAll(),
        articlesAPI.getStats()
      ]);
      setArticles(articlesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data artikel',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'berita',
      tags: '',
      isPublished: true
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || '',
      category: article.category,
      tags: article.tags?.join(', ') || '',
      isPublished: article.isPublished
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('excerpt', formData.excerpt);
      data.append('category', formData.category);
      data.append('tags', formData.tags);
      data.append('isPublished', formData.isPublished);
      
      if (imageFile) {
        data.append('file', imageFile);
      }

      if (editingArticle) {
        await articlesAPI.update(editingArticle._id, data);
        toast({
          title: 'Berhasil',
          description: 'Artikel berhasil diupdate'
        });
      } else {
        await articlesAPI.create(data);
        toast({
          title: 'Berhasil',
          description: 'Artikel berhasil dibuat'
        });
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal menyimpan artikel',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (article) => {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return;

    try {
      await articlesAPI.delete(article._id);
      toast({
        title: 'Berhasil',
        description: 'Artikel berhasil dihapus'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus artikel',
        variant: 'destructive'
      });
    }
  };

  const togglePublish = async (article) => {
    try {
      const data = new FormData();
      data.append('isPublished', (!article.isPublished).toString());
      await articlesAPI.update(article._id, data);
      toast({
        title: 'Berhasil',
        description: `Artikel ${!article.isPublished ? 'dipublikasikan' : 'disembunyikan'}`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive'
      });
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Artikel & Berita</h1>
          <p className="text-gray-400">Kelola artikel untuk halaman berita</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Tambah Artikel
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Artikel</p>
            <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Dipublikasikan</p>
            <p className="text-2xl font-bold text-green-400">{stats?.published || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Draft</p>
            <p className="text-2xl font-bold text-yellow-400">{stats?.draft || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Views</p>
            <p className="text-2xl font-bold text-blue-400">{stats?.totalViews || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-[#2a2a2a] border-yellow-400/20 text-white"
        />
      </div>

      {/* Articles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredArticles.map((article) => (
          <Card key={article._id} className="bg-[#2a2a2a] border-yellow-400/20 overflow-hidden">
            {article.featuredImage && (
              <img
                src={`${BACKEND_URL}${article.featuredImage}`}
                alt={article.title}
                className="w-full h-40 object-cover"
              />
            )}
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  article.isPublished ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {article.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-blue-400/20 text-blue-400">
                  {article.category}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-500 text-xs">{article.viewCount || 0} views</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublish(article)}
                    className="text-gray-400 hover:text-white"
                  >
                    {article.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenEdit(article)}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(article)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Belum ada artikel</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-yellow-400/20">
              <h2 className="text-xl font-bold text-white">
                {editingArticle ? 'Edit Artikel' : 'Tambah Artikel'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Judul *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Excerpt</label>
                <Input
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                  placeholder="Ringkasan singkat artikel"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm">Konten *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={8}
                  className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-2 text-white"
                  >
                    <option value="berita">Berita</option>
                    <option value="tips">Tips & Trik</option>
                    <option value="pengumuman">Pengumuman</option>
                    <option value="edukasi">Edukasi</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Tags</label>
                  <Input
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                    placeholder="Pisahkan dengan koma"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm">Gambar Utama</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-gray-400 text-sm"
                />
                {(imageFile || editingArticle?.featuredImage) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : `${BACKEND_URL}${editingArticle.featuredImage}`}
                    alt="Preview"
                    className="mt-2 max-h-32 rounded"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isPublished" className="text-gray-400 text-sm">
                  Publikasikan langsung
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-yellow-400/20">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-gray-600"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Articles;
