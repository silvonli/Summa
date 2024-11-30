
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


// 添加模型表单组件
export const AddModelDialog: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [modelId, setModelId] = useState("")
  const [modelName, setModelName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 处理模型添加逻辑
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          添加
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
              onChange={(e) => setModelId(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelName">模型名称</Label>
            <Input
              id="modelName"
              placeholder="例如 GPT-3.5"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
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
