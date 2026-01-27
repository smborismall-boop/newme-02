import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // User authenticated endpoints
    const userAuthEndpoints = ['/auth/', '/user-payments/', '/questions', '/ai-analysis/', '/certificates/', '/personality-tests/'];
    const isUserEndpoint = userAuthEndpoints.some(ep => config.url?.includes(ep));
    
    if (isUserEndpoint) {
      const userToken = localStorage.getItem('user_token');
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    
    // Admin endpoints (fallback)
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Registration API
export const registrationAPI = {
  create: (data) => apiClient.post('/registrations', data),
  getAll: (params) => apiClient.get('/registrations', { params }),
  getById: (id) => apiClient.get(`/registrations/${id}`),
  getStats: () => apiClient.get('/registrations/stats/summary'),
};

// Contact API
export const contactAPI = {
  create: (data) => apiClient.post('/contacts', data),
  getAll: (params) => apiClient.get('/contacts', { params }),
  getById: (id) => apiClient.get(`/contacts/${id}`),
  updateStatus: (id, status, notes) => 
    apiClient.put(`/contacts/${id}/status?status=${status}${notes ? `&notes=${notes}` : ''}`),
  getStats: () => apiClient.get('/contacts/stats/summary'),
};

// Institution API
export const institutionAPI = {
  createInquiry: (data) => apiClient.post('/institutions/inquiry', data),
  getAll: (params) => apiClient.get('/institutions', { params }),
  getById: (id) => apiClient.get(`/institutions/${id}`),
  updateStatus: (id, status) => 
    apiClient.put(`/institutions/${id}/status?status=${status}`),
  getStats: () => apiClient.get('/institutions/stats/summary'),
};

// Admin API
export const adminAPI = {
  register: (data) => apiClient.post('/admin/register', data),
  login: (data) => apiClient.post('/admin/login', data),
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  getCurrentAdmin: () => apiClient.get('/admin/me'),
  // Admin User Management
  getAdminUsers: () => apiClient.get('/admin/users'),
  createAdminUser: (data) => apiClient.post('/admin/users/create', data),
  changeAdminPassword: (adminId, data) => apiClient.put(`/admin/users/${adminId}/change-password`, data),
  deleteAdminUser: (adminId) => apiClient.delete(`/admin/users/${adminId}`),
};

// Users API
export const usersAPI = {
  getAll: (params) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  delete: (id) => apiClient.delete(`/users/${id}`),
  updateStatus: (id, status) => apiClient.put(`/users/${id}/status?status=${status}`),
  getStats: () => apiClient.get('/users/stats/summary'),
};

// Payment API
export const paymentAPI = {
  uploadProof: (formData) => apiClient.post('/payments/upload-proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (params) => apiClient.get('/payments', { params }),
  approve: (id, data) => apiClient.put(`/payments/${id}/approve`, data),
  getByRegistration: (registrationId) => apiClient.get(`/payments/registration/${registrationId}`),
  getStats: () => apiClient.get('/payments/stats/summary'),
};

// Products API
export const productsAPI = {
  getAll: (params) => apiClient.get('/products', { params }),
  getById: (id) => apiClient.get(`/products/${id}`),
  create: (data) => apiClient.post('/products', data),
  update: (id, data) => apiClient.put(`/products/${id}`, data),
  delete: (id) => apiClient.delete(`/products/${id}`),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/products/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getCategories: () => apiClient.get('/products/categories/list'),
  getStats: () => apiClient.get('/products/stats/summary'),
};

// Questions API
export const questionsAPI = {
  getAll: (params) => apiClient.get('/questions', { params }),
  getById: (id) => apiClient.get(`/questions/${id}`),
  create: (data) => apiClient.post('/questions', data),
  update: (id, data) => apiClient.put(`/questions/${id}`, data),
  delete: (id) => apiClient.delete(`/questions/${id}`),
  getCategories: () => apiClient.get('/questions/categories/list'),
  reorder: (orders) => apiClient.put('/questions/reorder', orders),
};

// Banners API
export const bannersAPI = {
  getAll: (params) => apiClient.get('/banners', { params }),
  getById: (id) => apiClient.get(`/banners/${id}`),
  create: (formData) => apiClient.post('/banners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => apiClient.put(`/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => apiClient.delete(`/banners/${id}`),
  reorder: (orders) => apiClient.put('/banners/reorder', orders),
};

// Transactions API (Midtrans)
export const transactionsAPI = {
  create: (data) => apiClient.post('/transactions/create', data),
  getStatus: (orderId) => apiClient.get(`/transactions/${orderId}/status`),
  getAll: (params) => apiClient.get('/transactions', { params }),
  getStats: () => apiClient.get('/transactions/stats/summary'),
  getConfig: () => apiClient.get('/transactions/config'),
};

// Certificates API
export const certificatesAPI = {
  getTemplate: () => apiClient.get('/certificates/template'),
  updateTemplate: (formData) => apiClient.put('/certificates/template', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAsset: (assetType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/certificates/template/upload/${assetType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getIssued: (params) => apiClient.get('/certificates/issued', { params }),
  issue: (formData) => apiClient.post('/certificates/issue', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verify: (certificateNumber) => apiClient.get(`/certificates/verify/${certificateNumber}`),
  checkEligibility: () => apiClient.get('/certificates/check-eligibility'),
  downloadAICertificate: () => apiClient.get('/certificates/download-ai-certificate', { responseType: 'blob' }),
};

// Analytics API
export const analyticsAPI = {
  trackPageview: (page, sessionId) => apiClient.post(`/analytics/pageview?page=${page}${sessionId ? `&sessionId=${sessionId}` : ''}`),
  getStats: () => apiClient.get('/analytics/stats'),
  getOnlineUsers: () => apiClient.get('/analytics/online-users'),
  cleanup: () => apiClient.delete('/analytics/cleanup'),
};

// Settings API
export const settingsAPI = {
  get: () => apiClient.get('/settings'),
  update: (data) => apiClient.put('/settings', data),
  uploadAsset: (assetType, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/settings/upload/${assetType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteBanner: (index) => apiClient.delete(`/settings/banner/${index}`),
};

// User Auth API
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
  getReferralLink: () => apiClient.get('/auth/referral-link'),
};

// User Payments API
export const userPaymentsAPI = {
  uploadProof: (formData) => apiClient.post('/user-payments/upload-proof', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyPayments: () => apiClient.get('/user-payments/my-payments'),
  getTestPrice: () => apiClient.get('/user-payments/test-price'),
  createQRIS: () => apiClient.post('/user-payments/create-qris'),
  checkPayment: (orderId) => apiClient.get(`/user-payments/check-payment/${orderId}`),
};

// Referral API
export const referralAPI = {
  getSettings: () => apiClient.get('/referrals/settings'),
  updateSettings: (formData) => apiClient.put('/referrals/settings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getLeaderboard: (limit) => apiClient.get(`/referrals/leaderboard?limit=${limit || 20}`),
  getTransactions: (params) => apiClient.get('/referrals/transactions', { params }),
  getStats: () => apiClient.get('/referrals/stats'),
};

// Articles API
export const articlesAPI = {
  getAll: (params) => apiClient.get('/articles', { params }),
  getById: (id) => apiClient.get(`/articles/${id}`),
  create: (formData) => apiClient.post('/articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => apiClient.put(`/articles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => apiClient.delete(`/articles/${id}`),
  getStats: () => apiClient.get('/articles/stats/summary'),
};

// Running Info API
export const runningInfoAPI = {
  getActive: () => apiClient.get('/running-info?isActive=true'),
  getAll: () => apiClient.get('/running-info/all'),
  create: (formData) => apiClient.post('/running-info', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => apiClient.put(`/running-info/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => apiClient.delete(`/running-info/${id}`),
};

// Personality Tests API
export const personalityTestsAPI = {
  getQuestions: (testType, includePremium) => apiClient.get(`/personality-tests/questions/${testType}?include_premium=${includePremium}`),
  submitTest: (data) => apiClient.post('/personality-tests/submit', data),
  getDescription: (personalityType) => apiClient.get(`/personality-tests/descriptions/${personalityType}`),
  getMyResults: () => apiClient.get('/personality-tests/my-results'),
  getStats: () => apiClient.get('/personality-tests/stats'),
};

// AI Analysis API
export const aiAnalysisAPI = {
  analyze: (data) => apiClient.post('/ai-analysis/analyze', data),
  getMyAnalyses: () => apiClient.get('/ai-analysis/my-analyses'),
  getLatest: () => apiClient.get('/ai-analysis/latest'),
};

// Health check
export const healthCheck = () => apiClient.get('/health');

export default apiClient;