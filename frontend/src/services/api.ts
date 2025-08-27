import axios from 'axios';

// API configuration
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.0.0.1');
const API_BASE_URL = isProduction 
  ? 'https://34334c504147.ngrok-free.app/api'  // Your ngrok URL
  : 'http://localhost:5000/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // We use Authorization header (JWT). Do not send credentials/cookies.
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// Request interceptor to add auth token if exists
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
  user?: any;
  errors?: any[];
}

// User interfaces
export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  budgetLimit: number;
}

export interface ForgotPasswordData {
  email: string;
}

// Expense interfaces
export interface ExpenseData {
  title: string;
  amount: number;
  date: string;
  category?: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  spentAmount: number;
  date: string;
  category: string;
  user: string;
  budgetPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStats {
  totalSpent: number;
  budgetLimit: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
  expensesByCategory: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  totalExpenses: number;
}

// API Service class
class ApiService {
  private publishUserUpdate(user: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
        const evt = new CustomEvent('userUpdated', { detail: user });
        window.dispatchEvent(evt);
      }
    } catch {}
  }

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    budgetLimit?: number;
    avatarUrl?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.put('/auth/profile', payload);
      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.publishUserUpdate(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axiosInstance.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.publishUserUpdate(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  async login(loginData: LoginData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post('/auth/login', loginData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.publishUserUpdate(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(signupData: SignupData): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post('/auth/register', signupData);
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.publishUserUpdate(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getExpenses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    category?: string;
    dateFrom?: string; // YYYY-MM-DD
    dateTo?: string;   
  }): Promise<ApiResponse<Expense[]>> {
    try {
      const query = params
        ? '?' + new URLSearchParams( 
              Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
              if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
              return acc;
            }, {})
          ).toString()
        : '';

      const response = await axiosInstance.get(`/expenses${query}`);
      return response.data;
    } catch (error) {
      console.error('Get expenses error:', error);
      throw error;
    }
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await axiosInstance.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get expense error:', error);
      throw error;
    }
  }

  async createExpense(expenseData: ExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await axiosInstance.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Create expense error:', error);
      throw error;
    }
  }

  async updateExpense(id: string, expenseData: ExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await axiosInstance.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      console.error('Update expense error:', error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<ApiResponse> {
    try {
      const response = await axiosInstance.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  }

  async addSpending(id: string, spendingAmount: number): Promise<ApiResponse<Expense>> {
    try {
      const response = await axiosInstance.post(`/expenses/${id}/spending`, { spendingAmount });
      return response.data;
    } catch (error) {
      console.error('Add spending error:', error);
      throw error;
    }
  }

  async getExpenseStats(): Promise<ApiResponse<ExpenseStats>> {
    try {
      const response = await axiosInstance.get('/expenses/stats');
      return response.data;
    } catch (error) {
      console.error('Get expense stats error:', error);
      throw error;
    }
  }
}

export default new ApiService();
