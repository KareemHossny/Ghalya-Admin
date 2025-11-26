import { useState, useCallback } from 'react';
import axios from 'axios';

// إنشاء instance من axios موجه للباك إند
const api = axios.create({
  baseURL: 'https://ghalya-back-end.vercel.app/api',
  timeout: 10000
});

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // إعداد المصادقة مع دعم FormData
  const setupAuth = (config = {}, isFormData = false) => {
    const token = localStorage.getItem('adminToken');
    
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
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
      
      // تحقق من وجود success في الرد
      if (response.data && response.data.success === false) {
        throw new Error(response.data.message || 'حدث خطأ في الخادم');
      }
      
      if (successMessage) {
        console.log(successMessage);
      }
      
      return response.data;
    } catch (err) {
      console.error('API Error Details:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'حدث خطأ غير متوقع';
      setError(errorMessage);
      
      // إذا كان الخطأ غير مصرح به، مسح التوكن وإعادة التوجيه
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuth');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // دوال API محددة
  const getProducts = useCallback(() => 
    callApi(() => api.get('/admin/products', setupAuth())), [callApi]);

  // تعديل createProduct لدعم FormData
  const createProduct = useCallback((productData) => {
    const isFormData = productData instanceof FormData;
    return callApi(() => api.post('/admin/products', productData, setupAuth({}, isFormData)), 'تم إضافة المنتج بنجاح');
  }, [callApi]);

  // تعديل updateProduct لدعم FormData
  const updateProduct = useCallback((id, productData) => {
    const isFormData = productData instanceof FormData;
    return callApi(() => api.put(`/admin/products/${id}`, productData, setupAuth({}, isFormData)), 'تم تحديث المنتج بنجاح');
  }, [callApi]);

  const deleteProduct = useCallback((id) => 
    callApi(() => api.delete(`/admin/products/${id}`, setupAuth()), 'تم حذف المنتج بنجاح'), [callApi]);

  const getOrders = useCallback(() => 
    callApi(() => api.get('/admin/orders', setupAuth())), [callApi]);

  const updateOrderStatus = useCallback((id, status) => 
    callApi(() => api.patch(`/admin/orders/${id}`, { status }, setupAuth()), 'تم تحديث حالة الطلب بنجاح'), [callApi]);

  const getStats = useCallback(() => 
    callApi(() => api.get('/admin/stats', setupAuth())), [callApi]);

  // دوال الرسائل - محدثة بشكل كامل
  const getMessages = useCallback((params = {}) => {
    console.log('🟡 جاري جلب الرسائل بالمعاملات:', params);
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    
    const url = `/contact?${queryParams.toString()}`;
    console.log('🟢 URL النهائي:', url);
    
    return callApi(() => api.get(url, setupAuth()));
  }, [callApi]);

  const getMessage = useCallback((id) => {
    console.log('جاري جلب الرسالة:', id);
    return callApi(() => api.get(`/contact/${id}`, setupAuth()));
  }, [callApi]);

  const updateMessageStatus = useCallback((id, status) => {
    console.log('تحديث حالة الرسالة:', id, status);
    return callApi(() => api.patch(`/contact/${id}`, { status }, setupAuth()), 'تم تحديث حالة الرسالة بنجاح');
  }, [callApi]);

  const deleteMessage = useCallback((id) => {
    console.log('حذف الرسالة:', id);
    return callApi(() => api.delete(`/contact/${id}`, setupAuth()), 'تم حذف الرسالة بنجاح');
  }, [callApi]);

  const getMessagesStats = useCallback(() => {
    console.log('جاري جلب إحصائيات الرسائل');
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