import { StorageService } from '../../services/storage';
import { LLMModel } from '../../services/LLM/provider';
import { getModel } from '../../services/LLM/model';
import { generateText } from 'ai';
import { systemPrompt as defaultSystemPrompt } from '../Options/modules/prompt';

// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  // 向当前标签页发送消息
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'clickedSumma'
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }

  if (request.action === 'extractContent') {
    handleExtract(request.data.html)
      .then(content => {
        sendResponse({ data: content });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true; // 表示会异步发送响应
  }

  if (request.action === 'summarize') {
    handleSummarize(request.data.model, request.data.content)
      .then(summary => {
        sendResponse({ data: summary });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true; // 表示会异步发送响应
  }
});

// 处理提取内容消息
async function handleExtract(html: string): Promise<string> {
  // 检查是否已存在 offscreen 文档
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length === 0) {
    // 创建 offscreen 文档
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_PARSER'],
      justification: '需要使用 DOMParser 来解析 HTML'
    });
  }

  // 发送消息到 offscreen 文档进行处理
  const response = await chrome.runtime.sendMessage({
    type: 'OFFSCREEN_EXTRACT_MARKDOWN',
    html
  });

  if (!response.success) {
    throw new Error(response.error);
  }

  return response.markdown;

}

// 处理总结消息
async function handleSummarize(model: LLMModel, content: string) {
  const apiKeys = await StorageService.getUserApiKeys();
  const baseURLs = await StorageService.getUserBaseURLs();
  const llmModel = getModel(model.provider, model.id, apiKeys, baseURLs);

  if (!llmModel) {
    throw new Error('Language model not initialized');
  }

  // 系统提示，如果没有则使用默认提示
  const systemPromptText = await StorageService.getSystemPrompt() || defaultSystemPrompt;
  // 构建 prompt
  const prompt = `以下是需要总结的文章内容：\n\n${content}`;

  const response = await generateText({
    model: llmModel,
    system: systemPromptText,
    prompt: prompt,
  });

  return response.text;
}
