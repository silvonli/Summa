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
    <div className="w-56 border-r bg-background">
      <div className="flex items-center gap-2 px-4 py-3 border-b">
        <span className="text-sm font-medium text-foreground/70">提供商列表</span>
      </div>
      <nav className="p-2 space-y-0.5">
        {providers.map((item) => (
          <button
            key={item.id}
            onClick={() => onProviderSelect(item)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] rounded-md transition-colors
              ${activeProvider.id === item.id
                ? "bg-secondary/80 text-foreground"
                : "hover:bg-secondary/40 text-foreground/70"}`}
          >
            <span className="w-4 h-4 flex items-center justify-center opacity-70">
              {item.icon}
            </span>
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}; 