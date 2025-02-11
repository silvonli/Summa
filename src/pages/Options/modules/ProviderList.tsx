import React from 'react';
import { LLMProvider } from '../../../services/LLM/provider';


// 定义图标
const PROVIDER_ICONS: Record<string, string> = {
  ANTHROPIC: "🎯",
  OPENAI: "🧠",
  GOOGLE: "🌐",
  GROQ: "⚡",
  OPENROUTER: "🔧",
  DEEPSEEK: "🔍",
  MISTRAL: "🌟",
  OPENAI_LIKE: "☁️",
  LMSTUDIO: "🔬",
  OLLAMA: "🐪",
  SILLICONFLOW: "🌊",
  BAILIAN: "💫",
  TOGETHER: "🤝",
  HYPERBOLIC: "🔮",
}

interface ProviderListProps {
  providers: Array<LLMProvider>;
  activeProvider: LLMProvider;
  onProviderSelect: (provider: LLMProvider) => void;
  className?: string;
}

export const ProviderList: React.FC<ProviderListProps> = ({
  providers,
  activeProvider,
  onProviderSelect,
  className
}) => {
  return (
    <div className={`w-64 bg-[#f5f5f7] border-r border-[#e5e5e7] ${className}`}>
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
                : "hover:bg-white/60 text-[#86868b]"}`}
          >
            <span className="w-5 h-5 flex items-center justify-center opacity-80">
              {PROVIDER_ICONS[item.id] || "🔧"}
            </span>
            <span className="flex-1 text-left">{item.name}</span>
            {item.enable && (
              <span className="px-2 py-0.5 text-[11px] bg-[#0a84ff]/10 text-[#0a84ff] rounded-full">
                已启用
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}; 