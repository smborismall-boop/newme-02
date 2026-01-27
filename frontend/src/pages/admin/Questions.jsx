import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, HelpCircle, GripVertical, X, Star, Lock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { questionsAPI } from '../../services/api';

const Questions = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeTestType, setActiveTestType] = useState('all');
  const [formData, setFormData] = useState({
    text: '',
    type: 'multiple_choice',
    category: 'personality',
    testType: 'free',
    options: [{ text: '', value: '', score: 0 }],
    isRequired: true,
    order: 0
  });

  const categories = [
    'personality', 
    'talent', 
    'skills', 
    'interest',
    'Personality Test - Social Energy',
    'Personality Test - Element Type'
  ];
  const questionTypes = [
    { value: 'multiple_choice', label: 'Pilihan Ganda' },
    { value: 'text', label: 'Jawaban Teks' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'yes_no', label: 'Ya/Tidak' }
  ];
  const testTypes = [
    { value: 'free', label: 'Test Gratis', color: 'green' },
    { value: 'paid', label: 'Test Berbayar', color: 'yellow' }
  ];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const response = await questionsAPI.getAll();
      console.log('Questions loaded:', response.data?.length);
      setQuestions(response.data || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast({ title: 'Error', description: 'Gagal memuat pertanyaan', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...formData,
        order: editingQuestion ? formData.order : questions.length
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion._id, questionData);
        toast({ title: 'Sukses', description: 'Pertanyaan berhasil diupdate' });
      } else {
        await questionsAPI.create(questionData);
        toast({ title: 'Sukses', description: 'Pertanyaan berhasil ditambahkan' });
      }

      setShowModal(false);
      resetForm();
      loadQuestions();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyimpan pertanyaan', variant: 'destructive' });
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      text: question.text,
      type: question.type,
      category: question.category,
      testType: question.testType || 'free',
      options: question.options?.length ? question.options : [{ text: '', value: '', score: 0 }],
      isRequired: question.isRequired,
      order: question.order
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus pertanyaan ini?')) return;
    try {
      await questionsAPI.delete(id);
      toast({ title: 'Sukses', description: 'Pertanyaan berhasil dihapus' });
      loadQuestions();
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menghapus pertanyaan', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      type: 'multiple_choice',
      category: 'personality',
      testType: 'free',
      options: [{ text: '', value: '', score: 0 }],
      isRequired: true,
      order: 0
    });
    setEditingQuestion(null);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', value: '', score: 0 }]
    });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = activeTestType === 'all' 
    ? questions 
    : questions.filter(q => q.testType === activeTestType);

  const freeCount = questions.filter(q => q.testType === 'free').length;
  const paidCount = questions.filter(q => q.testType === 'paid').length;

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  // Get actual categories from questions data
  const actualCategories = Object.keys(groupedQuestions);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Questions</h1>
          <p className="text-gray-400">Kelola pertanyaan untuk NEWME Test</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-yellow-400 text-black hover:bg-yellow-500">
          <Plus className="w-4 h-4 mr-2" /> Tambah Pertanyaan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Total Pertanyaan</p>
            <p className="text-2xl font-bold text-white">{questions.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-green-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-green-400" />
              <p className="text-gray-400 text-sm">Test Gratis</p>
            </div>
            <p className="text-2xl font-bold text-green-400">{freeCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              <p className="text-gray-400 text-sm">Test Berbayar</p>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{paidCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#2a2a2a] border-yellow-400/20">
          <CardContent className="p-4">
            <p className="text-gray-400 text-sm">Kategori</p>
            <p className="text-2xl font-bold text-white">{categories.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTestType === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTestType('all')}
          className={activeTestType === 'all' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          Semua ({questions.length})
        </Button>
        <Button
          variant={activeTestType === 'free' ? 'default' : 'outline'}
          onClick={() => setActiveTestType('free')}
          className={activeTestType === 'free' ? 'bg-green-400 text-black' : 'border-green-400/50 text-green-400'}
        >
          <Star className="w-4 h-4 mr-1" /> Gratis ({freeCount})
        </Button>
        <Button
          variant={activeTestType === 'paid' ? 'default' : 'outline'}
          onClick={() => setActiveTestType('paid')}
          className={activeTestType === 'paid' ? 'bg-yellow-400 text-black' : 'border-yellow-400/50 text-yellow-400'}
        >
          <Lock className="w-4 h-4 mr-1" /> Berbayar ({paidCount})
        </Button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400">Tidak ada pertanyaan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {actualCategories.map(category => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-yellow-400 mb-3 capitalize">
                {category.replace(/_/g, ' ')}
              </h2>
              <div className="space-y-2">
                {groupedQuestions[category]?.sort((a, b) => a.order - b.order).map((question, idx) => (
                  <Card key={question._id} className="bg-[#2a2a2a] border-yellow-400/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-gray-500 mt-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{idx + 1}. {question.question || question.text}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-xs px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded">
                                  {questionTypes.find(t => t.value === question.type)?.label || question.type}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${question.testType === 'free' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                                  {question.testType === 'free' ? 'Gratis' : 'Berbayar'}
                                </span>
                                {question.isRequired && (
                                  <span className="text-xs px-2 py-1 bg-red-400/20 text-red-400 rounded">Wajib</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-yellow-400" onClick={() => handleEdit(question)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-400" onClick={() => handleDelete(question._id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {question.type === 'multiple_choice' && question.options?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.options.map((opt, i) => (
                                <p key={i} className="text-gray-400 text-sm pl-4">
                                  • {opt.text} 
                                  {opt.scores && (
                                    <span className="text-yellow-400/60 ml-2">
                                      (scores: {Object.entries(opt.scores).map(([k, v]) => `${k}:${v}`).join(', ')})
                                    </span>
                                  )}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2a2a2a] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-yellow-400/20 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Pertanyaan</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Tipe</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                  >
                    {questionTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c} className="capitalize">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Jenis Test</label>
                  <select
                    value={formData.testType}
                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-md p-2 text-white"
                  >
                    <option value="free">Test Gratis</option>
                    <option value="paid">Test Berbayar</option>
                  </select>
                </div>
              </div>

              {formData.type === 'multiple_choice' && (
                <div>
                  <label className="text-gray-400 text-sm">Opsi Jawaban</label>
                  <div className="space-y-2 mt-2">
                    {formData.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          placeholder="Teks opsi"
                          value={opt.text}
                          onChange={(e) => updateOption(idx, 'text', e.target.value)}
                          className="flex-1 bg-[#1a1a1a] border-yellow-400/20 text-white"
                        />
                        <Input
                          type="number"
                          placeholder="Skor"
                          value={opt.score}
                          onChange={(e) => updateOption(idx, 'score', parseInt(e.target.value) || 0)}
                          className="w-20 bg-[#1a1a1a] border-yellow-400/20 text-white"
                        />
                        {formData.options.length > 1 && (
                          <Button type="button" size="sm" variant="ghost" className="text-red-400" onClick={() => removeOption(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="border-yellow-400/50 text-yellow-400">
                      <Plus className="w-3 h-3 mr-1" /> Tambah Opsi
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded"
                />
                <span className="text-gray-400 text-sm">Pertanyaan wajib dijawab</span>
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

export default Questions;
