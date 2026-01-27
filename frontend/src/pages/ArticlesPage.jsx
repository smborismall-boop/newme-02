import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/articles`);
      // Filter only published articles
      const publishedArticles = response.data.filter(article => article.isPublished);
      setArticles(publishedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(articles.map(a => a.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20 flex items-center justify-center">
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
            Artikel & Berita
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Baca artikel terbaru seputar pengembangan talenta, tips karir, dan informasi menarik lainnya
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Cari artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#2a2a2a] border-yellow-400/20 text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            {categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className={selectedCategory === category 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                  : 'border-yellow-400/30 text-gray-400 hover:bg-yellow-400/10'
                }
              >
                {category === 'all' ? 'Semua' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Belum ada artikel yang dipublikasikan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map(article => (
              <Card 
                key={article._id} 
                className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300 overflow-hidden group"
              >
                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.featuredImage} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Category Badge */}
                  {article.category && (
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-yellow-400/10 text-yellow-400 text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  {article.excerpt && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{article.author || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    to={`/articles/${article._id}`}
                    className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-semibold text-sm group/link"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination (optional - for future) */}
        {filteredArticles.length > 9 && (
          <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" className="border-yellow-400/30 text-gray-400">
                Previous
              </Button>
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                1
              </Button>
              <Button variant="outline" className="border-yellow-400/30 text-gray-400">
                2
              </Button>
              <Button variant="outline" className="border-yellow-400/30 text-gray-400">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;
