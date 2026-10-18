import api from './api.js';

class QuizService {
  /**
   * Create and generate a new MCQ Quiz
   */
  create(data) {
    return api.post('/quizzes', data);
  }

  /**
   * Get all past quizzes for the current user
   */
  getAll() {
    return api.get('/quizzes');
  }

  /**
   * Get a quiz by ID
   */
  getById(id) {
    return api.get(`/quizzes/${id}`);
  }

  /**
   * Submit quiz answers for scoring and explanation breakdown
   */
  submit(id, data) {
    return api.post(`/quizzes/${id}/submit`, data);
  }

  /**
   * Delete a quiz session
   */
  delete(id) {
    return api.delete(`/quizzes/${id}`);
  }
}

export default new QuizService();
