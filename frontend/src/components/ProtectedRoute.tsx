import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectIsAuthenticated, selectUser, selectAuthLoading, validateToken } from '@/store/slices/authSlice';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/' 
}) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isLoading = useAppSelector(selectAuthLoading);

  // Validate token on mount if we have one
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !isAuthenticated && !isLoading) {
      dispatch(validateToken());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  // Show loading spinner while validating token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Ověřuji přihlášení...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check admin requirements
  if (requireAdmin) {
    const isAdmin = user?.email?.includes('admin') || false;
    
    if (!isAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100">
              <svg className="h-6 w-6 text-error-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-neutral-900">
              Přístup odepřen
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Nemáte oprávnění pro přístup k této části aplikace. 
              Kontaktujte administrátora pro získání přístupu.
            </p>
            <div className="mt-6">
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Zpět
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
