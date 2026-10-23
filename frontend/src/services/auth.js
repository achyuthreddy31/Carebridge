import api from './api';

export const authService = {
  sendOTP: async (phone, purpose = 'login') => {
    const res = await api.post('/auth/send-otp', { phone, purpose });
    return res.data;
  },

  verifyOTP: async (phone, otp) => {
    const res = await api.post('/auth/verify-otp', { phone, otp });
    return res.data;
  },

  registerPatient: async (data) => {
    const res = await api.post('/auth/register-patient', data);
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    } finally {
      localStorage.removeItem('curasync_token');
      localStorage.removeItem('curasync_user');
    }
  },
};
