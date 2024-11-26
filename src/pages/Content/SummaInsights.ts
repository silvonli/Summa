import { summaDebugLog } from '../../lib/utils';
import summaTemplate from './summa.html';
import { marked } from 'marked';

const extract_mock = `
Marked - Markdown Parser
========================

[Marked] lets you convert [Markdown] into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo
-------------------

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option above to switch between various views:

- **Preview:**  A live display of the generated HTML as it would render in a browser.
- **HTML Source:**  The generated HTML before your browser makes it pretty.
- **Lexer Data:**  What [marked] uses internally, in case you like gory stuff like this.
- **Quick Reference:**  A brief run-down of how to format things using markdown.
`;

// 进度状态 
enum ProcessStatus {
  EXTRACTING = 0,
  SUMMARIZING = 1,
  PARSING = 2
}

class SummaInsights {
  private hostNode: HTMLDivElement | null;
  private shadowRoot: ShadowRoot | null;
  private isShow: boolean;
  private content: string;
  private summary: string;

  constructor() {
    this.hostNode = null;
    this.shadowRoot = null;
    this.isShow = false;
    this.content = '';
    this.summary = '';
  }

  init(): void {
    // 监听来自 background 的消息
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  private handleMessages(
    request: { action: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ): void {
    summaDebugLog('收到消息', request);
    if (request.action === 'toggleSumma') {
      this.toggle();
    }
  }

  // 更新进度显示
  private updateProcess(newStatus: ProcessStatus): void {
    if (!this.shadowRoot) return;

    const progress = this.shadowRoot.querySelector('.progress');

    if (!progress) return;

    // 定义各状态对应的步骤显示
    const steps = [
      { status: ProcessStatus.EXTRACTING, text: '正在提取内容...' },
      { status: ProcessStatus.SUMMARIZING, text: '正在总结内容...' },
      { status: ProcessStatus.PARSING, text: '正在解析总结文本...' },
    ];

    // 根据当前状态更新UI
    const currentStep = steps.find(step => step.status === newStatus);
    if (!currentStep) return;

    // 更新进度条内容
    const spinnerSvg = `
      <svg class="spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
        <circle class="spinner-head" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    `;

    const checkSvg = `
      <svg class="check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    const getStepHtml = (step: { status: ProcessStatus; text: string }) => {
      const isPending = step.status >= newStatus;
      const icon = isPending ? spinnerSvg : checkSvg;

      return `
        <div class="step">
          <span>
            ${icon}
          </span>
          ${step.text}
        </div>
      `;
    };

    progress.innerHTML = `
      <div class="steps">
        ${steps.map(getStepHtml).join('')}
      </div>
    `;
  }

  // 更新总结显示
  private updateSummary(html: string): void {
    if (!this.shadowRoot) return;

    const markdownBody = this.shadowRoot?.querySelector('.markdown-body');

    if (!markdownBody) return;
    markdownBody.innerHTML = html;
  }

  // 修改 toggle 方法
  private async toggle(): Promise<void> {
    if (!this.hostNode) {
      // 初次打开，先注入
      this.inject();

      // 切换到显示进度
      this.switchProgressAndContentVisibility(true);

      // 提取内容
      this.updateProcess(ProcessStatus.EXTRACTING);
      await this.extractContent();

      // 总结内容
      this.updateProcess(ProcessStatus.SUMMARIZING);
      await this.summarizeContent();

      // 解析总结
      this.updateProcess(ProcessStatus.PARSING);
      const html = await this.parseSummary();

      // 切换到显示内容
      this.switchProgressAndContentVisibility(false);
      // 显示总结
      this.updateSummary(html);

    }

    this.isShow = !this.isShow;
    this.setVisibility(this.isShow);
  }

  private setVisibility(visible: boolean): void {
    this.shadowRoot?.querySelector('.app')?.classList.toggle('hidden', !visible);
  }


  private async extractContent(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.content = extract_mock;
  }

  private async summarizeContent(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const summary = this.content;
    this.summary = summary;
  }

  private async parseSummary(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    marked.use({
      async: false,
      pedantic: false,
      gfm: true,
    });
    const html = marked.parse(this.summary) as string;
    return html;
  }

  private inject(): void {
    try {
      // 创建容器
      this.hostNode = document.createElement('div');

      // 创建 Shadow DOM
      this.shadowRoot = this.hostNode.attachShadow({ mode: 'open' });

      // 拼接样式
      const style = `
      <style>
        @import "${chrome.runtime.getURL('summa.css')}";
        @import "${chrome.runtime.getURL('github-markdown.css')}";
      </style>
      `;

      // 拼接 HTML
      const template = style + summaTemplate;
      summaDebugLog('开始注入：', template);
      this.shadowRoot.innerHTML = template;

      // 添加到页面
      summaDebugLog('开始添加到页面');
      document.body.appendChild(this.hostNode);

      // 绑定事件处理
      this.bindEvents();
    } catch (error) {
      console.error('Failed to inject Summa:', error);
      summaDebugLog('注入失败:', error);
    }
  }

  // 修改 remove 方法
  private remove(): void {
    if (this.hostNode) {
      this.hostNode.remove();
      this.hostNode = null;
      this.shadowRoot = null;
      this.content = '';
      this.summary = '';
    }
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;


  }

  private copyMarkdown(): void {
    if (!this.shadowRoot) return;

    const markdownBody = this.shadowRoot.querySelector('.markdown-body');
    if (!markdownBody) return;

    // 获取总结的 markdown 文本
    const markdownText = this.summary;

    // 复制到剪贴板
    navigator.clipboard.writeText(markdownText)
      .then(() => {
        const copyButton = this.shadowRoot?.querySelector('.copy-button');
        if (copyButton) {
          // 临时改变按钮文字显示复制成功
          const originalText = copyButton.textContent;
          copyButton.textContent = '✅ 已复制';
          setTimeout(() => {
            copyButton.textContent = originalText;
          }, 2000);
        }
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }

  // 切换进度条和内容区域的显示状态
  private switchProgressAndContentVisibility(showProgress: boolean): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelector('.progress')?.classList.toggle('hidden', !showProgress);
    this.shadowRoot.querySelector('.markdown-body')?.classList.toggle('hidden', showProgress);
  }

  // refresh 方法
  private async refresh(): Promise<void> {
    // 切换到显示进度
    this.switchProgressAndContentVisibility(true);

    // 重新总结内容 
    this.updateProcess(ProcessStatus.SUMMARIZING);
    await this.summarizeContent();

    // 解析总结
    this.updateProcess(ProcessStatus.PARSING);
    const html = await this.parseSummary();

    // 切换到显示内容
    this.switchProgressAndContentVisibility(false);
    // 显示总结
    this.updateSummary(html);

  }
}

export default SummaInsights;