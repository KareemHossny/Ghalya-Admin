import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard, { StatIcons } from '../components/StatCard';
import useApi from '../hooks/useApi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const { getStats, getOrders, loading, error } = useApi();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        getStats(),
        getOrders()
      ]);

      setStats(statsData || {
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
      });
      
      setRecentOrders(ordersData ? ordersData.slice(0, 5) : []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRecentOrders([]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'قيد الانتظار' },
      shipped: { color: 'bg-blue-100 text-blue-800', label: 'تم الشحن' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'تم التسليم' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        <span className="mr-3 text-gray-600">جاري تحميل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2 text-lg">نظرة عامة على أداء المتجر</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
            آخر تحديث: {new Date().toLocaleDateString('ar-EG')}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
          <p className="text-yellow-800 font-medium">{error}</p>
          <p className="text-yellow-600 text-sm mt-1">يتم عرض بيانات تجريبية</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          icon={StatIcons.products}
          color="blue"
          trend={{ value: 12, progress: 75 }}
        />
        
        <StatCard
          title="إجمالي الطلبات"
          value={stats.totalOrders}
          icon={StatIcons.orders}
          color="green"
          trend={{ value: 8, progress: 60 }}
        />
        
        <StatCard
          title="طلبات قيد الانتظار"
          value={stats.pendingOrders}
          icon={StatIcons.pending}
          color="yellow"
          trend={{ value: -5, progress: 30 }}
        />
        
        <StatCard
          title="إجمالي الإيرادات"
          value={`${stats.totalRevenue.toLocaleString()} ج.م`}
          icon={StatIcons.revenue}
          color="pink"
          trend={{ value: 15, progress: 85 }}
        />
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">أحدث الطلبات</h2>
              <Link
                to="/orders"
                className="text-pink-600 hover:text-pink-700 font-semibold text-sm flex items-center gap-1 transition-colors"
              >
                عرض الكل
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="overflow-hidden">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-lg">لا توجد طلبات حالياً</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        المبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        الحالة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {order.customerName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customerPhone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {order.totalAmount} ج.م
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
              <StatIcons.products />
            </div>
            <h3 className="text-xl font-bold mb-3">إدارة المنتجات</h3>
            <p className="text-pink-100 mb-5 text-sm leading-relaxed">
              أضف منتجات جديدة أو عدل على المنتجات الحالية
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-5 py-3 bg-white text-pink-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              الذهاب إلى المنتجات
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
              <StatIcons.orders />
            </div>
            <h3 className="text-xl font-bold mb-3">إدارة الطلبات</h3>
            <p className="text-blue-100 mb-5 text-sm leading-relaxed">
              تابع وتعدل على طلبات العملاء
            </p>
            <Link
              to="/orders"
              className="inline-flex items-center px-5 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              الذهاب إلى الطلبات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;