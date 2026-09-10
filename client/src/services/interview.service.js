import api from './api.js';

const interviewService = {
  create: (data) => api.post('/interviews', data),
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  delete: (id) => api.delete(`/interviews/${id}`),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/answers`, data),
  complete: (id) => api.post(`/interviews/${id}/complete`),
};

export default interviewService;
