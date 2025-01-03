## 简介

Summa 是一个 Chrome 扩展，它能帮助你快速总结网页文章的核心内容。无论是新闻报道、博客文章、还是学术论文，Summa 都能为你提供准确、简洁的摘要，帮助你在信息爆炸的时代更高效地获取知识。

### 主要特性

- 一键总结：只需点击插件图标，即可获取当前页面的智能摘要
- 精准提取：采用先进的 AI 技术，准确识别文章主旨
- 多种模型：可选择不同的模型进行总结

## 快速开始

### 安装要求

- Chrome 浏览器 88.0 或更高版本
- Node.js 18.0 或更高版本（仅开发时需要）

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

1. 点击浏览器工具栏中的 Summa 图标
2. 等待几秒钟，AI 将自动分析当前页面内容
3. 查看生成的摘要
4. 可以根据需要调整总结 Prompt

## 使用示例

- 示例 1：总结新闻文章
- 示例 2：总结学术论文

## 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与贡献。

## 常见问题解答 (FAQ)

- **如何选择不同的 AI 模型？**
  - 在设置中可以选择不同的模型。

- **总结不准确怎么办？**
  - 请确保网页内容可以被正常加载，并尝试使用不同的模型。

## 技术栈

- React 18
- TypeScript
- TailwindCSS
- Webpack 5
- Chrome Extension Manifest V3

## 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](./LICENSE) 文件了解详情。


---
