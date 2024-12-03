import React from 'react';

interface MainNavProps {
  activeTab: 'providers' | 'system-prompt';
  onTabChange: (tab: 'providers' | 'system-prompt') => void;
  className?: string;
}

export const MainNav: React.FC<MainNavProps> = ({ activeTab, onTabChange, className }) => {
  return (
    <div className={`w-52 bg-white shadow-sm ${className}`}>
      <div className="flex items-center p-6">
        <span className="text-xl font-medium text-[#1d1d1f]">设置</span>
      </div>
      <nav className="px-3 py-2 space-y-1">
        <button
          onClick={() => onTabChange('providers')}
          className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-200
            ${activeTab === 'providers'
              ? "bg-[#f5f5f7] text-[#1d1d1f] shadow-sm"
              : "hover:bg-[#f5f5f7]/60 text-[#86868b]"}`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg">⚙️</span>
          <span>模型服务</span>
        </button>
        <button
          onClick={() => onTabChange('system-prompt')}
          className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium rounded-xl transition-all duration-200
            ${activeTab === 'system-prompt'
              ? "bg-[#f5f5f7] text-[#1d1d1f] shadow-sm"
              : "hover:bg-[#f5f5f7]/60 text-[#86868b]"}`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg">📝</span>
          <span>系统提示</span>
        </button>
      </nav>
    </div>
  );
}; 