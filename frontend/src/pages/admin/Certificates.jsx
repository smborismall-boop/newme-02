import React, { useState, useEffect } from 'react';
import { Award, Upload, Save, Users, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { certificatesAPI, usersAPI } from '../../services/api';

const Certificates = () => {
  const { toast } = useToast();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [issuedCerts, setIssuedCerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('template');
  const [issueForm, setIssueForm] = useState({ userId: '', courseName: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templateRes, certsRes, usersRes] = await Promise.all([
        certificatesAPI.getTemplate(),
        certificatesAPI.getIssued(),
        usersAPI.getAll()
      ]);
      setTemplate(templateRes.data);
      setIssuedCerts(certsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(template).forEach(key => {
        if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, template[key]);
        }
      });
      await certificatesAPI.updateTemplate(formData);
      toast({ title: 'Sukses', description: 'Template berhasil disimpan' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan template', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAsset = async (assetType, file) => {
    try {
      const response = await certificatesAPI.uploadAsset(assetType, file);
      setTemplate({ ...template, [`${assetType}Url`]: response.data.url });
      toast({ title: 'Sukses', description: `${assetType} berhasil diupload` });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal upload file', variant: 'destructive' });
    }
  };

  const handleIssueCertificate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('userId', issueForm.userId);
      formData.append('courseName', issueForm.courseName);
      
      const response = await certificatesAPI.issue(formData);
      toast({ title: 'Sukses', description: `Sertifikat diterbitkan: ${response.data.certificateNumber}` });
      setIssueForm({ userId: '', courseName: '' });
      loadData();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menerbitkan sertifikat', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Certificates</h1>
        <p className="text-gray-400">Kelola template dan penerbitan sertifikat</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'template' ? 'default' : 'outline'}
          onClick={() => setActiveTab('template')}
          className={activeTab === 'template' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          <FileText className="w-4 h-4 mr-2" /> Template
        </Button>
        <Button
          variant={activeTab === 'issue' ? 'default' : 'outline'}
          onClick={() => setActiveTab('issue')}
          className={activeTab === 'issue' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          <Award className="w-4 h-4 mr-2" /> Terbitkan
        </Button>
        <Button
          variant={activeTab === 'issued' ? 'default' : 'outline'}
          onClick={() => setActiveTab('issued')}
          className={activeTab === 'issued' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          <Users className="w-4 h-4 mr-2" /> Diterbitkan ({issuedCerts.length})
        </Button>
      </div>

      {/* Template Tab */}
      {activeTab === 'template' && template && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Pengaturan Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Judul Sertifikat</label>
                <Input value={template.titleText || ''} onChange={(e) => setTemplate({ ...template, titleText: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Subtitle</label>
                <Input value={template.subtitleText || ''} onChange={(e) => setTemplate({ ...template, subtitleText: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Teks Penyelesaian</label>
                <Input value={template.completionText || ''} onChange={(e) => setTemplate({ ...template, completionText: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Nama Penandatangan</label>
                  <Input value={template.signerName || ''} onChange={(e) => setTemplate({ ...template, signerName: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Jabatan</label>
                  <Input value={template.signerTitle || ''} onChange={(e) => setTemplate({ ...template, signerTitle: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Warna Teks</label>
                  <Input type="color" value={template.textColor || '#000000'} onChange={(e) => setTemplate({ ...template, textColor: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 h-10" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Warna Aksen</label>
                  <Input type="color" value={template.accentColor || '#FFD700'} onChange={(e) => setTemplate({ ...template, accentColor: e.target.value })} className="bg-[#1a1a1a] border-yellow-400/20 h-10" />
                </div>
              </div>
              <Button onClick={handleSaveTemplate} disabled={saving} className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Template'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Upload Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Background Sertifikat</label>
                <div className="flex gap-2 mt-1">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleUploadAsset('background', e.target.files[0])} className="flex-1 text-gray-400 text-sm" />
                </div>
                {template.backgroundUrl && <img src={template.backgroundUrl} alt="Background" className="mt-2 h-20 object-contain" />}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Logo</label>
                <div className="flex gap-2 mt-1">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleUploadAsset('logo', e.target.files[0])} className="flex-1 text-gray-400 text-sm" />
                </div>
                {template.logoUrl && <img src={template.logoUrl} alt="Logo" className="mt-2 h-16 object-contain" />}
              </div>
              <div>
                <label className="text-gray-400 text-sm">Tanda Tangan</label>
                <div className="flex gap-2 mt-1">
                  <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleUploadAsset('signature', e.target.files[0])} className="flex-1 text-gray-400 text-sm" />
                </div>
                {template.signatureUrl && <img src={template.signatureUrl} alt="Signature" className="mt-2 h-12 object-contain" />}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issue Tab */}
      {activeTab === 'issue' && (
        <Card className="bg-[#2a2a2a] border-yellow-400/20 max-w-lg">
          <CardHeader>
            <CardTitle className="text-white">Terbitkan Sertifikat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssueCertificate} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Pilih Pengguna</label>
                <select value={issueForm.userId} onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })} required className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white">
                  <option value="">-- Pilih Pengguna --</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Nama Kursus/Program</label>
                <Input value={issueForm.courseName} onChange={(e) => setIssueForm({ ...issueForm, courseName: e.target.value })} required placeholder="e.g., NEWME Test Level 1" className="bg-[#1a1a1a] border-yellow-400/20 text-white" />
              </div>
              <Button type="submit" className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                <Award className="w-4 h-4 mr-2" /> Terbitkan Sertifikat
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Issued Tab */}
      {activeTab === 'issued' && (
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr>
                    <th className="text-left p-4 text-gray-400 text-sm">No. Sertifikat</th>
                    <th className="text-left p-4 text-gray-400 text-sm">Nama</th>
                    <th className="text-left p-4 text-gray-400 text-sm">Kursus</th>
                    <th className="text-left p-4 text-gray-400 text-sm">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedCerts.map((cert) => (
                    <tr key={cert._id} className="border-t border-yellow-400/10">
                      <td className="p-4 text-yellow-400 font-mono text-sm">{cert.certificateNumber}</td>
                      <td className="p-4 text-white">{cert.userName}</td>
                      <td className="p-4 text-gray-400">{cert.courseName}</td>
                      <td className="p-4 text-gray-400 text-sm">{new Date(cert.issuedAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                  {issuedCerts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-gray-400">Belum ada sertifikat yang diterbitkan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Certificates;
