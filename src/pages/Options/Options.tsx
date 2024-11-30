import React from "react"
import { createRoot } from 'react-dom/client';
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Switch } from "../../components/ui/switch"
import { Settings, Plus, Copy, ExternalLink } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import "../../globals.css"

const Options: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 p-4 border-b">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="font-medium">GitHub Models</span>
        </div>
        <nav className="p-2 space-y-1">
          {[
            { name: "零一万物", icon: "🤖" },
            { name: "智谱AI", icon: "🧠" },
            { name: "月之暗面", icon: "🌙", active: true },
            { name: "百川", icon: "🌊" },
            { name: "阿里云百炼", icon: "☁️" },
            { name: "阶跃星辰", icon: "⭐" },
            { name: "豆包", icon: "🫘" },
            { name: "MiniMax", icon: "📊" },
            { name: "GraphRAG", icon: "📈" },
            { name: "OpenRouter", icon: "🔄" },
            { name: "Groq", icon: "⚡" },
            { name: "AiHubMix", icon: "🔄" },
            { name: "Together", icon: "🤝" },
            { name: "Fireworks", icon: "🎆" },
            { name: "360智脑", icon: "🧠" },
            { name: "英伟达", icon: "💻" },
            { name: "Azure OpenAI", icon: "☁️" },
            { name: "腾讯混元", icon: "🌐" },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${item.active
                ? "bg-secondary"
                : "hover:bg-secondary/80"
                }`}
            >
              <span className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </span>
              <span>{item.name}</span>
              {item.name === "OpenRouter" && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  ON
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              月之暗面
              <ExternalLink className="w-4 h-4" />
            </h1>
            <Switch />
          </div>

          {/* API Key Section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-medium">API 密钥</h2>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="API 密钥"
                className="font-mono"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>复制</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button>检查</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              <a href="#" className="text-blue-500 hover:underline">
                点击这里获取密钥
              </a>
            </p>
          </div>

          {/* API Endpoint Section */}
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-medium">API 地址</h2>
            <Input
              type="url"
              defaultValue="https://api.moonshot.cn"
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              https://api.moonshot.cn/v1/chat/completions /结尾忽略v1版本，#结尾则使用输入地址
            </p>
          </div>

          {/* Models Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">模型</h2>
            <div className="space-y-2">
              <div className="text-sm font-medium mb-4">Moonshot V1</div>
              {[
                "Moonshot V1 8k",
                "Moonshot V1 32k",
                "Moonshot V1 128k",
              ].map((model) => (
                <div
                  key={model}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                    {model}
                    <Settings className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <Button variant="ghost" size="icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="1" />
                      <circle cx="12" cy="5" r="1" />
                      <circle cx="12" cy="19" r="1" />
                    </svg>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <span>查看</span>
            <a href="#" className="text-blue-500 hover:underline">
              月之暗面文档
            </a>
            <span>和</span>
            <a href="#" className="text-blue-500 hover:underline">
              模型
            </a>
            <span>获取更多详情</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-2">
            <Button className="gap-2">
              <Settings className="w-4 h-4" />
              管理
            </Button>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              添加
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('app-container');
const root = createRoot(container!);
root.render(<Options />);