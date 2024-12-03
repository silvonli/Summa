import React from 'react'
import { LLMProvider, LLMModel } from '../../../services/provider'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { Switch } from '../../../components/ui/switch'
import { AddModelDialog } from './AddModelDialog'

interface ProviderConfigProps {
  provider: LLMProvider
  onProviderUpdate: (provider: LLMProvider) => void
}

export const ProviderConfig: React.FC<ProviderConfigProps> = ({
  provider,
  onProviderUpdate,
}) => {
  const handleConfigChange = (field: keyof LLMProvider, value: string | boolean) => {
    onProviderUpdate({
      ...provider,
      [field]: value
    })
  }

  const handleModelsChange = (models: LLMModel[]) => {
    onProviderUpdate({
      ...provider,
      models
    })
  }

  const handleDeleteModel = (modelId: string) => {
    const updatedModels = provider.models.filter((model) => model.id !== modelId)
    handleModelsChange(updatedModels)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-[#1d1d1f]">{provider.name} 配置</h2>
          <Switch
            checked={provider.enable}
            onCheckedChange={(checked) => handleConfigChange('enable', checked)}
            className="data-[state=checked]:bg-[#0071e3]"
            aria-label={`${provider.name}启用开关`}
          />
        </div>
        <p className="text-sm text-[#86868b]">
          配置 {provider.name} 的连接信息和可用模型
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-[#1d1d1f]">API 密钥</Label>
          <Input
            id="apiKey"
            value={provider.apiKey || ''}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder="输入 API Key"
            className="rounded-xl border-[#e5e5e7] focus:border-[#0071e3] focus:ring-[#0071e3]"
          />
        </div>

        {provider.apiHost !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="apiHost" className="text-[#1d1d1f]">API 地址</Label>
            <Input
              id="apiHost"
              value={provider.apiHost || ''}
              onChange={(e) => handleConfigChange('apiHost', e.target.value)}
              placeholder="输入 API Host"
              className="rounded-xl border-[#e5e5e7] focus:border-[#0071e3] focus:ring-[#0071e3]"
            />
          </div>
        )}

        <div className="space-y-2">
          {provider.models.length > 0 && (
            <Label className="text-[#1d1d1f]">可用模型</Label>
          )}
          <div className="grid gap-2">
            {provider.models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between px-4 py-1 border rounded-lg text-sm text-muted-foreground"
              >
                <span>{model.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteModel(model.id)}
                  aria-label={`删除模型 ${model.name}`}
                >
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

        <div className="mt-6">
          <AddModelDialog
            provider={provider}
            onModelsUpdate={handleModelsChange}
          />
        </div>
      </div>
    </div>
  )
}
