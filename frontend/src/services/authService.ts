import { apiClient } from './apiClient';
import { User, LoginCredentials, RegisterData, AnonymousUserData } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user: User;
}

export class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }

  // Register user
  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', userData);
  }

  // Create anonymous session
  async createAnonymousSession(userData: AnonymousUserData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/anonymous', userData);
  }

  // Validate token
  async validateToken(): Promise<TokenValidationResponse> {
    return apiClient.get<TokenValidationResponse>('/auth/validate');
  }

  // Refresh token
  async refreshToken(): Promise<{ token: string; message: string }> {
    return apiClient.post<{ token: string; message: string }>('/auth/refresh');
  }

  // Logout (client-side only)
  logout(): void {
    apiClient.clearAuthToken();
    // Clear any other stored user data
    localStorage.removeItem('user');
    localStorage.removeItem('lastTestSession');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = apiClient.getAuthToken();
    return !!token;
  }

  // Get current user from token (client-side decode)
  getCurrentUser(): User | null {
    try {
      const token = apiClient.getAuthToken();
      if (!token) return null;

      // Simple JWT decode (for client-side use only)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.logout();
        return null;
      }

      return {
        id: payload.userId,
        email: payload.email,
        username: payload.username,
        createdAt: new Date().toISOString(), // Placeholder
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
      return null;
    }
  }

  // Auto-refresh token before expiration
  async autoRefreshToken(): Promise<void> {
    try {
      const token = apiClient.getAuthToken();
      if (!token) return;

      // Decode token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      // Refresh if token expires in less than 5 minutes
      if (timeUntilExpiration < 5 * 60 * 1000) {
        const response = await this.refreshToken();
        apiClient.setAuthToken(response.token);
      }
    } catch (error) {
      console.error('Auto refresh token failed:', error);
      this.logout();
    }
  }

  // Start auto-refresh interval
  startAutoRefresh(): void {
    // Check every minute
    setInterval(() => {
      this.autoRefreshToken();
    }, 60 * 1000);
  }
}

// Create and export singleton instance
export const authService = new AuthService();
export default authService;
