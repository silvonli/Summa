import { summaDebugLog } from '../../lib/utils';
import summaTemplate from './summa.html';
import { marked } from 'marked';
import { icons } from '../../lib/icons';
import { ContentExtractor } from './ContentExtractor';

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
    if (request.action === 'clickedSumma') {
      this.onClickedSumma();
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
      const icon = isPending ? icons.spinner : icons.check;
      const stepClass = isPending ? 'step pending' : 'step';

      return `
        <div class="${stepClass}">
          <span>${icon}</span>
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

    const markdownBody = this.shadowRoot.querySelector('.markdown-body');
    if (!markdownBody) return;

    markdownBody.innerHTML = html;
  }

  // onRefresh 方法
  private async onRefresh(): Promise<void> {
    await this.processContent(false);
  }

  // clickedSumma 方法
  private async onClickedSumma(): Promise<void> {
    // 如果已经显示，直接隐藏
    if (this.isShow) {
      this.hide();
      return;
    }

    // 如果未初始化，进行初始化
    if (!this.hostNode) {
      this.inject();
      await this.processContent(true);
    }

    // 显示内容
    this.show();
  }

  private hide(): void {
    this.isShow = false;
    this.shadowRoot?.querySelector('.app')?.classList.add('hidden');
  }

  private show(): void {
    this.isShow = true;
    this.shadowRoot?.querySelector('.app')?.classList.remove('hidden');
  }

  private async processContent(shouldExtract = false): Promise<void> {
    // 显示进度条
    this.switchProgressAndContentVisibility(true);

    if (shouldExtract) {
      this.updateProcess(ProcessStatus.EXTRACTING);
      await this.extractContent();
    }

    // 总结内容
    this.updateProcess(ProcessStatus.SUMMARIZING);
    await this.summarizeContent();

    // 解析总结
    this.updateProcess(ProcessStatus.PARSING);
    const html = await this.parseSummary();

    // 显示内容
    this.switchProgressAndContentVisibility(false);
    this.updateSummary(html);
  }

  private async extractContent(): Promise<void> {
    try {
      // 获取当前页面的 HTML
      const docClone = document.cloneNode(true) as Document;
      const content = await ContentExtractor.extractFromDom(docClone);
      this.content = content;
    } catch (error) {
      console.error('提取内容失败:', error);
    }
  }

  private async summarizeContent(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const summary = this.content;
    this.summary = summary;
  }

  private async parseSummary(): Promise<string> {
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

      // 初始化图标
      this.initializeIcons();
    } catch (error) {
      console.error('Failed to inject Summa:', error);
      summaDebugLog('注入失败:', error);
    }
  }

  private initializeIcons(): void {
    if (!this.shadowRoot) return;

    // 查找所有带有 data-icon 属性的按钮
    const iconButtons = this.shadowRoot.querySelectorAll('[data-icon]');

    iconButtons.forEach(button => {
      const iconNames = button.getAttribute('data-icon')?.split(',') || [];
      iconNames.forEach(name => {
        const iconHtml = icons[name as keyof typeof icons];
        if (iconHtml) {
          button.innerHTML += iconHtml;
        }
      });
    });
  }

  // remove 方法
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

    // 复制按钮
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    copyBtn?.addEventListener('click', () => this.onCopy());

    // 刷新按钮
    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    refreshBtn?.addEventListener('click', () => this.onRefresh());

    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.hide());

    // 设置按钮 (暂时只打印日志)
    const settingsBtn = this.shadowRoot.querySelector('.settings-btn');
    settingsBtn?.addEventListener('click', () => {
      summaDebugLog('Settings clicked');
    });
  }

  private onCopy(): void {
    if (!this.shadowRoot) return;

    const markdownBody = this.shadowRoot.querySelector('.markdown-body');
    if (!markdownBody) return;

    // 获取总结的 markdown 文本
    const markdownText = this.summary;

    // 复制到剪贴板
    navigator.clipboard.writeText(markdownText)
      .then(() => {
        const copyBtn = this.shadowRoot?.querySelector('.copy-btn');
        if (copyBtn) {
          // 添加复制成功样式
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.classList.remove('copied');
          }, 2000);
        }
      })
      .catch(err => {
        console.error('复制失败:', err);
        summaDebugLog('复制失败:', err);
      });
  }

  // 切换进度条和内容区域的显示状态
  private switchProgressAndContentVisibility(showProgress: boolean): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelector('.progress')?.classList.toggle('hidden', !showProgress);
    this.shadowRoot.querySelector('.markdown-body')?.classList.toggle('hidden', showProgress);
  }
}

export default SummaInsights;