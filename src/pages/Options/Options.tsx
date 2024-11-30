import React, { useState } from "react"
import { createRoot } from 'react-dom/client';
import { LLMProvider, DEFAULT_PROVIDERS } from "../../types/provider"
import "../../globals.css"
import { ProviderConfig } from "./modules/ProviderConfig"

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