import axios from 'axios';
import { API_CONFIG } from '../config/api'; 

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
});
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry && 
        !originalRequest.url.endsWith('/auth/login') && 
        !originalRequest.url.endsWith('/auth/refresh')) 
    {
      originalRequest._retry = true;

      try {
        await apiClient.post('/auth/refresh');
         return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

