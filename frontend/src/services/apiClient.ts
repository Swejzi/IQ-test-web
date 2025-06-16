import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '@/types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add screen size for behavioral tracking
    if (typeof window !== 'undefined') {
      config.headers['X-Screen-Size'] = `${window.screen.width}x${window.screen.height}`;
      config.headers['X-Timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    }

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      
      // Only redirect if not already on login/home page
      if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        window.location.href = '/';
      }
    }

    if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', error.response.data);
    }

    if (error.response?.status >= 500) {
      // Server error - show generic error message
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// API client wrapper class
export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // Generic GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data.data || response.data;
  }

  // Generic POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  }

  // Generic PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  }

  // Generic PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data.data || response.data;
  }

  // Generic DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data.data || response.data;
  }

  // Upload file
  async upload<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await this.client.post<ApiResponse<T>>(url, formData, config);
    return response.data.data || response.data;
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health');
  }

  // Set auth token
  setAuthToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }

  // Clear auth token
  clearAuthToken(): void {
    delete this.client.defaults.headers.Authorization;
    localStorage.removeItem('token');
  }

  // Get current auth token
  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export axios instance for direct use if needed
export { apiClient as default };
export const axiosInstance = apiClient;
