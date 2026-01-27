import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Lock, ArrowRight, AlertCircle, Trophy, Star, Sparkles, Brain, Briefcase, TrendingUp, Heart, Download, FileText } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { questionsAPI, authAPI, userPaymentsAPI, aiAnalysisAPI, certificatesAPI } from '../services/api';

const UserTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testType, setTestType] = useState(null); // 'free' or 'paid'
  const [testPrice, setTestPrice] = useState(null);
  const [results, setResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [canDownloadCert, setCanDownloadCert] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    checkAuth();
    loadTestPrice();
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
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadTestPrice = async () => {
    try {
      const response = await userPaymentsAPI.getTestPrice();
      setTestPrice(response.data);
    } catch (error) {
      console.error('Failed to load test price');
    }
  };

  const loadQuestions = async (type) => {
    try {
      setLoading(true);
      const response = await questionsAPI.getAll({ testType: type, isActive: true });
      setQuestions(response.data);
      setTestType(type);
      setTestStarted(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat pertanyaan',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startFreeTest = () => {
    loadQuestions('free');
  };

  const startPaidTest = () => {
    // Check if user has paid (status could be 'paid' or 'approved')
    const hasPaid = user?.paymentStatus === 'paid' || user?.paymentStatus === 'approved';
    if (!hasPaid) {
      toast({
        title: 'Pembayaran Diperlukan',
        description: 'Silakan selesaikan pembayaran untuk mengakses test berbayar',
        variant: 'destructive'
      });
      navigate('/dashboard');
      return;
    }
    loadQuestions('paid');
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

  // Helper to get score from option (handles both 'score' number and 'scores' object)
  const getOptionScore = (option) => {
    if (typeof option.score === 'number') {
      return option.score;
    }
    if (option.scores && typeof option.scores === 'object') {
      // Sum all scores from the scores object
      return Object.values(option.scores).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
    }
    return 0;
  };

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const categoryScores = {};

    questions.forEach(q => {
      const answer = answers[q._id];
      if (answer && q.options) {
        const selectedOption = q.options.find(opt => opt.text === answer);
        if (selectedOption) {
          totalScore += getOptionScore(selectedOption);
        }
        maxScore += Math.max(...q.options.map(opt => getOptionScore(opt)));

        // Track category scores
        if (!categoryScores[q.category]) {
          categoryScores[q.category] = { score: 0, max: 0 };
        }
        if (selectedOption) {
          categoryScores[q.category].score += getOptionScore(selectedOption);
        }
        categoryScores[q.category].max += Math.max(...q.options.map(opt => getOptionScore(opt)));
      }
    });

    return {
      totalScore,
      maxScore,
      percentage: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      categoryScores,
      testType
    };
  };

  const submitTest = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast({
        title: 'Belum Lengkap',
        description: `Masih ada ${questions.length - answeredCount} pertanyaan yang belum dijawab`,
        variant: 'destructive'
      });
      return;
    }

    const calculatedResults = calculateResults();
    setResults(calculatedResults);
    setTestCompleted(true);

    // Prepare data for AI analysis
    setAnalyzingAI(true);
    
    try {
      // Format answers for AI
      const formattedAnswers = questions.map(q => {
        const answer = answers[q._id];
        const selectedOption = q.options?.find(opt => opt.text === answer);
        return {
          questionId: q._id,
          questionText: q.text || q.question,
          category: q.category,
          answer: answer || '',
          score: selectedOption ? getOptionScore(selectedOption) : 0
        };
      });

      const aiResponse = await aiAnalysisAPI.analyze({
        testType: testType,
        answers: formattedAnswers,
        categoryScores: calculatedResults.categoryScores,
        totalScore: calculatedResults.totalScore,
        maxScore: calculatedResults.maxScore,
        percentage: calculatedResults.percentage
      });

      if (aiResponse.data.success) {
        setAiAnalysis(aiResponse.data);
        toast({
          title: 'Analisis AI Selesai!',
          description: 'Hasil analisis kepribadian Anda sudah siap'
        });
        
        // Check certificate eligibility
        try {
          const eligibility = await certificatesAPI.checkEligibility();
          setCanDownloadCert(eligibility.data.canDownloadCertificate);
        } catch (e) {
          console.log('Certificate check failed');
        }
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
      toast({
        title: 'Analisis Selesai',
        description: 'Hasil test Anda telah tersimpan (analisis AI tidak tersedia)'
      });
    } finally {
      setAnalyzingAI(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Test Selection Screen
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Pilih Jenis Test</h1>
            <p className="text-gray-400">Pilih jenis test yang ingin Anda ikuti</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Test Card */}
            <Card className="bg-[#2a2a2a] border-green-400/30 hover:border-green-400/60 transition-all">
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-green-400" />
                </div>
                <span className="inline-block px-3 py-1 bg-green-400 text-black text-sm font-bold rounded-full mb-2">
                  GRATIS
                </span>
                <CardTitle className="text-2xl text-white">Test Dasar</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">5 pertanyaan dasar untuk mengenal potensi Anda</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> 5 Pertanyaan Dasar
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Hasil Instant
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Rekomendasi Singkat
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> Bisa Diulang
                  </li>
                </ul>
                <Button
                  onClick={startFreeTest}
                  className="w-full bg-green-400 text-black hover:bg-green-500"
                >
                  Mulai Test Gratis
                </Button>
              </CardContent>
            </Card>

            {/* Paid Test Card */}
            <Card className="bg-[#2a2a2a] border-yellow-400/30 hover:border-yellow-400/60 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1">
                PREMIUM
              </div>
              <CardHeader className="text-center pb-2">
                <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <p className="text-yellow-400 text-2xl font-bold mb-2">
                  {testPrice ? formatPrice(testPrice.price) : 'Rp 50.000'}
                </p>
                <CardTitle className="text-2xl text-white">Test Lengkap</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-400 mb-4">Analisis mendalam untuk hasil komprehensif</p>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" /> 20+ Pertanyaan Lengkap
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" /> Analisis 4 Kategori
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" /> Laporan Detail PDF
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" /> Sertifikat
                  </li>
                  <li className="flex items-center text-gray-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mr-2" /> Konsultasi (Opsional)
                  </li>
                </ul>
                {(user?.paymentStatus === 'paid' || user?.paymentStatus === 'approved') ? (
                  <Button
                    onClick={startPaidTest}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    Mulai Test Premium
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30"
                  >
                    <Lock className="w-4 h-4 mr-2" /> Bayar untuk Akses
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {!(user?.paymentStatus === 'paid' || user?.paymentStatus === 'approved') && (
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">
                Ingin akses test lengkap? Selesaikan pembayaran di dashboard Anda.
              </p>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-yellow-400 text-yellow-400"
              >
                Ke Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Test Results Screen
  if (testCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Loading AI Analysis */}
          {analyzingAI && (
            <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-white font-semibold">AI sedang menganalisis hasil Anda...</p>
                    <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Result Card */}
          <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-yellow-400" />
              </div>
              <CardTitle className="text-2xl text-white">Test Selesai!</CardTitle>
              {aiAnalysis?.personalityType && (
                <p className="text-yellow-400 text-lg font-semibold mt-2">
                  Tipe Kepribadian: {aiAnalysis.personalityType}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {/* Overall Score */}
              <div className="text-center mb-8">
                <div className="inline-block p-6 bg-[#1a1a1a] rounded-full">
                  <p className="text-5xl font-bold text-yellow-400">{results.percentage}%</p>
                </div>
                <p className="text-gray-400 mt-2">Skor Total: {results.totalScore} / {results.maxScore}</p>
              </div>

              {/* AI Summary */}
              {aiAnalysis?.summary && (
                <div className="bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-lg p-4 mb-6 border border-yellow-400/30">
                  <div className="flex items-start space-x-3">
                    <Brain className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-yellow-400 font-semibold mb-1">Analisis AI</p>
                      <p className="text-gray-300">{aiAnalysis.summary}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5 Element Analysis - New Section */}
              {aiAnalysis?.elementScores && Object.keys(aiAnalysis.elementScores).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold flex items-center mb-4">
                    <Star className="w-5 h-5 mr-2 text-yellow-400" />
                    Simbol Karakter (5 ELEMENT):
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(aiAnalysis.elementScores).map(([element, data]) => {
                      const isDominant = element === aiAnalysis.dominantElement;
                      return (
                        <div 
                          key={element}
                          className={`p-4 rounded-lg text-center ${
                            isDominant 
                              ? 'bg-yellow-400/20 border-2 border-yellow-400' 
                              : 'bg-[#1a1a1a] border border-gray-600'
                          }`}
                        >
                          <p className={`font-bold text-lg ${isDominant ? 'text-yellow-400' : 'text-white'}`}>
                            {element}
                          </p>
                          <p className="text-xs text-gray-400">{data.label}</p>
                          <p className={`text-2xl font-bold mt-2 ${isDominant ? 'text-yellow-400' : 'text-white'}`}>
                            {data.percentage?.toFixed(1)}%
                          </p>
                          {isDominant && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-400 text-black text-xs rounded-full">
                              DOMINAN
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Kepribadian Traits */}
              {aiAnalysis?.kepribadian?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Kepribadian:</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.kepribadian.map((trait, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded-full text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kekuatan Jatidiri */}
              {aiAnalysis?.kekuatanJatidiri && Object.keys(aiAnalysis.kekuatanJatidiri).length > 0 && (
                <div className="mb-6 bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-3">Kekuatan JATIDIRI:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {Object.entries(aiAnalysis.kekuatanJatidiri).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-gray-400 capitalize w-28">{key}:</span>
                        <span className="text-yellow-400 font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Scores */}
              <div className="space-y-4 mb-8">
                <h3 className="text-white font-semibold flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
                  Skor per Kategori:
                </h3>
                {Object.entries(results.categoryScores).map(([category, data]) => {
                  const percentage = data.max > 0 ? Math.round((data.score / data.max) * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 capitalize">{category}</span>
                        <span className="text-white">{percentage}%</span>
                      </div>
                      <div className="h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* AI Detailed Analysis */}
          {aiAnalysis && !analyzingAI && (
            <>
              {/* Strengths */}
              {aiAnalysis.strengths?.length > 0 && (
                <Card className="bg-[#2a2a2a] border-green-400/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-green-400" />
                      Kekuatan Anda
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {aiAnalysis.strengths.map((strength, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Areas to Improve */}
              {aiAnalysis.areasToImprove?.length > 0 && (
                <Card className="bg-[#2a2a2a] border-orange-400/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-orange-400" />
                      Area Pengembangan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {aiAnalysis.areasToImprove.map((area, idx) => (
                        <div key={idx} className="flex items-start space-x-2">
                          <ArrowRight className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{area}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Career Recommendations */}
              {aiAnalysis.careerRecommendations?.length > 0 && (
                <Card className="bg-[#2a2a2a] border-blue-400/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Briefcase className="w-5 h-5 mr-2 text-blue-400" />
                      Rekomendasi Karir
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.careerRecommendations.map((career, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-blue-400/10 border border-blue-400/30 rounded-full text-blue-400 text-sm"
                        >
                          {career}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {aiAnalysis.tips?.length > 0 && (
                <Card className="bg-[#2a2a2a] border-purple-400/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Star className="w-5 h-5 mr-2 text-purple-400" />
                      Tips Pengembangan Diri
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {aiAnalysis.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="bg-purple-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis */}
              {aiAnalysis.analysis && (
                <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                      Analisis Mendalam
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {aiAnalysis.analysis.personality && (
                      <div>
                        <p className="text-yellow-400 font-semibold mb-2">Kepribadian</p>
                        <p className="text-gray-300">{aiAnalysis.analysis.personality}</p>
                      </div>
                    )}
                    {aiAnalysis.analysis.talent && (
                      <div>
                        <p className="text-yellow-400 font-semibold mb-2">Bakat & Potensi</p>
                        <p className="text-gray-300">{aiAnalysis.analysis.talent}</p>
                      </div>
                    )}
                    {aiAnalysis.analysis.motivation && (
                      <div className="bg-gradient-to-r from-yellow-400/10 to-purple-400/10 rounded-lg p-4 border border-yellow-400/30">
                        <p className="text-yellow-400 font-semibold mb-2">Pesan Motivasi</p>
                        <p className="text-gray-300 italic">{aiAnalysis.analysis.motivation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Fallback if no AI analysis */}
          {!aiAnalysis && !analyzingAI && (
            <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
              <CardContent className="p-6">
                <div className="bg-[#1a1a1a] rounded-lg p-4">
                  <h3 className="text-yellow-400 font-semibold mb-2">Rekomendasi</h3>
                  <p className="text-gray-300 text-sm">
                    {results.percentage >= 80
                      ? 'Luar biasa! Anda memiliki potensi yang sangat baik. Terus kembangkan bakat Anda!'
                      : results.percentage >= 60
                      ? 'Bagus! Anda memiliki dasar yang kuat. Fokus pada area yang perlu ditingkatkan.'
                      : results.percentage >= 40
                      ? 'Anda memiliki potensi yang bisa dikembangkan. Pertimbangkan untuk mengikuti program pengembangan kami.'
                      : 'Jangan berkecil hati! Setiap orang memiliki keunikan. Kami siap membantu Anda menemukan potensi terbaik.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {testType === 'free' && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-400 text-sm">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Ingin hasil lebih detail? Upgrade ke Test Premium untuk analisis mendalam, sertifikat, dan konsultasi!
              </p>
            </div>
          )}

          {/* Download Certificate Button - Only for Paid Users */}
          {(testType === 'paid' || canDownloadCert) && aiAnalysis && (
            <Card className="bg-gradient-to-r from-yellow-400/20 to-green-400/20 border-yellow-400/30 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Sertifikat AI Anda Siap!</h3>
                      <p className="text-gray-400 text-sm">Download sertifikat dengan hasil analisis lengkap</p>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      setDownloadingCert(true);
                      try {
                        const response = await certificatesAPI.downloadAICertificate();
                        const blob = new Blob([response.data], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `sertifikat_ai_${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast({
                          title: 'Download Berhasil!',
                          description: 'Sertifikat Anda telah didownload'
                        });
                      } catch (error) {
                        toast({
                          title: 'Gagal Download',
                          description: error.response?.data?.detail || 'Terjadi kesalahan saat download sertifikat',
                          variant: 'destructive'
                        });
                      } finally {
                        setDownloadingCert(false);
                      }
                    }}
                    disabled={downloadingCert}
                    className="bg-yellow-400 text-black hover:bg-yellow-500"
                  >
                    {downloadingCert ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        Downloading...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download Sertifikat
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setTestStarted(false);
                setTestCompleted(false);
                setAnswers({});
                setCurrentQuestion(0);
                setResults(null);
                setAiAnalysis(null);
              }}
              variant="outline"
              className="flex-1 border-yellow-400 text-yellow-400"
            >
              Test Lagi
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Ke Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Test Questions Screen
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-10">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Pertanyaan {currentQuestion + 1} dari {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
            <CardHeader>
              <span className={`inline-block px-2 py-1 rounded text-xs mb-2 ${testType === 'free' ? 'bg-green-400/20 text-green-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                {currentQ.category}
              </span>
              <CardTitle className="text-xl text-white">{currentQ.text || currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentQ.type === 'multiple_choice' && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(currentQ._id, option.text)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        answers[currentQ._id] === option.text
                          ? 'bg-yellow-400/20 border-yellow-400 text-white'
                          : 'bg-[#1a1a1a] border-yellow-400/20 text-gray-300 hover:border-yellow-400/50'
                      }`}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'yes_no' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleAnswer(currentQ._id, 'Ya')}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      answers[currentQ._id] === 'Ya'
                        ? 'bg-green-400/20 border-green-400 text-white'
                        : 'bg-[#1a1a1a] border-yellow-400/20 text-gray-300 hover:border-green-400/50'
                    }`}
                  >
                    Ya
                  </button>
                  <button
                    onClick={() => handleAnswer(currentQ._id, 'Tidak')}
                    className={`flex-1 p-4 rounded-lg border transition-all ${
                      answers[currentQ._id] === 'Tidak'
                        ? 'bg-red-400/20 border-red-400 text-white'
                        : 'bg-[#1a1a1a] border-yellow-400/20 text-gray-300 hover:border-red-400/50'
                    }`}
                  >
                    Tidak
                  </button>
                </div>
              )}

              {currentQ.type === 'rating' && (
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => handleAnswer(currentQ._id, num.toString())}
                      className={`w-12 h-12 rounded-lg border text-lg font-bold transition-all ${
                        answers[currentQ._id] === num.toString()
                          ? 'bg-yellow-400 border-yellow-400 text-black'
                          : 'bg-[#1a1a1a] border-yellow-400/20 text-gray-300 hover:border-yellow-400/50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              )}

              {currentQ.type === 'text' && (
                <textarea
                  value={answers[currentQ._id] || ''}
                  onChange={(e) => handleAnswer(currentQ._id, e.target.value)}
                  placeholder="Ketik jawaban Anda..."
                  className="w-full bg-[#1a1a1a] border border-yellow-400/20 rounded-lg p-4 text-white min-h-[120px]"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-yellow-400/50 text-yellow-400 disabled:opacity-50"
          >
            Sebelumnya
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={submitTest}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Selesai & Lihat Hasil
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Selanjutnya <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="mt-8">
          <p className="text-gray-400 text-sm mb-3">Navigasi Pertanyaan:</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 rounded text-sm font-medium transition-all ${
                  idx === currentQuestion
                    ? 'bg-yellow-400 text-black'
                    : answers[q._id]
                    ? 'bg-green-400/20 text-green-400 border border-green-400/50'
                    : 'bg-[#2a2a2a] text-gray-400 border border-yellow-400/20'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTest;
