import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Lock, CheckCircle, AlertTriangle, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TestSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [testAccess, setTestAccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = localStorage.getItem('user_token');

  const testCategories = [
    {
      id: 'personality',
      title: 'Personality Test',
      description: 'Kenali kepribadian dan karakteristik unik Anda',
      icon: Brain,
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'talent',
      title: 'Talent Discovery',
      description: 'Temukan bakat alami dan potensi tersembunyi Anda',
      icon: Brain,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'skills',
      title: 'Skills Assessment',
      description: 'Identifikasi keterampilan yang sudah Anda kuasai',
      icon: Brain,
      color: 'from-green-500 to-blue-500'
    },
    {
      id: 'interest',
      title: 'Interest & Passion',
      description: 'Kenali minat dan passion sejati Anda',
      icon: Brain,
      color: 'from-orange-500 to-red-500'
    }
  ];

  useEffect(() => {
    if (isLoggedIn) {
      checkTestAccess();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const checkTestAccess = async () => {
    try {
      const token = localStorage.getItem('user_token');
      const response = await axios.get(`${API_URL}/api/test-access/check`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestAccess(response.data);
    } catch (error) {
      console.error('Failed to check test access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (category, isPaid = false) => {
    if (!isLoggedIn) {
      toast({
        title: 'Login Required',
        description: 'Silakan login terlebih dahulu untuk mengambil test',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    // Check if trying to take free test but already taken
    if (!isPaid && testAccess && testAccess.hasTakenFreeTest) {
      toast({
        title: 'Test Gratis Sudah Digunakan',
        description: 'Anda sudah mengambil test gratis. Upgrade ke premium untuk test unlimited!',
        variant: 'destructive'
      });
      return;
    }

    // Record free test if this is first time
    if (!isPaid && testAccess && testAccess.canTakeFreeTest) {
      try {
        const token = localStorage.getItem('user_token');
        await axios.post(
          `${API_URL}/api/test-access/record-free-test?category=${category}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to record free test:', error);
      }
    }

    // Navigate to test page
    navigate(`/test-start/${category}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Pilih Test Anda
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Pilih kategori test yang ingin Anda ambil untuk mengenal diri lebih dalam
          </p>
        </div>

        {/* Access Status Alert */}
        {isLoggedIn && testAccess && (
          <div className={`mb-8 p-6 rounded-xl border ${
            testAccess.canTakeFreeTest 
              ? 'bg-green-500/10 border-green-500/30' 
              : testAccess.canTakePaidTest
              ? 'bg-purple-500/10 border-purple-500/30'
              : 'bg-orange-500/10 border-orange-500/30'
          }`}>
            <div className="flex items-start gap-4">
              {testAccess.canTakeFreeTest ? (
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              ) : testAccess.canTakePaidTest ? (
                <Crown className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className={`font-semibold text-lg mb-1 ${
                  testAccess.canTakeFreeTest 
                    ? 'text-green-400' 
                    : testAccess.canTakePaidTest 
                    ? 'text-purple-400'
                    : 'text-orange-400'
                }`}>
                  {testAccess.canTakeFreeTest 
                    ? '✨ Test Gratis Tersedia!' 
                    : testAccess.canTakePaidTest
                    ? '👑 Akses Premium'
                    : '⚠️ Test Gratis Sudah Digunakan'}
                </h3>
                <p className="text-gray-300">{testAccess.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Test Categories */}
        <div className="grid md:grid-cols-2 gap-6">
          {testCategories.map((category) => {
            const Icon = category.icon;
            const canTakeFree = isLoggedIn && testAccess?.canTakeFreeTest;
            const canTakePaid = isLoggedIn && testAccess?.canTakePaidTest;
            const isLocked = isLoggedIn && testAccess?.hasTakenFreeTest && !canTakePaid;

            return (
              <Card 
                key={category.id}
                className={`bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all ${
                  isLocked ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`bg-gradient-to-r ${category.color} p-4 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    {isLocked && (
                      <div className="bg-orange-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-400 font-semibold">Locked</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-white text-xl mt-4">{category.title}</CardTitle>
                  <p className="text-gray-400">{category.description}</p>
                </CardHeader>
                <CardContent>
                  {!isLoggedIn ? (
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                    >
                      Login untuk Mulai Test
                    </Button>
                  ) : isLocked ? (
                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate('/pricing')}
                        className="w-full bg-purple-500 text-white hover:bg-purple-600"
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Upgrade ke Premium
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Unlock unlimited tests dengan premium access
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {canTakeFree && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                          <p className="text-sm text-green-400 font-semibold">
                            ✨ 1x Test Gratis Tersedia
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={() => handleStartTest(category.id, false)}
                        className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
                      >
                        {canTakeFree ? 'Mulai Test Gratis' : 'Mulai Test'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        {isLoggedIn && testAccess?.hasTakenFreeTest && !testAccess?.canTakePaidTest && (
          <div className="mt-12 text-center bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8">
            <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Upgrade ke Premium
            </h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Dapatkan akses unlimited untuk semua test, detailed reports, dan insights mendalam tentang kepribadian Anda.
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-purple-500 text-white hover:bg-purple-600 px-8 py-6 text-lg"
            >
              Lihat Paket Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestSelection;
