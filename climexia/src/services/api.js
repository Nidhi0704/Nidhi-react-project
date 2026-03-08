import axios from 'axios';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,          // ← CRITICAL: sends the httpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Token storage helpers ─────────────────────────────────────────────────────
const TOKEN_KEY = 'clx_token';
const USER_TYPE_KEY = 'clx_user_type';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_TYPE_KEY);
};
export const setUserType = (type) => localStorage.setItem(USER_TYPE_KEY, type);
export const getUserType = () => localStorage.getItem(USER_TYPE_KEY);

// ── Request interceptor — attach Authorization header ─────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — auto-refresh on 401 ────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet and it's not a refresh/login call
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/admin/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Determine which refresh endpoint to call
        const userType = getUserType();
        const refreshUrl = userType === 'admin'
          ? '/admin/auth/refresh'
          : userType === 'partner'
          ? '/partner/refresh'
          : '/auth/refresh';

        const { data } = await api.post(refreshUrl);
        const newToken = data.accessToken;

        setToken(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        // Redirect to login — works whether SPA is at / or /admin
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth APIs ──────────────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: async (data) => {
    const res = await api.post('/auth/login', data);
    setToken(res.data.accessToken);
    setUserType('customer');
    return res;
  },
  logout: () => {
    removeToken();
    return api.post('/auth/logout');
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  addAddress: (data) => api.post('/auth/address', data),
  updateAddress: (id, data) => api.put(`/auth/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
};

// ── Admin Auth APIs ────────────────────────────────────────────────────────────

export const adminAuthAPI = {
  login: async (data) => {
    const res = await api.post('/admin/auth/login', data);
    setToken(res.data.accessToken);
    setUserType('admin');
    return res;
  },
  logout: () => {
    removeToken();
    return api.post('/admin/auth/logout');
  },
  getMe: () => api.get('/admin/auth/me'),
  changePassword: (data) => api.put('/admin/auth/change-password', data),
  forgotPassword: (data) => api.post('/admin/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/admin/auth/reset-password/${token}`, data),
  // Staff
  listStaff: (params) => api.get('/admin/auth/staff', { params }),
  createStaff: (data) => api.post('/admin/auth/staff', data),
  getStaff: (id) => api.get(`/admin/auth/staff/${id}`),
  updateStaff: (id, data) => api.put(`/admin/auth/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/auth/staff/${id}`),
  updatePermissions: (id, data) => api.put(`/admin/auth/staff/${id}/permissions`, data),
};

// ── Partner Auth APIs ─────────────────────────────────────────────────────────

export const partnerAuthAPI = {
  register: (data) => api.post('/partner/register', data),
  login: async (data) => {
    const res = await api.post('/partner/login', data);
    setToken(res.data.accessToken);
    setUserType('partner');
    return res;
  },
  logout: () => {
    removeToken();
    return api.post('/partner/logout');
  },
  getMe: () => api.get('/partner/me'),
  toggleOnline: () => api.put('/partner/toggle-online'),
  uploadDocuments: (formData) =>
    api.post('/partner/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Catalog APIs (public) ─────────────────────────────────────────────────────

export const catalogAPI = {
  getServices: (params) => api.get('/services', { params }),
  getService: (id) => api.get(`/services/${id}`),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getParts: (params) => api.get('/parts', { params }),
  getPart: (id) => api.get(`/parts/${id}`),
};

// ── Booking APIs ──────────────────────────────────────────────────────────────

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  review: (id, data) => api.post(`/bookings/${id}/review`, data),
  // Partner
  getJobs: (params) => api.get('/bookings/partner/jobs', { params }),
  acceptJob: (id) => api.put(`/bookings/${id}/accept`),
  completeJob: (id, data) => api.put(`/bookings/${id}/complete`, data),
  // Admin
  adminList: (params) => api.get('/bookings/admin/all', { params }),
  adminAssign: (id, data) => api.put(`/bookings/admin/${id}/assign`, data),
  adminUpdateStatus: (id, data) => api.put(`/bookings/admin/${id}/status`, data),
};

// ── AMC APIs ──────────────────────────────────────────────────────────────────

export const amcAPI = {
  submit: (data) => api.post('/amc', data),
  getMy: () => api.get('/amc/my'),
  get: (id) => api.get(`/amc/${id}`),
  adminList: (params) => api.get('/amc/admin/all', { params }),
  activate: (id) => api.put(`/amc/admin/${id}/activate`),
  renew: (id) => api.put(`/amc/admin/${id}/renew`),
};

// ── Order APIs ────────────────────────────────────────────────────────────────

export const orderAPI = {
  place: (data) => api.post('/orders', data),
  getMy: (params) => api.get('/orders/my', { params }),
  adminList: (params) => api.get('/orders/admin/all', { params }),
  updateStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
};

// ── Support APIs ──────────────────────────────────────────────────────────────

export const supportAPI = {
  create: (data) => api.post('/support/tickets', data),
  getMy: (params) => api.get('/support/tickets/my', { params }),
  get: (id) => api.get(`/support/tickets/${id}`),
  reply: (id, data) => api.post(`/support/tickets/${id}/reply`, data),
  adminList: (params) => api.get('/admin/support/tickets', { params }),
  assign: (id, data) => api.put(`/admin/support/tickets/${id}/assign`, data),
  close: (id) => api.put(`/admin/support/tickets/${id}/close`),
};

// ── Dashboard APIs ────────────────────────────────────────────────────────────

export const dashboardAPI = {
  get: () => api.get('/admin/dashboard'),
  getRecent: () => api.get('/admin/dashboard/recent'),
  getBookingStats: () => api.get('/admin/dashboard/stats/bookings'),
  getAuditLogs: (params) => api.get('/admin/audit', { params }),
};

// ── Admin Management APIs ─────────────────────────────────────────────────────

export const adminAPI = {
  listUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  listPartners: (params) => api.get('/admin/partners', { params }),
  getPartner: (id) => api.get(`/admin/partners/${id}`),
  approvePartner: (id) => api.put(`/admin/partners/${id}/approve`),
  rejectPartner: (id, data) => api.put(`/admin/partners/${id}/reject`, data),
  blockPartner: (id) => api.put(`/admin/partners/${id}/block`),
  updateKYC: (id, data) => api.put(`/admin/partners/${id}/kyc`, data),
  // Catalog
  createService: (data) => api.post('/admin/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  createProduct: (data) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  createPart: (data) => api.post('/admin/parts', data),
  updatePart: (id, data) => api.put(`/admin/parts/${id}`, data),
  deletePart: (id) => api.delete(`/admin/parts/${id}`),
};

// ── Notifications API ─────────────────────────────────────────────────────────

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

// ── Health check ──────────────────────────────────────────────────────────────

export const healthCheck = () => api.get('/health');

export default api;