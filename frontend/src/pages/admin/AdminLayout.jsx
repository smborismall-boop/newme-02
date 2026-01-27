import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  ShoppingBag,
  HelpCircle,
  Image,
  LogOut,
  Menu,
  X,
  Award,
  Bell,
  Gift,
  FileText,
  MessageSquare,
  UsersRound,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(() => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  });

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
    { name: 'Certificates', href: '/admin/certificates', icon: Award },
    { name: 'Banners', href: '/admin/banners', icon: Image },
    { name: 'Referrals', href: '/admin/referrals', icon: Gift },
    { name: 'Articles', href: '/admin/articles', icon: FileText },
    { name: 'Team & Mitra', href: '/admin/team-management', icon: UsersRound },
    { name: 'Running Info', href: '/admin/running-info', icon: MessageSquare },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Manajemen Admin', href: '/admin/admin-users', icon: Shield },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    toast({
      title: 'Logout Berhasil',
      description: 'Anda telah keluar dari dashboard'
    });
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#2a2a2a] flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-[#2a2a2a] border-r border-yellow-400/20 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-yellow-400/20">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-[#1a1a1a]">N</span>
                </div>
                <div>
                  <h2 className="text-white font-bold">NEWME</h2>
                  <p className="text-gray-400 text-xs">Admin Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-yellow-400 p-2 rounded"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-yellow-400 text-[#1a1a1a]'
                    : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-yellow-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-yellow-400/20">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="text-white font-semibold text-sm">{adminUser?.username}</p>
              <p className="text-gray-400 text-xs">{adminUser?.role}</p>
            </div>
          ) : null}
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 ${
              !sidebarOpen && 'px-2'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;