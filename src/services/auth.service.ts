import { api } from '@/lib/api';

export interface AuthUserData {
  id: string;
  name: string;
  email: string;
  firmName: string;
  slug: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUserData;
    thesisSlug: string;
    thesis: any;
  };
}

export const authService = {
  /**
   * Log in investor with email & password
   */
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const res = await api.post<AuthResponse>('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });

    const data = res.data.data;
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('dealflow_token', data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(data.user));
      localStorage.setItem('dealflow_thesis_slug', data.thesisSlug || data.user.slug);
    }

    return data;
  },

  /**
   * Register a new investor account and initialize their investment thesis
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    firmName: string;
    role?: string;
  }): Promise<AuthResponse['data']> => {
    const res = await api.post<AuthResponse>('/auth/register', {
      ...payload,
      email: payload.email.trim().toLowerCase(),
    });

    const data = res.data.data;
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('dealflow_token', data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(data.user));
      localStorage.setItem('dealflow_thesis_slug', data.thesisSlug || data.user.slug);
    }

    return data;
  },

  /**
   * Sign out and clear stored session tokens
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('dealflow_token');
      localStorage.removeItem('dealflow_user');
      localStorage.removeItem('dealflow_thesis_slug');
    }
  },

  /**
   * Retrieve active authenticated user from localStorage
   */
  getCurrentUser: (): AuthUserData | null => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('dealflow_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  /**
   * Check if investor has an active token
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem('dealflow_token'));
    }
    return false;
  },
};

export default authService;
