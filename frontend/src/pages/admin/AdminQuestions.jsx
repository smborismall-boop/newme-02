import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { toast } from "sonner";
import { AdminLayout } from "./AdminDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, GripVertical, Sparkles, Crown } from "lucide-react";

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('free');
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    category: 'personality',
    testType: 'free',
    options: [{ text: '', value: '', score: 0 }],
    isRequired: true,
    order: 0
  });

  useEffect(() => {
    fetchQuestions();
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { Authorization: `Bearer ${token}` };
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/questions?testType=${activeTab}`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Gagal memuat pertanyaan');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedQuestion(null);
    setFormData({
      text: '',
      type: 'multiple_choice',
      category: 'personality',
      testType: activeTab,
      options: [{ text: '', value: '', score: 0 }],
      isRequired: true,
      order: questions.length
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (question) => {
    setSelectedQuestion(question);
    setFormData({
      text: question.text,
      type: question.type,
      category: question.category,
      testType: question.testType,
      options: question.options || [{ text: '', value: '', score: 0 }],
      isRequired: question.isRequired,
      order: question.order
    });
    setDialogOpen(true);
  };

  const handleOpenDelete = (question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', value: '', score: 0 }]
    });
  };

  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = getAuthHeaders();
      
      if (selectedQuestion) {
        // Update
        await axios.put(`${API}/questions/${selectedQuestion._id}`, formData, { headers });
        toast.success('Pertanyaan berhasil diupdate');
      } else {
        // Create
        await axios.post(`${API}/questions`, formData, { headers });
        toast.success('Pertanyaan berhasil ditambahkan');
      }
      
      setDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menyimpan pertanyaan');
    }
  };

  const handleDelete = async () => {
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API}/questions/${selectedQuestion._id}`, { headers });
      toast.success('Pertanyaan berhasil dihapus');
      setDeleteDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gagal menghapus pertanyaan');
    }
  };

  const toggleActive = async (question) => {
    try {
      const headers = getAuthHeaders();
      await axios.put(`${API}/questions/${question._id}`, {
        isActive: !question.isActive
      }, { headers });
      toast.success('Status pertanyaan diupdate');
      fetchQuestions();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  return (
    <AdminLayout activeMenu="questions">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white">Kelola Pertanyaan</h2>
            <p className="text-gray-400">Kelola pertanyaan test gratis dan berbayar</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
            <Plus className="mr-2 h-4 w-4" /> Tambah Pertanyaan
          </Button>
        </div>

        {/* Tabs for Free/Paid */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800">
            <TabsTrigger value="free" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <Sparkles className="mr-2 h-4 w-4" /> Pertanyaan Gratis
            </TabsTrigger>
            <TabsTrigger value="paid" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-gray-900">
              <Crown className="mr-2 h-4 w-4" /> Pertanyaan Berbayar
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {activeTab === 'free' ? 'Pertanyaan Gratis' : 'Pertanyaan Berbayar'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {activeTab === 'free' 
                    ? 'Pertanyaan yang bisa diakses tanpa pembayaran' 
                    : 'Pertanyaan premium yang memerlukan pembayaran'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-gray-400">Memuat...</p>
                ) : questions.length === 0 ? (
                  <p className="text-gray-400">Belum ada pertanyaan. Klik tombol "Tambah Pertanyaan" untuk menambahkan.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400 w-12">#</TableHead>
                        <TableHead className="text-gray-400">Pertanyaan</TableHead>
                        <TableHead className="text-gray-400">Kategori</TableHead>
                        <TableHead className="text-gray-400">Tipe</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400 text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={question._id} className="border-gray-700">
                          <TableCell className="text-gray-300">{index + 1}</TableCell>
                          <TableCell className="text-white max-w-md">
                            <p className="truncate">{question.text}</p>
                            <p className="text-sm text-gray-500">{question.options?.length || 0} opsi</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-gray-300 border-gray-600">
                              {question.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{question.type}</TableCell>
                          <TableCell>
                            <Switch
                              checked={question.isActive}
                              onCheckedChange={() => toggleActive(question)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenEdit(question)}
                                className="text-yellow-400 hover:text-yellow-300"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleOpenDelete(question)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {selectedQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-white">Pertanyaan *</Label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Masukkan teks pertanyaan"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Tipe Test</Label>
                  <Select value={formData.testType} onValueChange={(value) => setFormData({...formData, testType: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="free">Gratis</SelectItem>
                      <SelectItem value="paid">Berbayar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Kategori</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="personality">Personality</SelectItem>
                      <SelectItem value="talent">Talent</SelectItem>
                      <SelectItem value="skills">Skills</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white">Tipe Pertanyaan</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="multiple_choice">Pilihan Ganda</SelectItem>
                    <SelectItem value="text">Teks Bebas</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="yes_no">Ya/Tidak</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.type === 'multiple_choice' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-white">Opsi Jawaban</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="text-yellow-400 border-yellow-400">
                      <Plus className="h-4 w-4 mr-1" /> Tambah Opsi
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white flex-1"
                          placeholder={`Opsi ${index + 1}`}
                        />
                        <Input
                          type="number"
                          value={option.score}
                          onChange={(e) => updateOption(index, 'score', parseInt(e.target.value) || 0)}
                          className="bg-gray-700 border-gray-600 text-white w-20"
                          placeholder="Skor"
                        />
                        {formData.options.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeOption(index)}
                            className="text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isRequired}
                  onCheckedChange={(checked) => setFormData({...formData, isRequired: checked})}
                />
                <Label className="text-white">Wajib dijawab</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-600">
                  Batal
                </Button>
                <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                  {selectedQuestion ? 'Update' : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Hapus Pertanyaan</DialogTitle>
            </DialogHeader>
            <p className="text-gray-300">
              Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.
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

export default AdminQuestions;
