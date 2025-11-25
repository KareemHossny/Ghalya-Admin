import React from 'react';

// Icon components as functions
export const StatIcons = {
  products: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  orders: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  revenue: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  pending: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  growth: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
};

const StatCard = ({ title, value, icon, color, trend, description }) => {
  const colorClasses = {
    blue: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-600', 
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      progress: 'bg-blue-500'
    },
    green: { 
      bg: 'bg-green-50', 
      text: 'text-green-600', 
      iconBg: 'bg-gradient-to-br from-green-500 to-green-600',
      progress: 'bg-green-500'
    },
    yellow: { 
      bg: 'bg-yellow-50', 
      text: 'text-yellow-600', 
      iconBg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      progress: 'bg-yellow-500'
    },
    pink: { 
      bg: 'bg-pink-50', 
      text: 'text-pink-600', 
      iconBg: 'bg-gradient-to-br from-pink-500 to-pink-600',
      progress: 'bg-pink-500'
    },
    purple: { 
      bg: 'bg-purple-50', 
      text: 'text-purple-600', 
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      progress: 'bg-purple-500'
    },
    indigo: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      progress: 'bg-indigo-500'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-3 rtl:space-x-reverse">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.value > 0 
                  ? 'bg-green-100 text-green-800' 
                  : trend.value < 0 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '→'} 
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-2">{description}</p>
          )}
        </div>
        
        <div className={`p-3 rounded-2xl ${currentColor.bg}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentColor.iconBg} text-white shadow-lg`}>
            {icon && React.createElement(icon)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {trend && trend.progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>التقدم</span>
            <span>{trend.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${currentColor.progress} transition-all duration-500`}
              style={{ width: `${trend.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;