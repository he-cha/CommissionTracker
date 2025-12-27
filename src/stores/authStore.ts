import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  username: null,
  token: localStorage.getItem('token'),

  login: async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.token;

        localStorage.setItem('token', token);
        set({ isAuthenticated: true, username, token });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, username: null, token: null });
  },

  checkAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ isAuthenticated: true, token });
    }
  },
}));
