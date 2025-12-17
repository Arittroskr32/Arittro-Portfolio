import { apiClient } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: number;
    email: string;
    name: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('admin', JSON.stringify(response.admin));
    return response;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin');
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return apiClient.post('/auth/change-password', data);
  },

  async getProfile(): Promise<any> {
    return apiClient.get('/auth/profile');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getAdmin(): any {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },
};
