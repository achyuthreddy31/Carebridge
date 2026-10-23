import api from './api';

export const reportService = {
  uploadReport: async (file, reportType = 'lab_report', title = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', reportType);
    if (title) formData.append('title', title);

    const res = await api.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getReports: async (reportType = null) => {
    const params = reportType ? { report_type: reportType } : {};
    const res = await api.get('/reports', { params });
    return res.data;
  },

  getReportDetail: async (reportId) => {
    const res = await api.get(`/reports/${reportId}`);
    return res.data;
  },

  getFileUrl: (reportId) => {
    return `/api/reports/${reportId}/file`;
  },
};
