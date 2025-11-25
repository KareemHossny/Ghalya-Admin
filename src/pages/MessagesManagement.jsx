import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { toast } from 'sonner';

const MessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { 
    getMessages, 
    getMessage, 
    updateMessageStatus, 
    deleteMessage, 
    getMessagesStats,
    loading 
  } = useApi();

  // التحقق من التوكن قبل التحميل
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      window.location.href = '/login';
      return;
    }
    fetchInitialData();
  }, []);

  // جلب البيانات عند تغيير الفلاتر
  useEffect(() => {
    if (!initialLoading) {
      fetchMessages();
    }
  }, [filters]);

  const fetchInitialData = async () => {
    await Promise.all([fetchMessages(), fetchStats()]);
    setInitialLoading(false);
  };

  const fetchMessages = async () => {
    try {
      console.log('🟡 جاري جلب الرسائل مع الفلاتر:', filters);
      const response = await getMessages(filters);
      console.log('🟢 الرد من السيرفر:', response);
      
      if (response && response.success !== false) {
        setMessages(response.messages || []);
        setPagination({
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || 1,
          total: response.total || 0
        });
      } else {
        toast.error(response?.message || 'فشل في جلب الرسائل');
        setMessages([]);
      }
    } catch (error) {
      console.error('🔴 Error fetching messages:', error);
      toast.error(error.message || 'فشل في جلب الرسائل');
      setMessages([]);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getMessagesStats();
      console.log('📊 إحصائيات الرسائل:', statsData);
      
      if (statsData && statsData.success !== false) {
        // استخدام stats.stats إذا كانت موجودة، وإلا استخدام statsData مباشرة
        setStats(statsData.stats || statsData);
      } else {
        toast.error('فشل في جلب الإحصائيات');
        setStats({});
      }
    } catch (error) {
      console.error('🔴 Error fetching stats:', error);
      toast.error('فشل في جلب الإحصائيات');
      setStats({});
    }
  };

  const handleStatusUpdate = async (messageId, newStatus) => {
    try {
      await updateMessageStatus(messageId, newStatus);
      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId ? { ...msg, status: newStatus } : msg
        )
      );
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus }));
      }
      
      toast.success('تم تحديث حالة الرسالة');
      fetchStats(); // تحديث الإحصائيات
    } catch (error) {
      toast.error(error.message || 'فشل في تحديث حالة الرسالة');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    
    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null);
      }
      
      toast.success('تم حذف الرسالة بنجاح');
      fetchStats(); // تحديث الإحصائيات
      
      // إذا كانت الصفحة الحالية فارغة، الرجوع للصفحة السابقة
      if (messages.length === 1 && filters.page > 1) {
        setFilters(prev => ({ ...prev, page: prev.page - 1 }));
      }
    } catch (error) {
      toast.error(error.message || 'فشل في حذف الرسالة');
    }
  };

  const handleViewMessage = async (messageId) => {
    try {
      const message = await getMessage(messageId);
      if (message && message.success !== false) {
        setSelectedMessage(message.message || message);
      } else {
        toast.error('فشل في تحميل الرسالة');
      }
    } catch (error) {
      toast.error(error.message || 'فشل في تحميل الرسالة');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'جديدة', icon: '🆕' },
      read: { color: 'bg-gray-100 text-gray-800', label: 'مقروءة', icon: '👁️' }
    };
    
    const { color, label, icon } = config[status] || config.new;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${color}`}>
        {icon} {label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // إعادة تحميل البيانات
  const handleRefresh = () => {
    setInitialLoading(true);
    fetchInitialData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة رسائل التواصل</h1>
          <p className="text-gray-600 mt-2 text-lg">عرض وإدارة رسائل العملاء</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || initialLoading}
          className="mt-4 sm:mt-0 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          تحديث البيانات
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">إجمالي الرسائل</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMessages || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-lg">📨</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">رسائل جديدة</p>
              <p className="text-2xl font-bold text-blue-600">{stats.newMessages || 0}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-lg">🆕</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">مقروءة</p>
              <p className="text-2xl font-bold text-gray-600">{stats.readMessages || 0}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-600 text-lg">👁️</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">آخر 7 أيام</p>
              <p className="text-2xl font-bold text-purple-600">{stats.recentMessages || 0}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 text-lg">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-4 items-center">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">جميع الرسائل</option>
            <option value="new">جديدة فقط</option>
            <option value="read">مقروءة</option>
          </select>

          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="10">10 لكل صفحة</option>
            <option value="25">25 لكل صفحة</option>
            <option value="50">50 لكل صفحة</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={loading || initialLoading}
            className="px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {initialLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <span className="mr-3 text-gray-600">جاري تحميل الرسائل...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد رسائل</h3>
            <p className="text-gray-500">لم يتم استقبال أي رسائل حتى الآن</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
            >
              إعادة تحميل
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    المرسل
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    الموضوع
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {message.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 direction-ltr text-left">
                        {message.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                        {message.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(message.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewMessage(message._id)}
                          className="text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                          عرض
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message._id)}
                          className="text-red-600 hover:text-red-700 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                عرض {messages.length} من {pagination.total} رسالة
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-3 py-1 bg-pink-600 text-white rounded-lg">
                  {filters.page}
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page >= pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">تفاصيل الرسالة</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(selectedMessage.status)}
                    <span className="text-pink-100 text-sm">
                      {formatDate(selectedMessage.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Sender Information */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات المرسل</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">الاسم</label>
                    <p className="text-gray-900 font-bold text-lg">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-500 mb-1">البريد الإلكتروني</label>
                    <p className="text-gray-900 font-bold text-lg direction-ltr text-left">{selectedMessage.email}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">الموضوع</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-900 font-bold text-lg">{selectedMessage.subject}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">محتوى الرسالة</h3>
                <div className="bg-gray-50 p-4 rounded-xl min-h-[100px]">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <select
                  value={selectedMessage.status}
                  onChange={(e) => handleStatusUpdate(selectedMessage._id, e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="new">جديدة</option>
                  <option value="read">مقروءة</option>
                </select>

                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  حذف الرسالة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesManagement;