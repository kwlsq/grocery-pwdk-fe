import { PaginationInfo } from "./common";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  photoUrl: string | null;
  verified: boolean;
}
export interface UsersApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    content: User[];
  };
}
export interface UsersPaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface RegisterUserDTO {
  email: string,
  fullName: string
}
export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  selectedRole: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  setSelectedRole: (role: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN') => void;
  fetchUsers: (params?: { page?: number; size?: number; role?: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN'; search?: string; sortBy?: string; sortDirection?: string }) => Promise<void>;
  deleteUser: (userID: string ) => Promise<void>;
  registerStoreAdmin: (data: RegisterUserDTO) => Promise<void>;
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  fullName: string;
  email: string;
}
export interface VerifyData {
  token: string;
  password: string;
}
export interface UpdateProfileData {
    fullName: string;
    profileImage?: File;
}
export interface ForgotPasswordData{
  email : string;
}
export interface ResetPasswordData{
  token : string;
  newPassword : string;
}
export interface UpdateEmailRequest {
    newEmail: string;
    currentPassword: string;
}

export interface ConfirmEmailChangeRequest {
    token: string;
}
export interface PaginatedUserResponse {
    content: User[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface APIWrapper<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
