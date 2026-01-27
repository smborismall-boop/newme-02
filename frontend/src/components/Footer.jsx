import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/settings`);
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {settings?.logoUrl ? (
                <img 
                  src={`${BACKEND_URL}${settings.logoUrl}`}
                  alt={settings.siteName || "NEWME CLASS Logo"}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
              ) : (
                <img 
                  src="/logo.png" 
                  alt="NEWME CLASS Logo" 
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h3 className="text-white text-lg font-bold">{settings?.siteName || "NEWME CLASS"}</h3>
                <p className="text-yellow-400 text-xs">{settings?.siteDescription || "Kelas Peduli Talenta"}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Membangun kemitraan edukasi jatidiri strategis untuk menciptakan Indonesia yang cakap & bahagia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-2">
                  <span>Beranda</span>
                </Link>
              </li>
              <li>
                <Link to="/company-profile" className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-2">
                  <span>Company Profile</span>
                </Link>
              </li>
              <li>
                <Link to="/kelas-gali-bakat" className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-2">
                  <span>Kelas Gali Bakat</span>
                </Link>
              </li>
              <li>
                <Link to="/newme-test" className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-2">
                  <span>NEWME Test</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-yellow-400 transition-colors flex items-center space-x-2">
                  <span>Kontak</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Layanan</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/newme-test" className="text-sm hover:text-yellow-400 transition-colors">
                  NEWME TEST
                </Link>
              </li>
              <li>
                <Link to="/services/clinic" className="text-sm hover:text-yellow-400 transition-colors">
                  NEWME CLINIC
                </Link>
              </li>
              <li>
                <Link to="/services/class" className="text-sm hover:text-yellow-400 transition-colors">
                  NEWME CLASS
                </Link>
              </li>
              <li>
                <Link to="/services/gallery" className="text-sm hover:text-yellow-400 transition-colors">
                  NEWME GALLERY
                </Link>
              </li>
              <li>
                <Link to="/services/net" className="text-sm hover:text-yellow-400 transition-colors">
                  NEWME NET
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Kontak Kami</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <a href={`tel:${settings?.phone || '08950267169'}`} className="text-sm hover:text-yellow-400 transition-colors">
                  {settings?.phone || '0895.0267.1691'}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <a href={`mailto:${settings?.email || 'newmeclass@gmail.com'}`} className="text-sm hover:text-yellow-400 transition-colors">
                  {settings?.email || 'newmeclass@gmail.com'}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <Instagram className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <a href={`https://instagram.com/${settings?.instagram?.replace('@', '') || 'newmeclass'}`} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-yellow-400 transition-colors">
                  {settings?.instagram || '@newmeclass'}
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{settings?.address || 'Jl. Puskesmas I - Komp. Golden Seroja - A1'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {settings?.siteName || "NEWME CLASS"}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <Link to="/privacy-policy" className="hover:text-yellow-400 transition-colors">
                Kebijakan Privasi
              </Link>
              <span className="text-gray-700">|</span>
              <Link to="/contact" className="hover:text-yellow-400 transition-colors">
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;