import { summaDebugLog } from '../../lib/utils';
import { getModel } from '../../services/model';
import { LLMModel } from '../../services/provider';
import { StorageService } from '../../services/storage';
import { generateText } from 'ai';
import { systemPrompt as defaultSystemPrompt } from './prompt';

// 监听插件图标点击事件
chrome.action.onClicked.addListener((tab: chrome.tabs.Tab) => {
  // 向当前标签页发送消息
  if (tab.id) {
    summaDebugLog('发送 clickedSumma 消息到标签页:', tab.id);
    chrome.tabs.sendMessage(tab.id, {
      action: 'clickedSumma'
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
  }

  if (request.action === 'summarize') {
    handleSummarize(request.data.model, request.data.content)
      .then(sendResponse)
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true; // 表示会异步发送响应
  }
});

// 处理总结请求
async function handleSummarize(model: LLMModel, content: string) {
  // 构建 prompt
  const prompt = `以下是需要总结的文章内容：\n\n${content}`;

  const apiKeys = await StorageService.getUserApiKeys();
  const baseURLs = await StorageService.getUserBaseURLs();
  const llmModel = getModel(model.provider, model.id, apiKeys, baseURLs);

  if (!llmModel) {
    throw new Error('Language model not initialized');
  }

  // 获取存储的系统提示，如果没有则使用默认提示
  const systemPromptText = await StorageService.getSystemPrompt() || defaultSystemPrompt;

  const data = await generateText({
    model: llmModel,
    system: systemPromptText,
    prompt: prompt,
  });

  return { data: data };
}
