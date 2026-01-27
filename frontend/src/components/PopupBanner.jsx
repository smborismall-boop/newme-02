import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { bannersAPI } from '../services/api';

const PopupBanner = () => {
  const [popups, setPopups] = useState([]);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadPopups();
  }, []);

  const loadPopups = async () => {
    try {
      const response = await bannersAPI.getAll({ type: 'popup', isActive: true });
      const popupBanners = response.data;
      
      if (popupBanners.length > 0) {
        // Check if user has dismissed today
        const dismissedToday = localStorage.getItem('popup_dismissed_date');
        const today = new Date().toDateString();
        
        if (dismissedToday !== today) {
          setPopups(popupBanners);
          setCurrentPopup(popupBanners[0]);
          // Delay showing popup for better UX
          setTimeout(() => setIsVisible(true), 1500);
        }
      }
    } catch (error) {
      console.error('Failed to load popups');
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Mark as dismissed for today
    localStorage.setItem('popup_dismissed_date', new Date().toDateString());
  };

  const handleNext = () => {
    const currentIndex = popups.indexOf(currentPopup);
    if (currentIndex < popups.length - 1) {
      setCurrentPopup(popups[currentIndex + 1]);
    } else {
      handleClose();
    }
  };

  if (!isVisible || !currentPopup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl border border-yellow-400/30 animate-scaleIn">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        {currentPopup.imageUrl && (
          <div className="w-full aspect-video overflow-hidden">
            <img
              src={currentPopup.imageUrl}
              alt={currentPopup.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-2">{currentPopup.title}</h2>
          {currentPopup.description && (
            <p className="text-gray-400 mb-4">{currentPopup.description}</p>
          )}

          <div className="flex gap-3">
            {currentPopup.link && (
              <a
                href={currentPopup.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
                  Selengkapnya
                </Button>
              </a>
            )}
            
            {popups.length > 1 ? (
              <Button
                onClick={handleNext}
                variant="outline"
                className="flex-1 border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
              >
                {popups.indexOf(currentPopup) < popups.length - 1 ? 'Lanjut' : 'Tutup'}
              </Button>
            ) : (
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 border-gray-400/50 text-gray-400 hover:bg-gray-400/10"
              >
                Tutup
              </Button>
            )}
          </div>

          {/* Dots indicator */}
          {popups.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {popups.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    popups.indexOf(currentPopup) === index
                      ? 'bg-yellow-400 w-6'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PopupBanner;
