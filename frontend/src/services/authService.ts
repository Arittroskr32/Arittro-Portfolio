import { verifyToken, setToken, getToken } from './github';
import { resetDataCache } from './staticBackend';

export interface LoginCredentials {
  /** GitHub fine-grained personal access token. */
  token: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: number;
    email: string;
    name: string;
    login?: string;
    avatar_url?: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const token = credentials.token.trim();
    if (!token) throw new Error('Paste your GitHub token.');
    const identity = await verifyToken(token);
    const admin = {
      id: 1,
      email: '',
      name: identity.name || identity.login,
      login: identity.login,
      avatar_url: identity.avatar_url,
    };
    setToken(token);
    localStorage.setItem('admin', JSON.stringify(admin));
    resetDataCache();
    return { token, admin };
  },

  async logout(): Promise<void> {
    setToken(null);
    localStorage.removeItem('admin');
    resetDataCache();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },

  getAdmin(): any {
    const admin = localStorage.getItem('admin');
    return admin ? JSON.parse(admin) : null;
  },
};
