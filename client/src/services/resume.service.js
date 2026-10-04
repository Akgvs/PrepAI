import api from './api.js';

class ResumeService {
  /**
   * Create a new resume
   */
  create(data) {
    return api.post('/resumes', data);
  }

  /**
   * Get all resumes for the current user
   */
  getAll() {
    return api.get('/resumes');
  }

  /**
   * Get a specific resume by ID
   */
  getById(id) {
    return api.get(`/resumes/${id}`);
  }

  /**
   * Update an existing resume
   */
  update(id, data) {
    return api.put(`/resumes/${id}`, data);
  }

  /**
   * Delete a resume
   */
  delete(id) {
    return api.delete(`/resumes/${id}`);
  }

  /**
   * Run ATS scoring on a resume
   */
  scoreATS(id) {
    return api.post(`/resumes/${id}/score`);
  }

  /**
   * Rewrite a bullet point using the STAR method
   */
  rewriteBullet(id, experienceIndex, bulletIndex) {
    return api.post(`/resumes/${id}/rewrite-bullet`, {
      experienceIndex,
      bulletIndex,
    });
  }
}

export default new ResumeService();
