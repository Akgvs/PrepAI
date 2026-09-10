import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios request interceptor — attaches Clerk session token to every request.
 * The token is obtained from window.Clerk which is set by ClerkProvider.
 */
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }
  return config;
});

/**
 * Response interceptor — unwraps the { success, data } envelope.
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    const code = error.response?.data?.code || 'UNKNOWN_ERROR';
    const status = error.response?.status || 500;

    const apiError = new Error(message);
    apiError.code = code;
    apiError.status = status;

    return Promise.reject(apiError);
  }
);

export default api;
