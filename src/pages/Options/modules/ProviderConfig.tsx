import React, { useState, useEffect } from 'react'
import { LLMProvider } from '../../../types/provider'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Switch } from '../../../components/ui/switch'
import { AddModelDialog } from './AddModelDialog'

interface ProviderConfigProps {
  provider: LLMProvider
  onUpdate: (provider: LLMProvider) => void
}

export const ProviderConfig: React.FC<ProviderConfigProps> = ({
  provider,
  onUpdate,
}) => {
  const [config, setConfig] = useState<LLMProvider>(provider)

  // 当provider改变时更新本地状态
  useEffect(() => {
    setConfig(provider)
  }, [provider])

  const handleInputChange = (field: keyof LLMProvider, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    onUpdate(config)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{config.name} 配置</h2>
          <Switch />
        </div>
        <p className="text-sm text-muted-foreground">
          配置 {config.name} 的连接信息和可用模型
        </p>

      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API 密钥</Label>
          <Input
            id="apiKey"
            value={config.apiKey || ''}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="输入 API Key"
          />
        </div>

        {config.apiHost !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="apiHost">API 地址</Label>
            <Input
              id="apiHost"
              value={config.apiHost || ''}
              onChange={(e) => handleInputChange('apiHost', e.target.value)}
              placeholder="输入 API Host"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>可用模型</Label>
          <div className="grid gap-2">
            {config.models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <span>{model.name}</span>
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

        {/* <Button onClick={handleSave} className="mt-4">
          保存配置
        </Button> */}

        <div className="mt-4 flex gap-2">
          <AddModelDialog />
        </div>

      </div>
    </div>
  )
}
