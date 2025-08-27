import axios from 'axios';

// API configuration
const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.0.0.1');
const API_BASE_URL = isProduction 
  ? 'https://c5757bfab4d7.ngrok-free.app/api'  // Your ngrok URL
  : 'http://localhost:5000/api';

// Configure axios defaults
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
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
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async updateProfile(payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    budgetLimit?: number;
    avatarUrl?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(payload),
      });

      const result = await this.handleResponse(response);
      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        this.publishUserUpdate(result.user);
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  async uploadAvatar(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/auth/avatar`, {
        method: 'POST',
        headers: this.getAuthHeadersNoJson(),
        body: formData,
      });

      const result = await this.handleResponse(response);
      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        this.publishUserUpdate(result.user);
      }
      return result;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  }

  private getAuthHeadersNoJson(): HeadersInit {
    const headers: HeadersInit = {};
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private publishUserUpdate(user: any) {
    try {
      if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
        const evt = new CustomEvent('userUpdated', { detail: user });
        window.dispatchEvent(evt);
      }
    } catch {}
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  async login(loginData: LoginData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(loginData),
      });

      const result = await this.handleResponse(response);

      if (result.success && result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        this.publishUserUpdate(result.user);
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(signupData: SignupData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(signupData),
      });

      const result = await this.handleResponse(response);

      // Store token if signup successful
      if (result.success && result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async forgotPassword(forgotPasswordData: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(forgotPasswordData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
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
        ? '?' + new URLSearchParams( //builtin js class converts objects to easy
         // Convert params object into entries   
              Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
              if (v !== undefined && v !== null && v !== '') acc[k] = String(v);
              return acc;
            }, {})
          ).toString()
        : '';// "?category=food&limit=10"


      const response = await fetch(`${API_BASE_URL}/expenses${query}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get expenses error:', error);
      throw error;
    }
  }

  async getExpense(id: string): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get expense error:', error);
      throw error;
    }
  }

  async createExpense(expenseData: ExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(expenseData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create expense error:', error);
      throw error;
    }
  }

  async updateExpense(id: string, expenseData: ExpenseData): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(expenseData),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update expense error:', error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete expense error:', error);
      throw error;
    }
  }

  async addSpending(id: string, spendingAmount: number): Promise<ApiResponse<Expense>> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}/spending`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify({ spendingAmount }),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Add spending error:', error);
      throw error;
    }
  }

  async getExpenseStats(): Promise<ApiResponse<ExpenseStats>> {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/stats`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get expense stats error:', error);
      throw error;
    }
  }
}

export default new ApiService();
