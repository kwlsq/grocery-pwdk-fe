import apiClient from './apiClient';
import { API_CONFIG } from '../config/api';
import { RegisterData,LoginCredentials,VerifyData,ForgotPasswordData,ResetPasswordData } from '@/types/user'; 

export const loginUser = (credentials: LoginCredentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const registerUser = (data: RegisterData) => {
  return apiClient.post('/auth/register', data);
};

export const logoutUser = () => {
  return apiClient.post('/auth/logout');
};

export const fetchCurrentUser = () => {
  return apiClient.get(`${API_CONFIG.ENDPOINTS.USERS}/me`);
};

export const verifyAccount = (data: VerifyData) => {
  return apiClient.post('/auth/verify', data);
};
export const requestPasswordReset = (data: ForgotPasswordData) => {
    return apiClient.post('/auth/forgot-password', data);
};

export const resetPassword = (data: ResetPasswordData) => {
    return apiClient.post('/auth/reset-password', data);
};
export const confirmEmailChange = (token: string) => {
  return apiClient.post(`/auth/confirm-email-change?token=${token}`);
};

