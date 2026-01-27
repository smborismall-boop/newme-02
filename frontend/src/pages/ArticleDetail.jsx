import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
    loadRelatedArticles();
  }, [id]);

  const loadArticle = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/articles/${id}`);
      if (response.data.isPublished) {
        setArticle(response.data);
      } else {
        navigate('/articles');
      }
    } catch (error) {
      console.error('Failed to load article:', error);
      navigate('/articles');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedArticles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/articles`);
      const published = response.data.filter(a => a.isPublished && a._id !== id);
      setRelatedArticles(published.slice(0, 3));
    } catch (error) {
      console.error('Failed to load related articles:', error);
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

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || 'NEWME CLASS Article';
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url);
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl text-white mb-4">Artikel tidak ditemukan</h1>
          <Link to="/articles">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
              Kembali ke Artikel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          to="/articles" 
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Artikel
        </Link>

        {/* Article Header */}
        <div className="mb-8">
          {/* Category */}
          {article.category && (
            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-yellow-400/10 text-yellow-400 text-sm font-semibold rounded-full">
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{article.author || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm mr-2">Bagikan:</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="border-yellow-400/30 text-gray-400 hover:bg-yellow-400/10"
            >
              <Facebook className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="border-yellow-400/30 text-gray-400 hover:bg-yellow-400/10"
            >
              <Twitter className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleShare('whatsapp')}
              className="border-yellow-400/30 text-gray-400 hover:bg-yellow-400/10"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImage && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <Card className="bg-[#2a2a2a] border-yellow-400/20 mb-12">
          <CardContent className="p-8">
            <div 
              className="prose prose-invert prose-yellow max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                color: '#e5e5e5',
                fontSize: '1.1rem',
                lineHeight: '1.8'
              }}
            />
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Artikel Terkait</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <Link 
                  key={related._id}
                  to={`/articles/${related._id}`}
                  className="group"
                >
                  <Card className="bg-[#2a2a2a] border-yellow-400/20 hover:border-yellow-400/50 transition-all h-full">
                    {related.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={related.featuredImage} 
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 mb-2">
                        {related.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {formatDate(related.publishedAt || related.createdAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
