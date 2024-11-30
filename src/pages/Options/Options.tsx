import React, { useState } from "react"
import { createRoot } from 'react-dom/client';
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { AddModelDialog } from "./modules/AddModelDialog"
import { LLMProvider, DEFAULT_PROVIDERS } from "../../types/provider"
import "../../globals.css"


// 使用 LLMProvider 类型并扩展它
type ProviderItem = LLMProvider & {
  icon: string
  active?: boolean
  baseUrl?: boolean
}

// 定义图标映射
const PROVIDER_ICONS: Record<string, string> = {
  ANTHROPIC: "🎯",
  OPENAI: "🧠",
  GOOGLE: "🌐",
  GROQ: "⚡",
  HUGGINGFACE: "🤗",
  OPENROUTER: "✨",
  DEEPSEEK: "🔍",
  MISTRAL: "🌟",
  OPENAI_LIKE: "🤖",
  AZURE: "☁️",
  LMSTUDIO: "🔬",
  OLLAMA: "🐪"
}

// 使用 PROVIDERS_LIST 初始化 PROVIDER_ITEMS
const PROVIDER_ITEMS: ProviderItem[] = DEFAULT_PROVIDERS.map(provider => ({
  ...provider,
  icon: PROVIDER_ICONS[provider.id] || "🔧", // 使用默认图标作为后备
  baseUrl: ["LMSTUDIO", "OLLAMA", "OPENAI_LIKE"].includes(provider.id),
  active: false
}))

// 在 PROVIDER_ITEMS 定义后添加这个辅助函数
const getProviderConfigSections = (providerId: string) => {
  return {
    showApiKey: !["LMSTUDIO", "OLLAMA"].includes(providerId),
    showEndpoint: ["OPENAI_LIKE", "LMSTUDIO", "OLLAMA"].includes(providerId)
  }
}

// 创建通用的服务配置组件
const ProviderConfig: React.FC<{ provider: LLMProvider }> = ({ provider }) => {
  const { showApiKey, showEndpoint } = getProviderConfigSections(provider.id)

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          {provider.name}
        </h1>
        <Switch />
      </div>

      {/* API Key Section */}
      {showApiKey && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-medium">API 密钥</h2>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="API 密钥"
              className="font-mono"
            />

          </div>
        </div>
      )}

      {/* API Endpoint Section */}
      {showEndpoint && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-medium">API 地址</h2>
          <Input
            type="url"
            defaultValue={provider.apiHost}
            className="font-mono"
          />
        </div>
      )}

      {/* Models Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">模型</h2>
        <div className="space-y-2">

          {provider.models.map((model) => (
            <div
              key={model.id}
              className="flex items-center justify-between p-2 rounded-lg border bg-card text-card-foreground"
            >
              <div className="flex items-center gap-2 text-sm">
                {model.name}
              </div>
              <Button variant="ghost" size="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="12" x2="20" y2="12" />
                </svg>
              </Button>
            </div>
          ))}
        </div>
      </div>


      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        <AddModelDialog />
      </div>
    </div>
  )
}


const Options: React.FC = () => {
  // 添加状态管理当前选中的服务
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>(DEFAULT_PROVIDERS[0])

  const handleProviderSelect = (provider: LLMProvider) => {
    setSelectedProvider(provider)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 p-4 border-b">
          <span className="text-base font-medium">模型服务提供商</span>
        </div>
        <nav className="p-2 space-y-1">
          {PROVIDER_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleProviderSelect(item)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${selectedProvider.id === item.id ? "bg-secondary" : "hover:bg-secondary/80"
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
        <ProviderConfig provider={selectedProvider} />
      </div>
    </div>
  )
}

const container = document.getElementById('app-container');
const root = createRoot(container!);
root.render(<Options />);