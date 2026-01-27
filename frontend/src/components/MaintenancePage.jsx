import React from 'react';
import { Wrench, Clock, Mail } from 'lucide-react';

const MaintenancePage = ({ message, settings }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        {/* Logo */}
        {settings?.logoUrl && (
          <img 
            src={settings.logoUrl.startsWith('http') ? settings.logoUrl : `${BACKEND_URL}${settings.logoUrl}`}
            alt="Logo"
            className="w-24 h-24 mx-auto mb-8 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 bg-yellow-400/10 rounded-full flex items-center justify-center animate-pulse">
          <Wrench className="w-12 h-12 text-yellow-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Sedang Maintenance
        </h1>
        
        {/* Message */}
        <p className="text-gray-300 text-lg mb-8">
          {message || 'Kami sedang melakukan pemeliharaan sistem. Silakan kembali beberapa saat lagi.'}
        </p>
        
        {/* Status indicators */}
        <div className="flex items-center justify-center gap-4 text-gray-400 mb-8">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Kembali segera</span>
          </div>
        </div>
        
        {/* Contact */}
        {settings?.email && (
          <div className="bg-[#2a2a2a] p-6 rounded-xl border border-yellow-400/20">
            <p className="text-gray-400 text-sm mb-2">Ada pertanyaan? Hubungi kami:</p>
            <a 
              href={`mailto:${settings.email}`}
              className="text-yellow-400 hover:underline flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {settings.email}
            </a>
          </div>
        )}
        
        {/* Admin access hint */}
        <p className="text-gray-500 text-xs mt-8">
          Admin dapat mengakses <a href="/admin/login" className="text-yellow-400/60 hover:text-yellow-400">dashboard</a> untuk menonaktifkan maintenance mode.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePage;
