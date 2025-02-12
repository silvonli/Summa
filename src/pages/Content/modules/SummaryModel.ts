import { summaDebugLog, summaErrorLog } from '../../../lib/utils';
import { marked } from 'marked';
import { LLMModel } from '../../../services/LLM/provider';
import { SummaryState } from './types';

export class SummaryModel {
  private state: SummaryState;

  constructor(model: LLMModel | null, currentUrl: string) {
    this.state = {
      article: '',
      summary: '',
      model,
      currentUrl
    };
  }

  async extractArticle(): Promise<void> {
    try {
      summaDebugLog('SummaPanel: 开始提取页面正文');
      const docHtml = document.documentElement.outerHTML;
      const response = await chrome.runtime.sendMessage({
        action: 'extractArticle',
        data: {
          html: docHtml,
          url: this.state.currentUrl
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.state.article = response.data;
    } catch (error) {
      summaErrorLog('SummaPanel: 提取页面正文时发生错误', error);
      throw error;
    }
  }

  async summarizeArticle(): Promise<void> {
    if (!this.state.model) {
      this.state.summary = '### 错误\n\n模型未配置';
      return;
    }

    if (!this.state.article) {
      this.state.summary = '### 错误\n\n无法提取页面正文';
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        data: {
          model: this.state.model,
          content: this.state.article,
          url: this.state.currentUrl
        }
      });

      if (response.error) {
        this.state.summary = `### 错误\n\n总结时发生错误: ${response.error}`;
      } else {
        this.state.summary = response.data || '### 错误\n\大语言模型返回的总结为空';
      }
    } catch (error) {
      this.state.summary = `### 错误\n\n总结时发生错误: ${error as Error}`;
      throw error;
    }
  }

  async parseSummary(): Promise<string> {
    if (!this.state.summary) {
      return '';
    }

    marked.use({
      async: false,
      pedantic: false,
      gfm: true,
    });

    return marked.parse(this.state.summary) as string;
  }

  getSummary(): string {
    return this.state.summary;
  }
} 