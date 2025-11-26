import { useState, useCallback } from 'react';
import axios from 'axios';

// إنشاء instance من axios موجه للباك إند
const api = axios.create({
  baseURL: 'https://ghalya-back-end.vercel.app/api',
  timeout: 45000, // زيادة المهلة إلى 45 ثانية
  maxContentLength: 10 * 1024 * 1024, // 10MB
  maxBodyLength: 10 * 1024 * 1024, // 10MB
});

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // إعداد المصادقة
  const setupAuth = (config = {}) => {
    const token = localStorage.getItem('adminToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...config.headers
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return {
      ...config,
      headers
    };
  };

  // دالة API عامة
  const callApi = useCallback(async (apiCall, successMessage = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'حدث خطأ في الخادم');
      }
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return response.data;
    } catch (err) {
      console.error('🔴 API Error:', err.message);
      console.error('🔴 Error Response:', err.response?.data);
      
      let errorMessage = 'حدث خطأ في الاتصال بالسيرفر';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'انتهت مهلة الطلب. تحقق من اتصال الإنترنت.';
      } else if (err.message.includes('Network Error')) {
        errorMessage = 'فشل في الاتصال بالخادم. تحقق من اتصال الإنترنت.';
      } else if (err.response?.status === 413) {
        errorMessage = 'حجم الصورة كبير جداً. يرجى اختيار صورة أصغر.';
      } else if (err.response?.status === 401) {
        errorMessage = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.';
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
      
      setError(errorMessage);
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // دوال API محددة
  const getProducts = useCallback(() => 
    callApi(() => api.get('/admin/products', setupAuth())), [callApi]);

  const createProduct = useCallback((productData) => 
    callApi(() => api.post('/admin/products', productData, setupAuth()), 'تم إضافة المنتج بنجاح'), [callApi]);

  const updateProduct = useCallback((id, productData) => 
    callApi(() => api.put(`/admin/products/${id}`, productData, setupAuth()), 'تم تحديث المنتج بنجاح'), [callApi]);

  const deleteProduct = useCallback((id) => 
    callApi(() => api.delete(`/admin/products/${id}`, setupAuth()), 'تم حذف المنتج بنجاح'), [callApi]);

  const getOrders = useCallback(() => 
    callApi(() => api.get('/admin/orders', setupAuth())), [callApi]);

  const updateOrderStatus = useCallback((id, status) => 
    callApi(() => api.patch(`/admin/orders/${id}`, { status }, setupAuth()), 'تم تحديث حالة الطلب بنجاح'), [callApi]);

  const getStats = useCallback(() => 
    callApi(() => api.get('/admin/stats', setupAuth())), [callApi]);

  // دوال الرسائل
  const getMessages = useCallback((params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    
    const url = `/contact?${queryParams.toString()}`;
    return callApi(() => api.get(url, setupAuth()));
  }, [callApi]);

  const getMessage = useCallback((id) => {
    return callApi(() => api.get(`/contact/${id}`, setupAuth()));
  }, [callApi]);

  const updateMessageStatus = useCallback((id, status) => {
    return callApi(() => api.patch(`/contact/${id}`, { status }, setupAuth()), 'تم تحديث حالة الرسالة بنجاح');
  }, [callApi]);

  const deleteMessage = useCallback((id) => {
    return callApi(() => api.delete(`/contact/${id}`, setupAuth()), 'تم حذف الرسالة بنجاح');
  }, [callApi]);

  const getMessagesStats = useCallback(() => {
    return callApi(() => api.get('/contact/stats/messages', setupAuth()));
  }, [callApi]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderStatus,
    getStats,
    callApi,
    getMessages,
    getMessage,
    updateMessageStatus,
    deleteMessage,
    getMessagesStats,
  };
};

export default useApi;