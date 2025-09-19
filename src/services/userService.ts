import apiClient from './apiClient';
import { APIWrapper,PaginatedUserResponse } from '@/types/user';
export const updateUserProfile = (formData: FormData) => {
  return apiClient.patch('/users/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const requestEmailChange = (data: { newEmail: string; currentPassword: string; }) => {
  return apiClient.post('/users/me/change-email', data);
};
export const getManagerUsers = () => {
  
return apiClient.get<APIWrapper<PaginatedUserResponse>>('/users?role=MANAGER');
};