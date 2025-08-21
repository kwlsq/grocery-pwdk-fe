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
  pagination: UsersPaginationInfo | null;
  selectedRole: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  setSelectedRole: (role: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN') => void;
  fetchUsers: (params?: { page?: number; size?: number; role?: '' | 'CUSTOMER' | 'MANAGER' | 'ADMIN' }) => Promise<void>;
  deleteUser: (params: { userID: string }) => Promise<void>;
  registerStoreAdmin: (data: RegisterUserDTO) => Promise<void>;
}


