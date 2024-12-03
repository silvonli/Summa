import React from 'react';
import { LLMProvider } from '../../../services/provider';

interface ProviderListProps {
  providers: Array<LLMProvider & { icon: string }>;
  activeProvider: LLMProvider;
  onProviderSelect: (provider: LLMProvider) => void;
}

export const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  activeProvider,
  onProviderSelect,
}) => {
  return (
    <div className="w-64 bg-[#f5f5f7] border-r border-[#e5e5e7]">
      <div className="flex items-center px-6 py-4 border-b border-[#e5e5e7]">
        <span className="text-sm font-medium text-[#86868b]">提供商列表</span>
      </div>
      <nav className="p-3 space-y-1">
        {providers.map((item) => (
          <button
            key={item.id}
            onClick={() => onProviderSelect(item)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] rounded-xl transition-all duration-200
              ${activeProvider.id === item.id
                ? "bg-white text-[#1d1d1f] shadow-sm"
                : "hover:bg-white/40 text-[#86868b]"}`}
          >
            <span className="w-5 h-5 flex items-center justify-center opacity-80">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}; 