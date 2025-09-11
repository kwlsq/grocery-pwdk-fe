import axios from 'axios';
import { API_CONFIG } from '../config/api'; 

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
});

export default apiClient;

