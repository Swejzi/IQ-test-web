import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from '@/store';
import { AuthProvider } from '@/hooks/useAuth';
import { WebSocketProvider } from '@/hooks/useWebSocket';

// Layout components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import HomePage from '@/pages/HomePage';
import TestPage from '@/pages/TestPage';
import ResultsPage from '@/pages/ResultsPage';
import HistoryPage from '@/pages/HistoryPage';
import AboutPage from '@/pages/AboutPage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Styles
import './index.css';

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <div className="App min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
              <Layout>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/test/:sessionId" element={<TestPage />} />
                  <Route path="/results/:sessionId" element={<ResultsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  
                  {/* Protected routes */}
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <HistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Layout>
              
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
