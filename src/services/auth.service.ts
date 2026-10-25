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
    thesis?: any;
  };
}

export const authService = {
  /**
   * Log in investor with email & password
   */
  login: async (email: string, password: string): Promise<AuthResponse['data']> => {
    const normalizedEmail = email.trim().toLowerCase();

    const res = await api.post<AuthResponse>('/auth/login', {
      email: normalizedEmail,
      password,
    });

    const data = res.data.data;
    if (typeof window !== 'undefined' && data?.token) {
      localStorage.setItem('dealflow_token', data.token);
      localStorage.setItem('dealflow_user', JSON.stringify(data.user));
      localStorage.setItem('dealflow_thesis_slug', data.thesisSlug || data.user.slug);
      document.cookie = `dealflow_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
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
      document.cookie = `dealflow_token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
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
      document.cookie =
        'dealflow_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
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
   * Retrieve active authenticated thesis slug from localStorage
   */
  getThesisSlug: (): string => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dealflow_thesis_slug');
      if (stored && stored.trim().length > 0) return stored.trim();
      const user = authService.getCurrentUser();
      if (user?.slug && user.slug.trim().length > 0) return user.slug.trim();
    }
    return '';
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
