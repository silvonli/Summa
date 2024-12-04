import React, { useState, useEffect } from "react"
import { createRoot } from 'react-dom/client';
import { LLMProvider, DEFAULT_PROVIDERS } from "../../services/provider"
import { StorageService } from "../../services/storage"
import "../../globals.css"
import { ProviderConfig } from "./modules/ProviderConfig"
import { SystemPrompt } from "./modules/SystemPrompt"
import { MainNav } from "./modules/MainNav"
import { ProviderList } from "./modules/ProviderList"

const Options: React.FC = () => {
  const [providers, setProviders] = useState<LLMProvider[]>([])
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(null)
  const [activeTab, setActiveTab] = useState<'providers' | 'system-prompt'>('providers')

  // 初始化提供商列表
  useEffect(() => {
    // 加载保存的数据
    const initializeProviderSettings = async () => {
      const storedProviderSettings = await StorageService.getProviders();
      // 合并 storedProviderSettings 和 DEFAULT_PROVIDERS
      const combinedProviderSettings = DEFAULT_PROVIDERS.map(defaultProvider => ({
        ...defaultProvider,
        ...storedProviderSettings[defaultProvider.id]
      }));
      setProviders(combinedProviderSettings);
      setActiveProvider(combinedProviderSettings[0]);
    };
    initializeProviderSettings();
  }, [])


  const handleProviderSelect = async (provider: LLMProvider) => {
    setActiveProvider(provider);
  };

  const handleProviderUpdate = async (updatedProvider: LLMProvider) => {
    setActiveProvider(updatedProvider);
    setProviders(prevProviders =>
      prevProviders.map(provider =>
        provider.id === updatedProvider.id ? updatedProvider : provider
      )
    );
    await StorageService.saveProvider(updatedProvider);
  };

  if (!activeProvider) {
    return null; // 或者返回一个加载状态的组件
  }

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
            provider={activeProvider}
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