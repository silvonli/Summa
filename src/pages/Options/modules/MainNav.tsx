import React from 'react';

interface MainNavProps {
  activeTab: 'providers' | 'system-prompt';
  onTabChange: (tab: 'providers' | 'system-prompt') => void;
}

export const MainNav: React.FC<MainNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-48 border-r bg-secondary/10">
      <div className="flex items-center gap-2 p-4 border-b bg-background">
        <span className="text-lg font-semibold">设置</span>
      </div>
      <nav className="p-2 space-y-1">
        <button
          onClick={() => onTabChange('providers')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
            ${activeTab === 'providers'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary/80 text-foreground/80"}`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg">⚙️</span>
          <span>模型服务</span>
        </button>
        <button
          onClick={() => onTabChange('system-prompt')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
            ${activeTab === 'system-prompt'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-secondary/80 text-foreground/80"}`}
        >
          <span className="w-5 h-5 flex items-center justify-center text-lg">📝</span>
          <span>系统提示</span>
        </button>
      </nav>
    </div>
  );
}; 