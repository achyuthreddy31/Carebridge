import api from './api';

export const patientService = {
  getProfile: async () => {
    const res = await api.get('/patients/profile');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/patients/profile', data);
    return res.data;
  },

  getDashboard: async () => {
    const res = await api.get('/patients/dashboard');
    return res.data;
  },
};
