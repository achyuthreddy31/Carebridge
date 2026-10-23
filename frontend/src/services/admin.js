import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (role = null) => {
    const params = role ? { role } : {};
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserStatus: async (userId, isActive) => {
    const res = await api.put(`/admin/users/${userId}/status`, null, {
      params: { is_active: isActive },
    });
    return res.data;
  },

  getAuditLogs: async () => {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};
