import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  CheckCircle, Clock, Lock, ArrowRight, AlertCircle, Trophy, Star, 
  Sparkles, Brain, Wallet, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { authAPI } from '../services/api';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [freeQuestions, setFreeQuestions] = useState([]);
  const [paidQuestions, setPaidQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testType, setTestType] = useState(null);
  const [results, setResults] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [hasPaidAccess, setHasPaidAccess] = useState(false);
  const [testPrice] = useState(50000); // Harga test berbayar

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await authAPI.getProfile();
      setUser(response.data);
      await loadAllData(response.data._id);
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (userId) => {
    try {
      // Load questions
      const questionsRes = await axios.get(`${BACKEND_URL}/api/questions`);
      const allQuestions = questionsRes.data || [];
      
      // Separate free and paid questions
      const free = allQuestions.filter(q => q.isFree === true);
      const paid = allQuestions.filter(q => q.isFree === false);
      
      setFreeQuestions(free);
      setPaidQuestions(paid);
      
      // Load wallet balance
      try {
        const walletRes = await axios.get(`${BACKEND_URL}/api/wallet/balance/${userId}`);
        setWalletBalance(walletRes.data.balance || 0);
      } catch (e) {
        setWalletBalance(0);
      }
      
      // Check paid access
      try {
        const paymentRes = await axios.get(`${BACKEND_URL}/api/user-payments/status/${userId}`);
        setHasPaidAccess(paymentRes.data.status === 'paid' || paymentRes.data.status === 'approved');
      } catch (e) {
        setHasPaidAccess(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      // Try to seed questions if empty
      try {
        await axios.post(`${BACKEND_URL}/api/questions/seed-questions`);
        // Retry loading
        const questionsRes = await axios.get(`${BACKEND_URL}/api/questions`);
        const allQuestions = questionsRes.data || [];
        setFreeQuestions(allQuestions.filter(q => q.isFree === true));
        setPaidQuestions(allQuestions.filter(q => q.isFree === false));
      } catch (seedError) {
        console.error('Failed to seed questions:', seedError);
      }
    }
  };

  const seedQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/questions/seed-questions`);
      toast({
        title: 'Berhasil',
        description: response.data.message
      });
      await loadAllData(user.id || user._id);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal seed questions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startFreeTest = () => {
    if (freeQuestions.length === 0) {
      toast({
        title: 'Tidak Ada Pertanyaan',
        description: 'Pertanyaan gratis belum tersedia. Silakan hubungi admin.',
        variant: 'destructive'
      });
      return;
    }
    setQuestions(freeQuestions);
    setTestType('free');
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const startPaidTest = async () => {
    if (paidQuestions.length === 0) {
      toast({
        title: 'Tidak Ada Pertanyaan',
        description: 'Pertanyaan berbayar belum tersedia.',
        variant: 'destructive'
      });
      return;
    }

    if (!hasPaidAccess) {
      // Check wallet balance
      if (walletBalance < testPrice) {
        toast({
          title: 'Saldo Tidak Cukup',
          description: `Saldo wallet Anda Rp ${walletBalance.toLocaleString('id-ID')}. Diperlukan Rp ${testPrice.toLocaleString('id-ID')}. Silakan top-up terlebih dahulu.`,
          variant: 'destructive'
        });
        return;
      }

      // Pay using wallet
      try {
        const payResponse = await axios.post(`${BACKEND_URL}/api/wallet/pay-test`, {
          userId: user.id || user._id,
          amount: testPrice,
          description: 'Pembayaran Test Berbayar NEWMECLASS',
          paymentType: 'test_payment'
        });
        
        setWalletBalance(payResponse.data.newBalance);
        setHasPaidAccess(true);
        toast({
          title: 'Pembayaran Berhasil',
          description: 'Anda sekarang dapat mengakses test berbayar'
        });
      } catch (error) {
        toast({
          title: 'Pembayaran Gagal',
          description: error.response?.data?.detail || 'Gagal memproses pembayaran',
          variant: 'destructive'
        });
        return;
      }
    }

    setQuestions(paidQuestions);
    setTestType('paid');
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitTest = async () => {
    // Calculate results
    let totalScore = 0;
    let categories = {};
    
    questions.forEach(q => {
      const answer = answers[q._id];
      if (answer) {
        const selectedOption = q.options?.find(opt => opt.value === answer);
        if (selectedOption) {
          totalScore += selectedOption.score || 0;
          const cat = q.category || 'general';
          categories[cat] = (categories[cat] || 0) + (selectedOption.score || 0);
        }
      }
    });

    const result = {
      totalScore,
      categories,
      answeredCount: Object.keys(answers).length,
      totalQuestions: questions.length,
      testType,
      completedAt: new Date().toISOString()
    };

    setResults(result);
    setTestCompleted(true);

    // Save results to backend
    try {
      const saveResponse = await axios.post(`${BACKEND_URL}/api/test-results`, {
        userId: user._id,
        testType,
        results: result,
        answers
      });
      
      // Redirect to result page with the result ID
      if (saveResponse.data.resultId) {
        navigate(`/test-result/${saveResponse.data.resultId}`);
        return;
      }
    } catch (error) {
      console.error('Failed to save results:', error);
    }
  };

  const resetTest = () => {
    setTestStarted(false);
    setTestCompleted(false);
    setQuestions([]);
    setAnswers({});
    setCurrentQuestion(0);
    setResults(null);
    setTestType(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="text-yellow-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  // Test Selection Screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-8" data-testid="user-test-page">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Test Kepribadian</h1>
              <p className="text-gray-400">Pilih jenis test yang ingin Anda ikuti</p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="border-yellow-400 text-yellow-400">
                <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
              </Button>
            </Link>
          </div>

          {/* Wallet Balance Card */}
          <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 border-none mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-8 h-8 text-[#1a1a1a]" />
                <div>
                  <p className="text-yellow-900 text-sm">Saldo Wallet</p>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{formatCurrency(walletBalance)}</p>
                </div>
              </div>
              <Link to="/wallet">
                <Button className="bg-[#1a1a1a] text-yellow-400 hover:bg-[#2a2a2a]">
                  Top Up
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Test Options */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Test */}
            <Card className="bg-[#2a2a2a] border-green-500/30 hover:border-green-500 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white">5 Test Dasar Gratis</CardTitle>
                    <CardDescription className="text-green-400">GRATIS</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> {freeQuestions.length} pertanyaan dasar
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Hasil instant
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Rekomendasi dasar
                  </li>
                </ul>
                <Button 
                  onClick={startFreeTest}
                  disabled={freeQuestions.length === 0}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {freeQuestions.length > 0 ? 'Mulai Test Gratis' : 'Pertanyaan Tidak Tersedia'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Paid Test */}
            <Card className="bg-[#2a2a2a] border-yellow-500/30 hover:border-yellow-500 transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Test Berbayar Premium</CardTitle>
                    <CardDescription className="text-yellow-400">
                      {hasPaidAccess ? 'SUDAH DIBAYAR' : formatCurrency(testPrice)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" /> {paidQuestions.length} pertanyaan lengkap
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" /> Analisis mendalam
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" /> Sertifikat digital
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-500 mr-2" /> Rekomendasi karir
                  </li>
                </ul>
                <Button 
                  onClick={startPaidTest}
                  disabled={paidQuestions.length === 0}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  {hasPaidAccess ? (
                    <>Mulai Test Berbayar <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : walletBalance >= testPrice ? (
                    <>Bayar & Mulai Test <ArrowRight className="w-4 h-4 ml-2" /></>
                  ) : (
                    <>Saldo Tidak Cukup <Lock className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
                {!hasPaidAccess && walletBalance < testPrice && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    Perlu top-up {formatCurrency(testPrice - walletBalance)} lagi
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin: Seed Questions */}
          {(freeQuestions.length === 0 && paidQuestions.length === 0) && (
            <Card className="mt-6 bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-white font-semibold">Pertanyaan Belum Ada</p>
                    <p className="text-gray-400 text-sm">Klik tombol untuk membuat pertanyaan default</p>
                  </div>
                </div>
                <Button onClick={seedQuestions} className="bg-red-600 hover:bg-red-700">
                  <RefreshCw className="w-4 h-4 mr-2" /> Seed Questions
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Test Completed Screen
  if (testCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="bg-[#2a2a2a] border-yellow-400/30">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-[#1a1a1a]" />
              </div>
              <CardTitle className="text-white text-2xl">Test Selesai!</CardTitle>
              <CardDescription className="text-gray-400">
                Terima kasih telah menyelesaikan test {testType === 'free' ? 'gratis' : 'berbayar'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Results Summary */}
              <div className="bg-[#1a1a1a] rounded-lg p-6">
                <h3 className="text-yellow-400 font-semibold mb-4">Hasil Test Anda</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <p className="text-3xl font-bold text-white">{results.answeredCount}</p>
                    <p className="text-gray-400 text-sm">Dijawab</p>
                  </div>
                  <div className="text-center p-4 bg-[#2a2a2a] rounded-lg">
                    <p className="text-3xl font-bold text-yellow-400">{results.totalScore}</p>
                    <p className="text-gray-400 text-sm">Total Skor</p>
                  </div>
                </div>
                
                {/* Category Scores */}
                {Object.keys(results.categories).length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm mb-2">Skor per Kategori:</p>
                    <div className="space-y-2">
                      {Object.entries(results.categories).map(([cat, score]) => (
                        <div key={cat} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{cat}</span>
                          <span className="text-yellow-400 font-semibold">{score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-400/10 rounded-lg p-6 border border-yellow-400/30">
                <h3 className="text-yellow-400 font-semibold mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" /> Rekomendasi
                </h3>
                <p className="text-gray-300 text-sm">
                  Berdasarkan hasil test Anda, kami merekomendasikan untuk terus mengembangkan 
                  potensi diri melalui program-program NEWMECLASS. Untuk analisis lebih mendalam, 
                  ikuti test berbayar kami.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={resetTest}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Test Lagi
                </Button>
                <Link to="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full border-yellow-400 text-yellow-400">
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Test In Progress Screen
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const currentAnswer = currentQ ? answers[currentQ._id] : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">
              Pertanyaan {currentQuestion + 1} dari {questions.length}
            </span>
            <span className="text-yellow-400 text-sm font-semibold">
              {testType === 'free' ? 'Test Gratis' : 'Test Berbayar'}
            </span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-[#2a2a2a] border-yellow-400/30">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <span className="text-yellow-400 text-sm capitalize">{currentQ?.category || 'Umum'}</span>
            </div>
            <CardTitle className="text-white text-xl leading-relaxed">
              {currentQ?.text || currentQ?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ?.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(currentQ._id, option.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  currentAnswer === option.value
                    ? 'border-yellow-400 bg-yellow-400/10 text-white'
                    : 'border-gray-600 bg-[#1a1a1a] text-gray-300 hover:border-yellow-400/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    currentAnswer === option.value
                      ? 'border-yellow-400 bg-yellow-400'
                      : 'border-gray-500'
                  }`}>
                    {currentAnswer === option.value && (
                      <CheckCircle className="w-4 h-4 text-[#1a1a1a]" />
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={prevQuestion}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1 border-gray-500 text-gray-300 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
              </Button>
              
              {isLastQuestion ? (
                <Button
                  onClick={submitTest}
                  disabled={Object.keys(answers).length < questions.length}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Selesai <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={nextQuestion}
                  disabled={!currentAnswer}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>

            {/* Answer counter */}
            <p className="text-center text-gray-400 text-sm pt-2">
              {Object.keys(answers).length} dari {questions.length} pertanyaan dijawab
            </p>
          </CardContent>
        </Card>

        {/* Exit button */}
        <div className="text-center mt-4">
          <Button
            onClick={resetTest}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Keluar dari Test
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTest;
