import api from './api';

export const visitService = {
  createVisit: async (title = 'Clinical Consultation Intake') => {
    const res = await api.post('/visits', { title });
    return res.data;
  },

  getVisits: async () => {
    const res = await api.get('/visits');
    return res.data;
  },

  getVisitDetail: async (visitId) => {
    const res = await api.get(`/visits/${visitId}`);
    return res.data;
  },

  sendMessage: async (visitId, content, selectedOption = null) => {
    const res = await api.post(`/visits/${visitId}/messages`, {
      content,
      selected_option: selectedOption,
    });
    return res.data;
  },

  completeVisit: async (visitId) => {
    const res = await api.post(`/visits/${visitId}/complete`);
    return res.data;
  },

  analyzePrecautions: async ({ symptoms, duration = null, severity = null }) => {
    const res = await api.post('/visits/precautions/analyze', {
      symptoms,
      duration,
      severity,
    });
    return res.data;
  },
};
