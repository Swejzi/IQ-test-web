import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  selectIsAuthenticated, 
  selectUser, 
  selectAuthLoading, 
  selectAuthError,
  validateToken,
  clearError
} from '@/store/slices/authSlice';
import { authService } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !isLoading) {
      dispatch(validateToken());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  useEffect(() => {
    // Start auto-refresh token mechanism
    if (isAuthenticated) {
      authService.startAutoRefresh();
    }
  }, [isAuthenticated]);

  const handleClearError = () => {
    dispatch(clearError());
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    error,
    clearError: handleClearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
