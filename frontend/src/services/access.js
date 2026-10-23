import api from './api';

export const accessService = {
  // Patient endpoints
  createToken: async (scope = ['visit_summary', 'recent_reports', 'lab_data'], expiryMinutes = 15) => {
    const res = await api.post('/access-tokens', {
      scope,
      expiry_minutes: expiryMinutes,
    });
    return res.data;
  },

  getTokens: async () => {
    const res = await api.get('/access-tokens');
    return res.data;
  },

  revokeToken: async (tokenId) => {
    const res = await api.post(`/access-tokens/${tokenId}/revoke`);
    return res.data;
  },

  getAccessHistory: async () => {
    const res = await api.get('/audit/access-history');
    return res.data;
  },

  // Doctor workspace endpoints
  validateDoctorAccess: async (otpCode) => {
    const res = await api.post('/access/validate', { otp_code: otpCode });
    return res.data;
  },

  getPatientSummaryForDoctor: async (tokenId) => {
    const res = await api.get(`/access/patient/${tokenId}/summary`);
    return res.data;
  },

  getPatientReportsForDoctor: async (tokenId) => {
    const res = await api.get(`/access/patient/${tokenId}/reports`);
    return res.data;
  },
};
