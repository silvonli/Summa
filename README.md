## 简介

Summa 是一款 Chrome 扩展，利用 AI 对网页内容进行总结。无论是新闻报道、博客文章、还是论坛帖子，只需点击扩展图标，即可获得当前页面核心内容，包括摘要、主要内容和关键结论。Summa旨在帮助用户快速理解网页内容，提高信息获取效率。

### 主要特性

- 精准提取：准确识别网页中的主要内容，并过滤掉不相关的部分，能够处理各种网页结构和布局。
- 适用于任意网站: 包括但不限于 Medium、Reddit、Hacker News、知乎......
- Prompt 可自定义: 内置 prompt 适合总结技术类文章，也支持自定义，以适应不同类型文章。
- 多模型支持：支持OpenAI、Anthropic、openRouter、LMStudio、Ollama 等多个 LLM 服务商。

## 快速开始

### 从 Chrome 商店安装（推荐）

1. 访问 [Chrome 网上应用店](https://chromewebstore.google.com/detail/summa/ifpcledicmpicocmaggfkegiighkdeog)
2. 点击"添加到 Chrome"
3. 按照提示完成安装

### 开发者安装

1. 克隆仓库：
   ```bash
   git clone https://github.com/silvonli/Summa.git
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 打包：
   ```bash
   npm run build
   ```

4. 在 Chrome 中加载插件：
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `build` 文件夹

## 使用指南

1. API Key 配置:右键点击浏览器工具栏中的 Summa 图标，点击“选项”打开配置页面，在配置页面中，选择模型服务商，填写 API Key。
2. 添加模型：在模型服务商配置界面中，点击“添加模型”按钮，输入模型ID和名称进行添加；模型ID请查看模型服务商官网。
3. 开启服务商：在模型服务商配置界面中，打开右上角开关； 
4. 总结：打开页面，点击 Summa 图标，即可获取当前网页的智能总结。
5. 模型建议: Gemini 模型非常适合内容总结，相比 OpenAI 和 Claude 的模型，能够在总结中保留更多细节。


## 技术栈
- 使用 @mozilla/readability 库准确提取正文内容。
- 使用 Turndown 将正文从 HTML 转换为 Markdown 格式，方便 LLM 处理；
- 使用 marked + github-markdown-css 渲染返回的摘要。
- 使用 Shadow DOM + TypeScript + CSS 实现总结面板(Content)；
- 使用 React + Shadcn 实现配置页(Options)；
- 使用 Vercel AI SDK 接入主流 LLM 服务商，包括 OpenAI、Anthropic、 openRouter 等，也支持LMStudio、Ollama 。

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。


---
