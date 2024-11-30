import React from "react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Switch } from "../../../components/ui/switch"
import { AddModelDialog } from "./AddModelDialog"
import { LLMProvider } from "../../../types/provider"

// 在 PROVIDER_ITEMS 定义后添加这个辅助函数
const getProviderConfigSections = (providerId: string) => {
  return {
    showApiKey: !["LMSTUDIO", "OLLAMA"].includes(providerId),
    showEndpoint: ["OPENAI_LIKE", "LMSTUDIO", "OLLAMA"].includes(providerId)
  }
}

// 创建通用的服务配置组件
export const ProviderConfig: React.FC<{ provider: LLMProvider }> = ({ provider }) => {
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
