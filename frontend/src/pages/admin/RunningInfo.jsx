import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Link as LinkIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { runningInfoAPI } from '../../services/api';

const RunningInfo = () => {
  const { toast } = useToast();
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    message: '',
    isActive: true,
    priority: 0,
    linkUrl: '',
    linkText: '',
    bgColor: '#FFD700',
    textColor: '#1a1a1a'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await runningInfoAPI.getAll();
      setInfos(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingInfo(null);
    setFormData({
      message: '',
      isActive: true,
      priority: 0,
      linkUrl: '',
      linkText: '',
      bgColor: '#FFD700',
      textColor: '#1a1a1a'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (info) => {
    setEditingInfo(info);
    setFormData({
      message: info.message,
      isActive: info.isActive,
      priority: info.priority || 0,
      linkUrl: info.linkUrl || '',
      linkText: info.linkText || '',
      bgColor: info.bgColor || '#FFD700',
      textColor: info.textColor || '#1a1a1a'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('message', formData.message);
      data.append('isActive', formData.isActive);
      data.append('priority', formData.priority);
      data.append('linkUrl', formData.linkUrl);
      data.append('linkText', formData.linkText);
      data.append('bgColor', formData.bgColor);
      data.append('textColor', formData.textColor);

      if (editingInfo) {
        await runningInfoAPI.update(editingInfo._id, data);
        toast({
          title: 'Berhasil',
          description: 'Informasi berhasil diupdate'
        });
      } else {
        await runningInfoAPI.create(data);
        toast({
          title: 'Berhasil',
          description: 'Informasi berhasil dibuat'
        });
      }

      setShowModal(false);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal menyimpan',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (info) => {
    if (!window.confirm('Hapus informasi ini?')) return;

    try {
      await runningInfoAPI.delete(info._id);
      toast({
        title: 'Berhasil',
        description: 'Informasi berhasil dihapus'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus',
        variant: 'destructive'
      });
    }
  };

  const toggleActive = async (info) => {
    try {
      const data = new FormData();
      data.append('isActive', (!info.isActive).toString());
      await runningInfoAPI.update(info._id, data);
      toast({
        title: 'Berhasil',
        description: `Informasi ${!info.isActive ? 'diaktifkan' : 'dinonaktifkan'}`
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
          <h1 className="text-2xl font-bold text-white">Informasi Berjalan</h1>
          <p className="text-gray-400">Kelola pesan berjalan yang muncul di dashboard user</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Tambah Informasi
        </Button>
      </div>

      {/* Preview */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {infos.filter(i => i.isActive).length > 0 ? (
            <div 
              className="py-2 overflow-hidden rounded"
              style={{ backgroundColor: infos.find(i => i.isActive)?.bgColor || '#FFD700' }}
            >
              <div className="animate-marquee whitespace-nowrap">
                {infos.filter(i => i.isActive).map((info, idx) => (
                  <span 
                    key={idx} 
                    className="mx-8"
                    style={{ color: info.textColor || '#1a1a1a' }}
                  >
                    {info.message}
                    {info.linkUrl && (
                      <a href={info.linkUrl} className="ml-2 underline font-semibold">
                        {info.linkText || 'Selengkapnya'}
                      </a>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">Tidak ada informasi aktif</p>
          )}
        </CardContent>
      </Card>

      {/* List */}
      <Card className="bg-[#2a2a2a] border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Daftar Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          {infos.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Belum ada informasi</p>
            </div>
          ) : (
            <div className="space-y-3">
              {infos.map((info) => (
                <div
                  key={info._id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        info.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {info.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="text-gray-500 text-xs">Priority: {info.priority}</span>
                    </div>
                    <p className="text-white">{info.message}</p>
                    {info.linkUrl && (
                      <div className="flex items-center gap-1 mt-1 text-gray-400 text-sm">
                        <LinkIcon className="w-3 h-3" />
                        <span>{info.linkText || 'Link'}: {info.linkUrl}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-600" 
                        style={{ backgroundColor: info.bgColor }}
                        title={`BG: ${info.bgColor}`}
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-600" 
                        style={{ backgroundColor: info.textColor }}
                        title={`Text: ${info.textColor}`}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleActive(info)}
                      className="text-gray-400 hover:text-white"
                    >
                      {info.isActive ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(info)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(info)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg">
            <div className="p-6 border-b border-yellow-400/20">
              <h2 className="text-xl font-bold text-white">
                {editingInfo ? 'Edit Informasi' : 'Tambah Informasi'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Pesan *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={3}
                  className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-3 text-white"
                  placeholder="Masukkan pesan informasi..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Priority</label>
                  <Input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                  />
                  <p className="text-gray-500 text-xs mt-1">Semakin tinggi, semakin prioritas</p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-gray-400 text-sm">
                    Aktif
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Link URL</label>
                  <Input
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Link Text</label>
                  <Input
                    value={formData.linkText}
                    onChange={(e) => setFormData({ ...formData, linkText: e.target.value })}
                    className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                    placeholder="Selengkapnya"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Warna Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Warna Text</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.textColor}
                      onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                      className="bg-[#1a1a1a] border-yellow-400/20 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="text-gray-400 text-sm">Preview</label>
                <div 
                  className="mt-2 py-2 px-4 rounded"
                  style={{ backgroundColor: formData.bgColor, color: formData.textColor }}
                >
                  {formData.message || 'Preview pesan akan muncul di sini...'}
                  {formData.linkUrl && (
                    <span className="ml-2 underline font-semibold">
                      {formData.linkText || 'Selengkapnya'}
                    </span>
                  )}
                </div>
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

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default RunningInfo;
