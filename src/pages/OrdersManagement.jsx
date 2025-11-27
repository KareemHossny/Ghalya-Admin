import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { toast } from 'sonner';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { getOrders, updateOrderStatus, loading: apiLoading, error } = useApi();

  // بيانات المحافظات
  const governorates = {
    '1': 'القاهرة', '2': 'الجيزة', '3': 'الإسكندرية', '4': 'الدقهلية',
    '5': 'البحر الأحمر', '6': 'البحيرة', '7': 'الفيوم', '8': 'الغربية',
    '9': 'الإسماعيلية', '10': 'المنوفية', '11': 'المنيا', '12': 'القليوبية',
    '13': 'الوادي الجديد', '14': 'السويس', '15': 'أسوان', '16': 'أسيوط',
    '17': 'بني سويف', '18': 'بورسعيد', '19': 'دمياط', '20': 'الشرقية',
    '21': 'جنوب سيناء', '22': 'كفر الشيخ', '23': 'مطروح', '24': 'الأقصر',
    '25': 'قنا', '26': 'شمال سيناء', '27': 'سوهاج'
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersData = await getOrders();
      console.log('📦 Orders data:', ordersData); // للتصحيح
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('حدث خطأ في تحميل الطلبات');
    }
  };

  const updateOrderStatusHandler = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      // تحديث القائمة بعد التعديل
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`تم تحديث حالة الطلب إلى ${getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('حدث خطأ في تحديث حالة الطلب');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      shipped: 'تم الشحن', 
      delivered: 'تم التسليم'
    };
    return labels[status] || 'قيد الانتظار';
  };

  const getGovernorateName = (governorateId) => {
    return governorates[governorateId] || 'غير محدد';
  };

  // دالة محسنة للحصول على المقاس من بيانات الطلب
  const getItemSize = (item) => {
    console.log('🔍 Checking item for size:', item);
    
    // تحقق من وجود selectedSize مباشرة في item (الحقل الجديد)
    if (item.selectedSize) {
      console.log('✅ Found selectedSize:', item.selectedSize);
      return item.selectedSize;
    }
    
    // إذا لم يكن هناك مقاس محدد
    console.log('❌ No size found');
    return 'غير محدد';
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    const subtotal = order.totalAmount - order.shippingCost;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 sm:p-6 text-white rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold truncate">تفاصيل الطلب #{order._id.slice(-8)}</h2>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm ${
                    order.status === 'delivered' ? 'text-green-100' : 
                    order.status === 'pending' ? 'text-yellow-100' : 'text-blue-100'
                  }`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <span className="text-pink-100 text-xs sm:text-sm">
                    {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 sm:p-2 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0 ml-2"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-gradient-to-l from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-pink-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                معلومات العميل
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">الاسم</label>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{order.customerName}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">الهاتف</label>
                  <p className="text-gray-900 font-bold text-sm sm:text-base direction-ltr text-left">{order.customerPhone}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">المحافظة</label>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{getGovernorateName(order.governorate)}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">العنوان</label>
                  <p className="text-gray-900 font-bold text-sm sm:text-base">{order.customerAddress}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-200">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                المنتجات
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                  {order.items?.length || 0} منتج
                </span>
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          المنتج
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          المقاس المختار
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          السعر
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          الكمية
                        </th>
                        <th className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          الإجمالي
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => {
                        const itemSize = getItemSize(item);
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <div className="flex items-center">
                                <img
                                  src={item.product?.image || '/placeholder-image.jpg'}
                                  alt={item.product?.name || 'منتج'}
                                  className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg ml-2 sm:ml-3 border border-gray-200 flex-shrink-0"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMTggMTZMMjAgMTRMMTQgOEwxMiAxMEwyMCAxOEwyMiAxNkwyMCAxNEwyMiAxMkwyMCAxMEwxOCAxMkwyMCAxNEwxOCAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                  }}
                                />
                                <div className="text-right min-w-0 flex-1">
                                  <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                    {item.product?.name || 'منتج غير معروف'}
                                  </div>
                                  {item.product?.description && (
                                    <div className="text-xs text-gray-500 truncate mt-1">
                                      {item.product.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                itemSize !== 'غير محدد' 
                                  ? 'bg-pink-100 text-pink-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {itemSize}
                              </span>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-gray-900 whitespace-nowrap">
                              {item.product?.price || 0} ج.م
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3">
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-xs font-bold">
                                {item.quantity || 0}
                              </span>
                            </td>
                            <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-green-600 whitespace-nowrap">
                              {((item.product?.price || 0) * (item.quantity || 0)).toFixed(2)} ج.م
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gradient-to-l from-pink-50 to-purple-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-pink-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                ملخص الطلب
              </h3>
              <div className="space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-semibold">المجموع:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-bold">{subtotal.toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-semibold">مصاريف الشحن:</span>
                  <span className="text-xs sm:text-sm text-gray-900 font-bold">{order.shippingCost || 0} ج.م</span>
                </div>
                <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-gray-200">
                  <span className="text-sm sm:text-lg font-bold text-gray-800">الإجمالي:</span>
                  <span className="text-base sm:text-xl font-bold text-pink-600">{order.totalAmount?.toFixed(2) || 0} ج.م</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {order.notes && (
              <div className="bg-yellow-50 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-yellow-200">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  ملاحظات إضافية
                </h3>
                <div className="bg-white p-3 rounded-xl border border-yellow-200">
                  <p className="text-gray-700 text-xs sm:text-sm">{order.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (apiLoading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="mr-3 text-gray-600">جاري تحميل الطلبات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2 text-base sm:text-lg">عرض وإدارة جميع طلبات العملاء</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={fetchOrders}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-4">
          <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
        </div>
      )}

      {/* Orders Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تم الشحن</p>
                <p className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'shipped').length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تم التسليم</p>
                <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {orders.length === 0 && !apiLoading ? (
          <div className="text-center py-12 sm:py-16">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500 text-sm sm:text-base">لم يتم تقديم أي طلبات حتى الآن</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الطلب
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    المحافظة
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    المبلغ
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[80px] sm:max-w-none">
                        #{order._id.slice(-6)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items?.length || 0} منتج
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[100px] sm:max-w-none">
                          {order.customerName}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">
                          {order.customerPhone}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[80px] sm:max-w-none">
                      {getGovernorateName(order.governorate)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-bold text-gray-900">
                      {order.totalAmount?.toFixed(2) || 0} ج.م
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatusHandler(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className={`text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 border-0 focus:ring-2 focus:ring-pink-500 transition-colors w-full max-w-[120px] sm:max-w-none ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          } ${updatingOrder === order._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
                        >
                          <option value="pending">قيد الانتظار</option>
                          <option value="shipped">تم الشحن</option>
                          <option value="delivered">تم التسليم</option>
                        </select>
                        {updatingOrder === order._id && (
                          <div className="inline-block mr-1 sm:mr-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {new Date(order.orderDate).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-semibold">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-pink-600 hover:text-pink-700 ml-2 sm:ml-4 transition-colors text-xs sm:text-sm"
                      >
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrdersManagement;