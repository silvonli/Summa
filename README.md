### 简介

Summa 是一款 Chrome 扩展，利用 AI 对网页内容进行总结。无论是博客文章还是论坛帖子，只需点击扩展图标，即可获得当前页面核心内容，包括摘要、主要内容和关键结论。

- 总结微信公众号文章
    
   ![总结微信公众号文章](https://imgur.com/Pq06VTE.png)
    
- 总结 Hacker News 长贴
    
   ![总结 Hacker News 长贴](https://imgur.com/Q4TonC1.png)
    
- 总结 Medium 博客文章
    
   ![总结 Medium 博客文章](https://imgur.com/GeobJZB.png)
    

### 使用说明

1. **适用于任意网站:** 包括但不限于 Medium、Reddit、Hacker News、知乎、CSDN……
2. **API Key 配置:** 需要自行配置 API key。我使用的是 openRouter 提供的 API，该平台目前支持免费使用 gemini-2.0-flash 模型。
3. **模型建议:** Gemini 模型非常适合内容总结，可能是因为上下文窗口更大，Gemini 模型相比 OpenAI 和 Claude 的模型，能够在总结中保留更多细节。
4. **Prompt 可自定义:** 内置 prompt 适合总结技术类文章，也支持自定义，以适应不同类型文章。
5. **安装地址:** 访问 [Chrome 应用商店](https://chromewebstore.google.com/detail/summa/ifpcledicmpicocmaggfkegiighkdeog)

### 技术栈

- **网页内容提取:** 使用 mozilla/readability 库准确提取正文内容。
- **格式转换:** 使用 Turndown 将 HTML 内容转换为 Markdown 格式，方便 LLM 处理。
- **摘要渲染:** 使用 marked 和 github-markdown-css 渲染生成的摘要。
- **前端开发:** 使用 Shadow DOM、TypeScript 和 CSS 实现总结面板，使用 React 和 Shadcn 实现配置页。
- **LLM 接入:** 通过 Vercel AI SDK 接入 OpenAI、Anthropic、openRouter、LMStudio、Ollama 等多个 LLM 服务商。


### 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。


---
