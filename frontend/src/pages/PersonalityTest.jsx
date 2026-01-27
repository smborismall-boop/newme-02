import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PersonalityTest = () => {
  const { testType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPremiumLock, setShowPremiumLock] = useState(false);

  // Check if user has premium access (from localStorage or backend)
  const hasPremiumAccess = () => {
    // TODO: Check if user has paid for test
    const userToken = localStorage.getItem('user_token');
    // For now, return false to show lock screen
    return false;
  };

  useEffect(() => {
    loadQuestions();
  }, [testType]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/personality-tests/questions/${testType}?include_premium=${hasPremiumAccess()}`
      );
      
      setQuestions(response.data.questions);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat soal tes',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    const questionId = questions[currentQuestion].id;
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const goToNext = () => {
    const nextQuestion = currentQuestion + 1;
    
    // Check if next question is premium and user doesn't have access
    if (questions[nextQuestion]?.isPremium && !hasPremiumAccess()) {
      setShowPremiumLock(true);
      return;
    }
    
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all free questions are answered
    const freeQuestions = questions.filter(q => !q.isPremium);
    const unansweredFree = freeQuestions.filter(q => !(q.id in answers));
    
    if (unansweredFree.length > 0) {
      toast({
        title: 'Pertanyaan Belum Dijawab',
        description: 'Mohon jawab semua pertanyaan yang tersedia',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      const response = await axios.post(`${API_URL}/api/personality-tests/submit`, {
        testType: testType,
        answers: formattedAnswers
      });

      // Navigate to results page with result data
      navigate(`/test/result/${testType}/${response.data.result}`, {
        state: { resultData: response.data }
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Gagal submit tes',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTestTitle = () => {
    if (testType === 'introvert_extrovert') {
      return 'Tes Introvert/Extrovert/Ambivert';
    }
    return 'Tes Element Personality';
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const currentQ = questions[currentQuestion];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Premium Lock Screen
  if (showPremiumLock) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="bg-[#2a2a2a] border-yellow-400/30">
            <CardContent className="p-8 text-center">
              <div className="bg-yellow-400/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-yellow-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                🔒 Premium Questions Locked
              </h2>
              
              <p className="text-gray-400 mb-6">
                Anda telah menyelesaikan <strong className="text-yellow-400">{answeredCount} soal gratis</strong>. 
                Untuk hasil yang lebih akurat dan detailed report, unlock {questions.length - answeredCount} soal premium.
              </p>

              <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6 space-y-3">
                <div className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-gray-300">Analisis kepribadian lebih mendalam</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-gray-300">Detailed personality report (PDF)</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-gray-300">Personalized career recommendations</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <CheckCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <span className="text-gray-300">Compatibility insights</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/pricing')}
                  className="bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  🔓 Unlock Premium Questions
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  {submitting ? 'Submitting...' : 'Lanjut dengan Hasil Gratis'}
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Atau <button onClick={() => setShowPremiumLock(false)} className="text-yellow-400 underline">kembali ke tes</button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/personality-tests')}
            className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali
          </button>
          
          <h1 className="text-2xl font-bold text-white mb-2">{getTestTitle()}</h1>
          <p className="text-gray-400">
            Pertanyaan {currentQuestion + 1} dari {questions.length} • {answeredCount} dijawab
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-[#2a2a2a] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQ && (
          <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-6">
            <CardContent className="p-8">
              {currentQ.isPremium && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-1 inline-block mb-4">
                  <span className="text-xs font-semibold text-yellow-400">🔒 PREMIUM</span>
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-white mb-6">
                {currentQ.question}
              </h2>

              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : 'border-gray-700 hover:border-gray-600 bg-[#1a1a1a]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-yellow-400 bg-yellow-400' : 'border-gray-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-black rounded-full" />}
                        </div>
                        <span className={isSelected ? 'text-white font-medium' : 'text-gray-300'}>
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={goToPrevious}
            disabled={currentQuestion === 0}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Sebelumnya
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {submitting ? 'Submitting...' : 'Lihat Hasil'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={goToNext}
              disabled={!(currentQ.id in answers)}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>💡 Tip: Jawab dengan jujur untuk hasil yang paling akurat</p>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTest;
