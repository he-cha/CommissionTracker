import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

// Mock credentials - in production, this would use OnSpace Cloud Auth
const MOCK_USERNAME = 'admin';
const MOCK_PASSWORD = 'boost2024';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      username: null,

      login: (username: string, password: string) => {
        if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
          set({ isAuthenticated: true, username });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false, username: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
