import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    const redirectPath = logout();
    navigate(redirectPath, { replace: true });
  };

  const menuItems = [
    {
      path: '/dashboard',
      label: 'لوحة التحكم',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      path: '/products',
      label: 'إدارة المنتجات',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      path: '/orders',
      label: 'إدارة الطلبات',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      path: '/messages',
      label: 'إدارة الرسائل',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    }
  ];

  // دالة لمعالجة أخطاء الصور
  const handleImageError = () => {
    setLogoError(true);
  };

  // تنسيق الوقت بشكل أفضل
  const formatLoginTime = (loginTime) => {
    if (!loginTime) return 'الآن';
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'منذ أقل من ساعة';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      return loginDate.toLocaleString('ar-EG');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 right-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl 
        border-l border-gray-200/60 transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-white/80">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                {!logoError ? (
                  <img 
                    src="/photo_2025-11-24_21-16-32.jpg" 
                    alt="لوجو نظام غاليه"
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-white text-lg">غ</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                غاليه
              </h1>
              <p className="text-xs text-gray-500 mt-1">نظام الإدارة</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6">
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">القائمة الرئيسية</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-xl transition-all duration-200 group
                      ${location.pathname === item.path
                        ? 'bg-gradient-to-l from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25'
                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 hover:shadow-md'
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <div className={`
                      ${location.pathname === item.path 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-pink-500'
                      } transition-colors
                    `}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {location.pathname === item.path && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full ml-auto rtl:mr-auto"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200/60 bg-white/80">
          <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/80 rounded-2xl border border-gray-200/60">
            <p className="text-sm font-semibold text-gray-800">{user?.username || 'المسئول'}</p>
            <p className="text-xs text-gray-500 mt-1">
              آخر دخول: {formatLoginTime(user?.loginTime)}
            </p>
            <p className="text-xs text-green-600 mt-1 font-medium">
              ✓ متصل بالنظام
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 rtl:space-x-reverse w-full p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group border border-gray-200 hover:border-red-200"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className={`
          bg-white/80 backdrop-blur-xl border-b border-gray-200/60 z-30 sticky top-0
          transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-gray-200/20' : 'shadow-sm'}
        `}>
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100/80 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {menuItems.find(item => item.path === location.pathname)?.label || 'لوحة التحكم'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">مرحباً بعودتك، {user?.username || 'المسئول'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>متصل</span>
              </div>

              {/* User Avatar with Logo */}
              <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-100/80 transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  {!logoError ? (
                    <img 
                      src="/photo_2025-11-24_21-16-32.jpg" 
                      alt={user?.username || 'المسئول'}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                      <span className="font-semibold text-white text-sm">
                        {(user?.username || 'م').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="font-semibold text-gray-800 text-sm">{user?.username || 'المسئول'}</p>
                  <p className="text-xs text-gray-500">مسئول النظام</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;