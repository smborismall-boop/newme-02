import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Share2, Download, ChevronRight, CheckCircle, TrendingUp, Users, Briefcase, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';

const PersonalityTestResult = () => {
  const { testType, result } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [resultData, setResultData] = useState(location.state?.resultData || null);
  const [showShareCard, setShowShareCard] = useState(false);

  useEffect(() => {
    if (!resultData) {
      // If no result data in state, could fetch from backend or redirect
      navigate('/personality-tests');
    }
  }, [resultData, navigate]);

  if (!resultData) {
    return null;
  }

  const { description, scores } = resultData;

  const getIcon = (personalityType) => {
    const icons = {
      extrovert: '🌟',
      introvert: '🧠',
      ambivert: '⚖️',
      kayu: '🌳',
      air: '💧',
      tanah: '⛰️',
      angin: '🌪️'
    };
    return icons[personalityType] || '✨';
  };

  const getColor = (personalityType) => {
    const colors = {
      extrovert: 'from-blue-500 to-purple-500',
      introvert: 'from-purple-500 to-pink-500',
      ambivert: 'from-green-500 to-blue-500',
      kayu: 'from-green-600 to-emerald-500',
      air: 'from-blue-500 to-cyan-400',
      tanah: 'from-amber-600 to-yellow-600',
      angin: 'from-cyan-400 to-blue-300'
    };
    return colors[personalityType] || 'from-yellow-400 to-orange-500';
  };

  const handleShare = async () => {
    const shareText = `Saya baru saja menyelesaikan ${description.title}! 🎉 \n\nHasil saya: ${description.summary}\n\nCoba tes kepribadian Anda di NEWME CLASS!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: description.title,
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: 'Copied!',
        description: 'Hasil telah disalin ke clipboard'
      });
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    toast({
      title: 'Premium Feature',
      description: 'PDF download available for premium users',
      variant: 'default'
    });
  };

  // Calculate max score for percentage
  const maxScore = Math.max(...Object.values(scores));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero Result Card */}
        <Card className={`bg-gradient-to-r ${getColor(result)} border-0 mb-8 overflow-hidden`}>
          <CardContent className="p-8 text-center text-white">
            <div className="text-6xl mb-4">{getIcon(result)}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {description.title}
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              {description.summary}
            </p>
            
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Button
                onClick={handleShare}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Bagikan Hasil
              </Button>
              <Button
                onClick={handleDownloadPDF}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scores Visualization */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">📊 Skor Detail Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(scores).map(([type, score]) => {
              const percentage = (score / maxScore) * 100;
              return (
                <div key={type}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-300 capitalize">{type}</span>
                    <span className="text-yellow-400 font-semibold">{score} poin</span>
                  </div>
                  <div className="bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Characteristics */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-400" />
              Karakteristik Utama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {description.characteristics?.map((char, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{char}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Strengths & Challenges */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#2a2a2a] border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                💪 Kekuatan Anda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {description.strengths?.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span className="text-gray-300">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-orange-400" />
                🎯 Area Pengembangan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {description.challenges?.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 mt-1">•</span>
                    <span className="text-gray-300">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Career Fit */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-yellow-400" />
              💼 Karir yang Cocok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {description.career_fit?.map((career, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full text-yellow-400 text-sm"
                >
                  {career}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">💡 Tips Pengembangan Diri</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {description.tips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Element Balance (for element test) */}
        {description.element_balance && (
          <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">⚖️ Element Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <p className="text-green-400 font-semibold mb-2">Feeds (Memberi Energi)</p>
                  <p className="text-gray-300">{description.element_balance.feeds}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <p className="text-blue-400 font-semibold mb-2">Fed By (Diberi Energi)</p>
                  <p className="text-gray-300">{description.element_balance.feeds_by}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <p className="text-orange-400 font-semibold mb-2">Weakens (Melemahkan)</p>
                  <p className="text-gray-300">{description.element_balance.weakens}</p>
                </div>
                <div className="bg-[#1a1a1a] p-4 rounded-lg">
                  <p className="text-red-400 font-semibold mb-2">Weakened By (Dilemahkan)</p>
                  <p className="text-gray-300">{description.element_balance.weakens_by}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-yellow-400/10 to-purple-500/10 border border-yellow-400/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Mau Coba Tes Lainnya?
          </h2>
          <p className="text-gray-400 mb-6">
            Kenali kepribadian Anda lebih dalam dengan tes personality lainnya
          </p>
          <Button
            onClick={() => navigate('/personality-tests')}
            className="bg-yellow-400 text-black hover:bg-yellow-500"
          >
            Lihat Semua Tes
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestResult;