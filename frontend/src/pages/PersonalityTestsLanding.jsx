import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Users, Sparkles, TrendingUp, ChevronRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const PersonalityTestsLanding = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Optional: Load test statistics
    // fetchStats();
  }, []);

  const tests = [
    {
      id: 'introvert-extrovert',
      title: 'Introvert/Extrovert/Ambivert Test',
      description: 'Temukan tipe energi sosial Anda dan cara Anda berinteraksi dengan dunia',
      icon: Users,
      color: 'bg-blue-500',
      benefits: [
        'Memahami kebutuhan energi Anda',
        'Meningkatkan komunikasi interpersonal',
        'Career path yang sesuai',
        'Tips pengembangan diri'
      ],
      freeQuestions: 5,
      totalQuestions: 10,
      duration: '5-8 menit'
    },
    {
      id: 'element-personality',
      title: 'Element Personality Test',
      description: 'Kenali element kepribadian Anda: Kayu, Air, Tanah, atau Angin',
      icon: Sparkles,
      color: 'bg-purple-500',
      benefits: [
        'Memahami gaya kepemimpinan Anda',
        'Mengenali kekuatan & tantangan',
        'Compatibility dengan orang lain',
        'Growth strategy personal'
      ],
      freeQuestions: 5,
      totalQuestions: 10,
      duration: '5-8 menit'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 px-4 py-2 rounded-full mb-6">
            <Brain className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold">Personality Tests</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kenali Diri Anda Lebih Dalam
          </h1>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Ambil tes kepribadian kami yang telah dirancang secara ilmiah untuk membantu Anda 
            memahami kekuatan, tantangan, dan potensi terbaik Anda.
          </p>

          {stats && (
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.totalTests}+</div>
                <div className="text-sm text-gray-400">Tes Telah Diambil</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">98%</div>
                <div className="text-sm text-gray-400">Satisfaction Rate</div>
              </div>
            </div>
          )}
        </div>

        {/* Test Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {tests.map((test) => {
            const Icon = test.icon;
            return (
              <Card 
                key={test.id}
                className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden group"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`${test.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-white mb-2">{test.title}</CardTitle>
                      <p className="text-gray-400 text-sm">{test.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Benefits */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-300">Yang Akan Anda Dapatkan:</p>
                    {test.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-400">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* Test Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>⏱️ {test.duration}</span>
                      <span>📝 {test.totalQuestions} soal</span>
                    </div>
                  </div>

                  {/* Freemium Badge */}
                  <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-yellow-400">
                          ✅ {test.freeQuestions} Soal Gratis
                        </p>
                        <p className="text-xs text-gray-400">
                          Unlock {test.totalQuestions - test.freeQuestions} soal premium untuk hasil lebih akurat
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => navigate(`/test/${test.id}`)}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-500 group-hover:scale-105 transition-transform"
                  >
                    Mulai Tes Sekarang
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <div className="bg-blue-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Berbasis Riset</h3>
              <p className="text-sm text-gray-400">
                Tes kami dirancang berdasarkan teori psikologi dan personality science
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Insight Mendalam</h3>
              <p className="text-sm text-gray-400">
                Dapatkan analisis lengkap tentang kepribadian, kekuatan, dan area pengembangan
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#2a2a2a] border-yellow-400/20">
            <CardContent className="p-6 text-center">
              <div className="bg-yellow-400/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Actionable Tips</h3>
              <p className="text-sm text-gray-400">
                Rekomendasi praktis untuk pengembangan karir dan personal growth
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-yellow-400/10 to-purple-500/10 border border-yellow-400/30 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Siap Untuk Memahami Diri Anda?
          </h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Ambil tes pertama Anda sekarang dan temukan insight berharga tentang kepribadian Anda. 
            Mulai dengan versi gratis atau unlock full report untuk analisis lengkap.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/test/introvert-extrovert')}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              Mulai Tes I/E/A
            </Button>
            <Button
              onClick={() => navigate('/test/element-personality')}
              variant="outline"
              className="border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/10"
            >
              Mulai Tes Element
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestsLanding;
