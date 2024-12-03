import React, { useState, useEffect } from "react"
import { createRoot } from 'react-dom/client';
import { LLMProvider, DEFAULT_PROVIDERS } from "../../services/provider"
import { StorageService } from "../../services/storage"
import "../../globals.css"
import { ProviderConfig } from "./modules/ProviderConfig"
import { SystemPrompt } from "./modules/SystemPrompt"
import { MainNav } from "./modules/MainNav"
import { ProviderList } from "./modules/ProviderList"

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
  OPENAI_LIKE: "☁️",
  LMSTUDIO: "🔬",
  OLLAMA: "🐪"
}

// 使用默认提供商列表初始化 PROVIDER_ITEMS
const PROVIDER_ITEMS: ProviderItem[] = DEFAULT_PROVIDERS.map(provider => ({
  ...provider,
  icon: PROVIDER_ICONS[provider.id] || "🔧",
  enable: false,
}))

const Options: React.FC = () => {
  const [providers, setProviders] = useState<ProviderItem[]>(PROVIDER_ITEMS)
  const [activeProvider, setActiveProvider] = useState<LLMProvider>(providers[0])
  const [providerSettings, setProviderSettings] = useState<LLMProvider | null>(null)
  const [activeTab, setActiveTab] = useState<'providers' | 'system-prompt'>('providers')

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
    <div className="flex h-screen bg-[#f5f5f7]">
      <MainNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="z-20"
      />

      {activeTab === 'providers' && (
        <ProviderList
          providers={providers}
          activeProvider={activeProvider}
          onProviderSelect={handleProviderSelect}
          className="z-10"
        />
      )}

      <div className="flex-1 overflow-auto bg-white rounded-tl-2xl shadow-sm">
        {activeTab === 'providers' ? (
          <ProviderConfig
            provider={providerSettings || activeProvider}
            onProviderUpdate={handleProviderUpdate}
          />
        ) : (
          <SystemPrompt />
        )}
      </div>
    </div>
  )
}

const container = document.getElementById('app-container');
const root = createRoot(container!);
root.render(<Options />);