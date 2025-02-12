import { icons } from '../../../lib/icons';

export enum ProcessStatus {
  EXTRACTING = 0,
  SUMMARIZING = 1,
  PARSING = 2
}

export interface Step {
  status: ProcessStatus;
  pending: string;
}

export class SummaryView {
  private contentElement: HTMLElement;

  constructor(contentElement: HTMLElement) {
    this.contentElement = contentElement;
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

  updateProcess(newStatus: ProcessStatus): void {
    const progress = this.contentElement.querySelector('.progress');
    if (!progress) return;

    const steps: Step[] = [
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

    progress.innerHTML = `
      <div class="steps">
        ${steps.map(step => this.getStepHtml(step, newStatus)).join('')}
      </div>
    `;
  }

  private getStepHtml(step: Step, currentStatus: ProcessStatus): string {
    const isPending = step.status >= currentStatus;
    const icon = isPending ? icons.spinner : icons.check;
    const stepClass = isPending ? 'step pending' : 'step';

    return `
      <div class="${stepClass}">
        <span>${icon}</span>
        ${step.pending}
      </div>
    `;
  }

  updateSummary(html: string): void {
    const markdownBody = this.contentElement.querySelector('.markdown-body');
    if (!markdownBody) return;
    markdownBody.innerHTML = html;
  }

  toggleDisplayState(showProgress: boolean): void {
    this.contentElement.querySelector('.progress')?.classList.toggle('content-hidden', !showProgress);
    this.contentElement.querySelector('.markdown-body')?.classList.toggle('content-hidden', showProgress);
  }
} 