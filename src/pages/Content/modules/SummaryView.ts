import { icons } from '../../../lib/icons';
import { marked } from 'marked';
import { ProcessStatus } from './SummaryModel';


interface Step {
  status: ProcessStatus;
  message: string;
  inProgressMessage: string;
  completedMessage: string;
}

// 定义步骤
const SUMMARY_STEPS: Step[] = [
  {
    status: ProcessStatus.EXTRACTING,
    message: '等待提取正文...',
    inProgressMessage: '正在提取正文...',
    completedMessage: '完成正文提取',
  },
  {
    status: ProcessStatus.SUMMARIZING,
    message: '等待总结...',
    inProgressMessage: '正在总结...',
    completedMessage: '完成总结',
  },
] as const;

// marked 配置
const MARKED_CONFIG = {
  async: false,
  pedantic: false,
  gfm: true,
} as const;

export class SummaryView {
  private contentElement: HTMLElement;
  private progressElement: HTMLElement | null = null;
  private markdownElement: HTMLElement | null = null;

  constructor(contentElement: HTMLElement) {
    this.contentElement = contentElement;
    this.initContentLayout()
    this.progressElement = this.contentElement.querySelector('.progress');
    this.markdownElement = this.contentElement.querySelector('.markdown-body');
  }

  public showProgress(status: ProcessStatus): void {
    this.setContentVisibility(true);
    this.updateProgress(status);
  }

  public async showSummary(summary: string): Promise<void> {
    this.setContentVisibility(false);
    await this.updateSummary(summary);
  }

  public updateProgress(newStatus: ProcessStatus): void {
    if (!this.progressElement) return;

    this.progressElement.innerHTML = `
      <div class="steps">
        ${SUMMARY_STEPS.map(step => this.getStepHtml(step, newStatus)).join('')}
      </div>
    `;
  }

  public async updateSummary(summary: string): Promise<void> {
    if (!this.markdownElement) return;

    try {
      const html = await this.parseSummary(summary);
      this.markdownElement.innerHTML = html;
    } catch (error) {
      this.markdownElement.innerHTML = '错误：内容解析失败';
    }
  }

  private getStepHtml(step: Step, currentStatus: ProcessStatus): string {
    const isPending = step.status >= currentStatus;
    const message = this.getStepMessage(step, currentStatus);

    return `
      <div class="step ${isPending ? 'pending' : ''}" role="status">
        <span aria-hidden="true">${isPending ? icons.spinner : icons.check}</span>
        ${message}
      </div>
    `;
  }

  private getStepMessage(step: Step, currentStatus: ProcessStatus): string {
    if (currentStatus < step.status) return step.message;
    if (currentStatus === step.status) return step.inProgressMessage;
    return step.completedMessage;
  }

  private async parseSummary(summary: string): Promise<string> {
    if (!summary) return '';

    marked.use(MARKED_CONFIG);
    return marked.parse(summary) as string;
  }

  private initContentLayout(): void {
    this.contentElement.innerHTML = `
      <div class="progress">
        <div class="steps"></div>
      </div>
      <div class="markdown-body"></div>
    `;
  }

  private setContentVisibility(showProgress: boolean): void {
    this.progressElement?.classList.toggle('content-hidden', !showProgress);
    this.markdownElement?.classList.toggle('content-hidden', showProgress);
  }
} 