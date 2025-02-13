import { summaErrorLog } from '../../../lib/utils';
import { LLMModel } from '../../../services/LLM/provider';

export enum ProcessStatus {
  IDLE = 0,        // 初始状态
  EXTRACTING = 1,  // 正在提取
  SUMMARIZING = 2, // 正在总结
  COMPLETED = 3    // 完成
}

export interface SummaryState {
  llm: LLMModel | null;
  url: string;
  article: string;
  summary: string;
  process: ProcessStatus;
}

// 定义错误消息
const ErrorMessages = {
  NO_LLM: '### 错误\n\n模型未配置',
  EMPTY_ARTICLE: '### 错误\n\n页面正文为空',
  EMPTY_SUMMARY: '### 错误\n\n大语言模型返回的总结为空',
  SUMMARY_ERROR: (error: string) => `### 错误\n\n总结时发生错误: ${error}`
} as const;

export class SummaryModel {
  private readonly state: SummaryState;

  constructor(llm: LLMModel | null, currentUrl: string) {
    this.state = {
      article: '',
      summary: '',
      llm: llm,
      url: currentUrl,
      process: ProcessStatus.IDLE
    };
  }

  public async extractArticle(): Promise<void> {
    if (this.state.process !== ProcessStatus.IDLE) {
      throw new Error('提取过程已经开始');
    }

    this.state.process = ProcessStatus.EXTRACTING;
    try {
      const docHtml = document.documentElement.outerHTML;
      const response = await chrome.runtime.sendMessage({
        action: 'extractArticle',
        data: {
          html: docHtml,
          url: this.state.url
        }
      });

      if (response.error) {
        throw new Error(response.error);
      }

      this.state.article = response.data;
    } catch (error) {
      summaErrorLog('SummaPanel: 提取页面正文时发生错误', error);
      this.state.process = ProcessStatus.IDLE;
      throw error;
    }
  }

  public async summarizeArticle(): Promise<void> {
    if (this.state.process !== ProcessStatus.EXTRACTING) {
      throw new Error('必须先提取文章内容');
    }

    this.state.process = ProcessStatus.SUMMARIZING;

    if (!this.state.llm) {
      this.state.summary = ErrorMessages.NO_LLM;
      this.state.process = ProcessStatus.COMPLETED;
      return;
    }

    if (!this.state.article) {
      this.state.summary = ErrorMessages.EMPTY_ARTICLE;
      this.state.process = ProcessStatus.COMPLETED;
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        data: {
          model: this.state.llm,
          content: this.state.article,
          url: this.state.url
        }
      });

      if (response.error) {
        this.state.summary = ErrorMessages.SUMMARY_ERROR(response.error);
      } else {
        this.state.summary = response.data || ErrorMessages.EMPTY_SUMMARY;
      }
      this.state.process = ProcessStatus.COMPLETED;
    } catch (error) {
      this.state.summary = ErrorMessages.SUMMARY_ERROR(String(error));
      this.state.process = ProcessStatus.COMPLETED;
      throw error;
    }
  }

  public getSummary(): string {
    return this.state.summary;
  }

  public getLLM(): LLMModel | null {
    return this.state.llm;
  }

  public getProcess(): ProcessStatus {
    return this.state.process;
  }

  public isCompleted(): boolean {
    return this.state.process === ProcessStatus.COMPLETED && !!this.state.summary;
  }

  public reset(): void {
    this.state.process = ProcessStatus.IDLE;
    this.state.article = '';
    this.state.summary = '';
  }
} 