import React, { useState, useEffect } from "react"
import { createRoot } from 'react-dom/client';
import { LLMProvider, DEFAULT_PROVIDERS } from "../../types/provider"
import { StorageService } from "../../services/storage"
import "../../globals.css"
import { ProviderConfig } from "./modules/ProviderConfig"

// 使用 LLMProvider 类型并扩展它
type ProviderItem = LLMProvider & {
  icon: string
}

// 定义图标映射
const PROVIDER_ICONS: Record<string, string> = {
  ANTHROPIC: "🎯",
  OPENAI: "🧠",
  GOOGLE: "🌐",
  GROQ: "⚡",
  OPENROUTER: "🔧",
  DEEPSEEK: "🔍",
  MISTRAL: "🌟",
  OPENAI_LIKE: "🤖",
  AZURE_OPENAI: "☁️",
  LMSTUDIO: "🔬",
  OLLAMA: "🐪"
}

// 使用默认提供商列表初始化 PROVIDER_ITEMS
const PROVIDER_ITEMS: ProviderItem[] = DEFAULT_PROVIDERS.map(provider => ({
  ...provider,
  icon: PROVIDER_ICONS[provider.id] || "🔧", // 使用默认图标作为后备
  enable: false,
}))


const Options: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>(PROVIDER_ITEMS)
  const [activeProvider, setActiveProvider] = useState<LLMProvider>(providers[0])
  const [providerSettings, setProviderSettings] = useState<LLMProvider | null>(null)

  // 初始化时加载保存的数据
  useEffect(() => {
    const loadProviderSettings = async () => {
      const savedData = await StorageService.getProvider(activeProvider.id);
      setProviderSettings(savedData);
    };
    loadProviderSettings();
  }, [activeProvider.id]);

  const handleProviderSelect = async (provider: LLMProvider) => {
    setActiveProvider(provider);
    const savedData = await StorageService.getProvider(provider.id);
    setProviderSettings(savedData);
  };

  const handleProviderUpdate = async (updatedProvider: LLMProvider) => {
    await StorageService.saveProvider(updatedProvider);
    setProviderSettings(updatedProvider);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 p-4 border-b">
          <span className="text-base font-medium">模型服务提供商</span>
        </div>
        <nav className="p-2 space-y-1">
          {providers.map((item) => (
            <button
              key={item.id}
              onClick={() => handleProviderSelect(item)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${activeProvider.id === item.id ? "bg-secondary" : "hover:bg-secondary/80"
                }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <ProviderConfig
          provider={providerSettings || activeProvider}
          onProviderUpdate={handleProviderUpdate}
        />
      </div>
    </div>
  )
}

const container = document.getElementById('app-container');
const root = createRoot(container!);
root.render(<Options />);