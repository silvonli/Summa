## 简介

Summa 是一个 Chrome 扩展，提供网页内容 AI 总结功能。无论是新闻报道、博客文章、还是论坛帖子，只需点击扩展图标，即可获得当前内容的摘要、主要观点和关键结论。Summa专注于帮助用户快速理解网页内容，提高信息获取效率。

### 主要特性

- 精准提取：准确识别网页中的主要内容，并过滤掉不相关的部分，能够处理各种网页结构和布局;
- 一键总结：只需点击插件图标，即可获取当前网页的智能总结;
- 自定义 Prompt：可以根据需要调整总结 Prompt;
- 多模型支持：支持多种 LLM 模型;

## 快速开始

### 从 Chrome 商店安装（推荐）

1. 访问 [Chrome 网上应用店]()
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

3. 启动开发服务器：
   ```bash
   npm start
   ```

4. 在 Chrome 中加载插件：
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目中的 `build` 文件夹

## 使用指南

1. 右击浏览器工具栏中的 Summa 图标，点击“选项”打开设置页面；
2. 在设置页面中，选择模型服务商，配置 API Key，并打开右上角开关；
3. 点击“添加模型”按钮，输入模型ID和名称，模型ID请查看模型服务商官网；
4. 返回浏览页面，点击 Summa 图标，即可获取当前网页的智能总结；


## 技术栈
- 使用 @mozilla/readability 库提取网页正文内容；
- 使用 Turndown 将正文从 HTML 转换为 Markdown 格式，以便于 LLM 处理；
- 使用 marked + github-markdown-css 渲染返回的摘要。
- 使用 Shadow DOM + TypeScript + CSS 实现总结面板(Content)；
- 使用 React + Shadcn 实现配置页(Options)；
- 使用 Vercel AI SDK 接入主流 LLM 服务商，包括 OpenAI、Anthropic、 openRouter 等，也支持LMStudio、Ollama 。

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。


---
