import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// إنشاء instance من axios
const api = axios.create({
  baseURL: 'https://ghalya-back-end.vercel.app/api',
});

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      // التحقق من صلاحية التوكن (اختياري - يمكن التحقق من الخادم)
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      console.log('محاولة تسجيل الدخول...');
      
      const response = await api.post('/admin/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        // حفظ التوكن وبيانات المستخدم
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem('adminUser', JSON.stringify(user));
        
        setIsAuthenticated(true);
        setUser(user);
        
        console.log('تم تسجيل الدخول بنجاح');
        return { success: true, redirectTo: '/dashboard' };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'بيانات الدخول غير صحيحة' 
        };
      }
      
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
      
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    // مسح جميع بيانات المصادقة
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
    return '/login';
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    isAuthenticated,
    loading,
    user,
    login,
    logout,
    checkAuth
  };
};

export default useAuth;