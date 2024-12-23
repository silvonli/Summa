import { summaDebugLog } from '../../lib/utils';

export class ContentExtractor {
  private static async createOffscreenDocument() {
    // 检查是否已存在 offscreen 文档
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
      return;
    }

    // 创建 offscreen 文档
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['DOM_PARSER'],
      justification: '需要使用 DOMParser 来解析 HTML'
    });
  }

  private static async closeOffscreenDocument() {
    await chrome.offscreen.closeDocument();
  }

  public static async extract(html: string): Promise<string> {
    summaDebugLog('ContentExtractor: 开始提取内容', { htmlLength: html.length });
    try {
      // 确保 offscreen 文档已创建
      await this.createOffscreenDocument();

      // 发送消息到 offscreen 文档进行处理
      const response = await chrome.runtime.sendMessage({
        type: 'EXTRACT_CONTENT',
        html
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      return response.markdown;
    } catch (error) {
      summaDebugLog('ContentExtractor: 处理过程中出错', error);
      throw error;
    }
  }
} 