import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VisitorTracker from './components/VisitorTracker';
import SEOHead from './components/SEOHead';
import MaintenancePage from './components/MaintenancePage';
import { useTheme } from './contexts/ThemeContext';
import Home from './pages/Home';
import CompanyProfile from './pages/CompanyProfile';
import KelasGaliBakat from './pages/KelasGaliBakat';
import NewmeTest from './pages/NewmeTest';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Shop from './pages/Shop';
import CertificateVerify from './pages/CertificateVerify';
import ArticlesPage from './pages/ArticlesPage';
import ArticleDetail from './pages/ArticleDetail';
import PersonalityTestsLanding from './pages/PersonalityTestsLanding';
import PersonalityTest from './pages/PersonalityTest';
import PersonalityTestResult from './pages/PersonalityTestResult';
import TestSelection from './pages/TestSelection';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/UserDashboard';
import UserTest from './pages/UserTest';
import Wallet from './pages/Wallet';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import Users from './pages/admin/Users';
import Payments from './pages/admin/Payments';
import Products from './pages/admin/Products';
import Questions from './pages/admin/Questions';
import Certificates from './pages/admin/Certificates';
import Banners from './pages/admin/Banners';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Referrals from './pages/admin/Referrals';
import Articles from './pages/admin/Articles';
import RunningInfo from './pages/admin/RunningInfo';
import TeamManagement from './pages/admin/TeamManagement';
import AdminUsers from './pages/admin/AdminUsers';
import WebsiteContent from './pages/admin/WebsiteContent';
import { Toaster } from './components/ui/toaster';

// Component to handle maintenance mode check
const AppContent = () => {
  const { settings, loading } = useTheme();
  
  // Check if maintenance mode is enabled
  const isMaintenanceMode = settings?.maintenanceMode === true;
  
  // Show loading while fetching settings
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <SEOHead />
      <VisitorTracker />
      <Routes>
        {/* Admin routes - always accessible */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="users" element={<Users />} />
          <Route path="payments" element={<Payments />} />
          <Route path="products" element={<Products />} />
          <Route path="questions" element={<Questions />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="banners" element={<Banners />} />
          <Route path="referrals" element={<Referrals />} />
          <Route path="articles" element={<Articles />} />
          <Route path="running-info" element={<RunningInfo />} />
          <Route path="team-management" element={<TeamManagement />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin-users" element={<AdminUsers />} />
          <Route path="website-content" element={<WebsiteContent />} />
        </Route>
        
        {/* If maintenance mode is ON, show maintenance page for all public routes */}
        {isMaintenanceMode ? (
          <Route path="/*" element={
            <MaintenancePage 
              message={settings?.maintenanceMessage} 
              settings={settings}
            />
          } />
        ) : (
          <>
            {/* Auth routes (no navbar/footer) */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/user-test" element={<UserTest />} />
            <Route path="/wallet" element={<Wallet />} />
            
            {/* Public routes with navbar/footer */}
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/company-profile" element={<CompanyProfile />} />
                  <Route path="/kelas-gali-bakat" element={<KelasGaliBakat />} />
                  <Route path="/newme-test" element={<NewmeTest />} />
                  <Route path="/services/:serviceId" element={<Services />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/articles" element={<ArticlesPage />} />
                  <Route path="/articles/:id" element={<ArticleDetail />} />
                  <Route path="/personality-tests" element={<PersonalityTestsLanding />} />
                  <Route path="/test/:testType" element={<PersonalityTest />} />
                  <Route path="/test/result/:testType/:result" element={<PersonalityTestResult />} />
                  <Route path="/test-selection" element={<TestSelection />} />
                  <Route path="/certificate-verify" element={<CertificateVerify />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
                <Footer />
              </>
            } />
          </>
        )}
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

function App() {
  return (
    <div className="App">
      <AppContent />
    </div>
  );
}

export default App;
