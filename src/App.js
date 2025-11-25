import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import axios from 'axios';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsManagement from './pages/ProductsManagement';
import OrdersManagement from './pages/OrdersManagement';
import MessagesManagement from './pages/MessagesManagement';
import Layout from './components/Layout';
import useAuth from './hooks/useAuth';

// إعداد axios للتحقق من المصادقة تلقائياً
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // إذا كان الخطأ غير مصرح به، مسح التوكن وإعادة التوجيه لل login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// مكون للحماية
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// مكون Login مع useNavigate داخله
const LoginWithNavigate = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login navigate={navigate} />;
};

// مكون Layout مع useNavigate داخله
const LayoutWithNavigate = ({ children }) => {
  const navigate = useNavigate();
  return <Layout navigate={navigate}>{children}</Layout>;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        richColors
        closeButton
        dir="rtl"
      />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/login"
            element={<LoginWithNavigate />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LayoutWithNavigate>
                  <Dashboard />
                </LayoutWithNavigate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <LayoutWithNavigate>
                  <ProductsManagement />
                </LayoutWithNavigate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <LayoutWithNavigate>
                  <OrdersManagement />
                </LayoutWithNavigate>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <LayoutWithNavigate>
                  <MessagesManagement />
                </LayoutWithNavigate>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;