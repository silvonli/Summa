import { summaDebugLog, summaErrorLog } from '../../../lib/utils';
import { marked } from 'marked';
import { icons } from '../../../lib/icons';
import { LLMModel } from '../../../services/LLM/provider';

// 进度状态 
enum ProcessStatus {
  EXTRACTING = 0,
  SUMMARIZING = 1,
  PARSING = 2
}

export class SummaryRenderer {
  private contentElement: HTMLElement;
  private model: LLMModel | null = null;
  private currentUrl: string;
  private article: string = '';
  private summary: string = '';

  constructor(contentElement: HTMLElement, model: LLMModel | null, currentUrl: string) {
    this.contentElement = contentElement;
    this.model = model;
    this.currentUrl = currentUrl;
    this.initializeContent();
  }

  private initializeContent(): void {
    this.contentElement.innerHTML = `
      <div class="progress">
        <div class="steps"></div>
      </div>
      <div class="markdown-body"></div>
    `;
  }


  // 执行总结流程
  public async executePipeline(): Promise<void> {
    try {
      this.toggleDisplayState(true);

      this.updateProcess(ProcessStatus.EXTRACTING);
      await this.extractArticle();

      this.updateProcess(ProcessStatus.SUMMARIZING);
      await this.summarizeArticle();

      this.updateProcess(ProcessStatus.PARSING);
      const html = await this.parseSummary();

      this.toggleDisplayState(false);
      this.updateSummary(html);

    } catch (error) {
      summaErrorLog('内容生成错误:', error);
    }
  }

  // 提取正文
  private async extractArticle(): Promise<void> {
    try {
      summaDebugLog('SummaPanel: 开始提取页面正文');

      // 发送消息给 background 进行正文提取
      const docHtml = document.documentElement.outerHTML;
      const response = await chrome.runtime.sendMessage({
        action: 'extractArticle',
        data: {
          html: docHtml,
          url: this.currentUrl
        }
      });

      if (response.error) {
        summaDebugLog('SummaPanel: 正文提取失败', { error: response.error });
        return;
      }

      this.article = response.data;

    } catch (error) {
      summaErrorLog('SummaPanel: 提取页面正文时发生错误', error);
    }
  }

  // 总结正文
  private async summarizeArticle(): Promise<void> {
    if (!this.model) {
      this.summary = '### 错误\n\n模型未配置';
      return;
    }

    if (!this.article) {
      this.summary = '### 错误\n\n无法提取页面正文';
      return;
    }

    try {
      this.summary = '';
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        data: {
          model: this.model,
          content: this.article,
          url: this.currentUrl
        }
      });

      if (response.error) {
        this.summary = `### 错误\n\n总结时发生错误: ${response.error}`;
      } else {
        this.summary = response.data || '### 错误\n\大语言模型返回的总结为空';
      }
    } catch (error) {
      summaErrorLog('总结时发生错误:', error);
      this.summary = `### 错误\n\n总结时发生错误: ${error as Error}`;
    }
  }

  // 解析总结
  private async parseSummary(): Promise<string> {
    if (!this.summary) {
      return '';
    }

    marked.use({
      async: false,
      pedantic: false,
      gfm: true,
    });

    const html = marked.parse(this.summary) as string;
    return html;
  }

  // 更新总结显示
  private updateSummary(html: string): void {
    const markdownBody = this.contentElement.querySelector('.markdown-body');
    if (!markdownBody) return;

    markdownBody.innerHTML = html;
  }

  // 更新进度显示
  private updateProcess(newStatus: ProcessStatus): void {
    const progress = this.contentElement.querySelector('.progress');
    if (!progress) return;

    const steps = [
      {
        status: ProcessStatus.EXTRACTING,
        pending: newStatus < ProcessStatus.EXTRACTING ? '等待提取正文...' :
          newStatus === ProcessStatus.EXTRACTING ? '正在提取正文...' :
            '完成正文提取.',
      },
      {
        status: ProcessStatus.SUMMARIZING,
        pending: newStatus < ProcessStatus.SUMMARIZING ? '等待总结...' :
          newStatus === ProcessStatus.SUMMARIZING ? '正在总结...' :
            '完成总结.',
      },
      {
        status: ProcessStatus.PARSING,
        pending: newStatus < ProcessStatus.PARSING ? '等待解析...' :
          newStatus === ProcessStatus.PARSING ? '正在解析...' :
            '完成解析.',
      },
    ];

    const getStepHtml = (step: {
      status: ProcessStatus;
      pending: string;
    }) => {
      const isPending = step.status >= newStatus;
      const icon = isPending ? icons.spinner : icons.check;
      const stepClass = isPending ? 'step pending' : 'step';
      const text = step.pending;

      return `
          <div class="${stepClass}">
            <span>${icon}</span>
            ${text}
          </div>
        `;
    };

    progress.innerHTML = `
        <div class="steps">
          ${steps.map(getStepHtml).join('')}
        </div>
      `;
  }

  private toggleDisplayState(showProgress: boolean): void {
    this.contentElement.querySelector('.progress')?.classList.toggle('content-hidden', !showProgress);
    this.contentElement.querySelector('.markdown-body')?.classList.toggle('content-hidden', showProgress);
  }

  public getSummary(): string {
    return this.summary;
  }

} 