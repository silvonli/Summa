import React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { Label } from "../../../components/ui/label"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Plus } from "lucide-react"
import { LLMProvider, LLMModel } from '../../../types/provider'

interface AddModelDialogProps {
  provider: LLMProvider
  onModelsUpdate: (models: LLMModel[]) => void
}

export const AddModelDialog: React.FC<AddModelDialogProps> = ({
  provider,
  onModelsUpdate,
}) => {
  const [open, setOpen] = useState(false)
  const [modelId, setModelId] = useState("")
  const [modelName, setModelName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证模型ID是否已存在
    if (provider.models.some(model => model.id === modelId)) {
      alert("模型ID已存在")
      return
    }

    // 创建新模型对象
    const newModel: LLMModel = {
      id: modelId,
      name: modelName || modelId, // 如果没有输入名称，使用ID作为名称
      provider: provider.id,
    }

    // 更新模型列表
    const updatedModels = [...provider.models, newModel]
    onModelsUpdate(updatedModels)

    // 重置表单并关闭对话框
    setModelId("")
    setModelName("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          添加模型
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加模型</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="modelId">
              模型 ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="modelId"
              placeholder="必填 例如 gpt-3.5-turbo"
              value={modelId}
              onChange={(e) => setModelId(e.target.value.trim())}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelName">模型名称</Label>
            <Input
              id="modelName"
              placeholder="例如 GPT-3.5"
              value={modelName}
              onChange={(e) => setModelName(e.target.value.trim())}
            />
          </div>
          <Button type="submit" className="w-full">
            添加模型
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
