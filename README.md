### 简介

Summa 是一款 Chrome 扩展，利用 AI 对网页内容进行总结。无论是博客文章还是论坛帖子，只需点击扩展图标，即可获得当前页面核心内容，包括摘要、主要内容和关键结论。

- 总结微信公众号文章
    
   ![总结微信公众号文章](https://imgur.com/Pq06VTE.png)
    
- 总结 Hacker News 长贴
    
   ![总结 Hacker News 长贴](https://imgur.com/Q4TonC1.png)
    
- 总结 Medium 博客文章
    
   ![总结 Medium 博客文章](https://imgur.com/GeobJZB.png)
    

### 使用说明

1. **适用于任意网站:** 支持 Medium、Reddit、Hacker News、知乎、CSDN 等各类平台，无论是技术博客、论坛讨论还是新闻文章，都可轻松提取并生成摘要。
2. **API Key 配置:** 需自行配置 API Key，支持 OpenRouter、硅基流动、Together AI、OpenAI、Anthropic、DeepSeek 等平台，同时也支持 LMStudio、Ollama 本地模型。
3. **模型建议:** Gemini 模型特别适合用于内容总结，可能是因为上下文窗口更大，Gemini 模型相比 OpenAI 和 Claude 模型，能在总结中保留更多细节。
4. **Prompt 可自定义:** 内置 Prompt 适合总结技术类文章，同时也支持自定义，以适配不同类型的文章。
5. **安装地址:** 访问 [Chrome 应用商店](https://chromewebstore.google.com/detail/summa/ifpcledicmpicocmaggfkegiighkdeog)

### 技术栈

- **网页内容提取:** 使用 mozilla/readability 库准确提取正文内容。
- **格式转换:** 使用 Turndown 将 HTML 内容转换为 Markdown 格式，方便 LLM 处理。
- **摘要渲染:** 使用 marked 和 github-markdown-css 渲染生成的摘要。
- **前端开发:** 使用 Shadow DOM、TypeScript 和 CSS 实现总结面板，使用 React 和 Shadcn 实现配置页。
- **LLM 接入:** 通过 Vercel AI SDK 接入 OpenAI、Anthropic、OpenRouter、LMStudio、Ollama 等多个 LLM 服务商。


### 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。


---
