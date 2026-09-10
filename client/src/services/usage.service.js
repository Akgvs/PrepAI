import api from './api.js';

const usageService = {
  get: () => api.get('/usage'),
  updatePlan: (plan) => api.post('/usage/plan', { plan }),
};

export default usageService;

