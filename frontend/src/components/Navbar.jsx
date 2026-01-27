import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();

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

  const navigation = [
    { name: 'Beranda', href: '/' },
    { name: 'Profile', href: '/company-profile' },
    { 
      name: 'Layanan', 
      href: '#',
      dropdown: [
        { name: 'NEWME TEST', href: '/newme-test' },
        { name: 'NEWME CLINIC', href: '/services/clinic' },
        { name: 'NEWME CLASS', href: '/services/class' },
        { name: 'NEWME GALLERY', href: '/services/gallery' },
        { name: 'NEWME NET', href: '/services/net' }
      ]
    },
    { name: 'Kelas Gali Bakat', href: '/kelas-gali-bakat' },
    { name: 'Shop', href: '/shop' },
    { name: 'Kontak', href: '/contact' },
    { name: 'Verifikasi Sertifikat', href: '/certificate-verify' }
  ];
  
  const isLoggedIn = localStorage.getItem('user_token');

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#1a1a1a] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              {settings?.logoUrl ? (
                <img 
                  src={`${BACKEND_URL}${settings.logoUrl}`}
                  alt={settings.siteName || "NEWME CLASS Logo"}
                  className="w-12 h-12 object-contain transform transition-transform group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = "/logo.png";
                  }}
                />
              ) : (
                <img 
                  src="/logo.png" 
                  alt="NEWME CLASS Logo" 
                  className="w-12 h-12 object-contain transform transition-transform group-hover:scale-110"
                />
              )}
              <div className="flex flex-col">
                <span className="text-white text-xl font-bold tracking-tight">
                  {settings?.siteName || "NEWME CLASS"}
                </span>
                <span className="text-yellow-400 text-xs">
                  {settings?.siteDescription || "Kelas Peduli Talenta"}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              item.dropdown ? (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  <button
                    className="px-4 py-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-[#2a2a2a] transition-all duration-200 flex items-center space-x-1"
                  >
                    <span>{item.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#2a2a2a] rounded-lg shadow-xl py-2 border border-yellow-400/20">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-yellow-400 text-[#1a1a1a] font-semibold'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-[#2a2a2a]'
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-yellow-400/20">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-yellow-400 text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-yellow-400 text-[#1a1a1a] font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-yellow-400 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#2a2a2a] border-t border-yellow-400/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              item.dropdown ? (
                <div key={item.name}>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-[#1a1a1a] flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {servicesOpen && (
                    <div className="pl-4 space-y-1">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className="block px-3 py-2 rounded-md text-sm text-gray-400 hover:text-yellow-400 hover:bg-[#1a1a1a]"
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-yellow-400 text-[#1a1a1a]'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-[#1a1a1a]'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
            
            {/* Mobile Auth Buttons */}
            <div className="border-t border-yellow-400/20 mt-2 pt-2">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-400 text-[#1a1a1a] text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-yellow-400 hover:bg-[#1a1a1a]"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-400 text-[#1a1a1a] text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;