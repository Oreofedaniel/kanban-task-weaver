import { create } from 'zustand';
import axios, { AxiosError } from 'axios';
import { getApiUrl } from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  // add more fields if your backend returns them
}

interface AuthResponse {
  access_token: string;
  user: User;
  message?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User | null, token?: string) => void; // 👈 added
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post<AuthResponse>(getApiUrl('/auth/login'), { email, password });

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      set({ user: data.user, loading: false });
      return data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message || 'Login failed. Check your credentials';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.post<AuthResponse>(getApiUrl('/auth/register'), {
        name,
        email,
        password,
      });
      set({ loading: false });
      return data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage =
        axiosError.response?.data?.message ||
        (axiosError.response?.status === 409
          ? 'Email already exists'
          : 'Registration failed. Please try again.');
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null });
  },

  clearError: () => set({ error: null }),

  setUser: (user, token) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      if (token) {
        localStorage.setItem('token', token);
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user });
  },

  
}));