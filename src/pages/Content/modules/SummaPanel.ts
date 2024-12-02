import { summaDebugLog } from '../../../lib/utils';
import htmlTemplate from './SummaPanel.html';
import { marked } from 'marked';
import { icons } from '../../../lib/icons';
import { ContentExtractor } from '../utils/ContentExtractor';
import { LLMModel } from '../../../services/provider';
import { ModelMenu } from './ModelMenu';
import { StorageService } from '../../../services/storage';
// 进度状态 
enum ProcessStatus {
  EXTRACTING = 0,
  SUMMARIZING = 1,
  PARSING = 2
}

class SummaPanel {
  private hostNode: HTMLDivElement | null;
  private shadowRoot: ShadowRoot | null;
  private isShow: boolean;
  private content: string;
  private summary: string;
  private currentUrl: string;
  private mouseEventHandler: ((event: MouseEvent) => void) | null;
  private currentModel: LLMModel | null = null;
  private modelList: LLMModel[] = [];
  private currentMenu: ModelMenu | null = null;

  constructor() {
    this.hostNode = null;
    this.shadowRoot = null;
    this.isShow = false;
    this.content = '';
    this.summary = '';
    this.currentUrl = '';
    this.mouseEventHandler = null;
  }

  async init(): Promise<void> {
    // 预先加载模型列表
    this.modelList = await StorageService.getModelList();

    // 初始化当前模型
    await this.initializeCurrentModel();

    // 监听来自 background 的消息
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  // 初始化当前模型
  private async initializeCurrentModel(): Promise<void> {
    // 如果模型列表为空则直接返回
    if (this.modelList.length === 0) return;

    const savedModel = await StorageService.getCurrentModel();
    // 如果没有保存的模型,使用第一个模型
    if (!savedModel) {
      this.currentModel = this.modelList[0];
      StorageService.saveCurrentModel(this.currentModel);
      return;
    }

    // 检查保存的模型是否在当前列表中
    const modelExists = this.modelList.some(model =>
      model.id === savedModel.id &&
      model.provider === savedModel.provider
    );

    if (modelExists) {
      this.currentModel = savedModel;
    } else {
      this.currentModel = this.modelList[0];
      StorageService.saveCurrentModel(this.currentModel);
    }
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

    const steps = [
      {
        status: ProcessStatus.EXTRACTING,
        pending: '正在提取内容...',
        completed: '内容提取完成'
      },
      {
        status: ProcessStatus.SUMMARIZING,
        pending: '正在总结内容...',
        completed: '内容总结完成'
      },
      {
        status: ProcessStatus.PARSING,
        pending: '正在解析总结文本...',
        completed: '解析完成'
      },
    ];

    const getStepHtml = (step: {
      status: ProcessStatus;
      pending: string;
      completed: string;
    }) => {
      const isPending = step.status >= newStatus;
      const icon = isPending ? icons.spinner : icons.check;
      const stepClass = isPending ? 'step pending' : 'step';
      const text = isPending ? step.pending : step.completed;

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

  // 更新总结显示
  private updateSummary(html: string): void {
    if (!this.shadowRoot) return;

    const markdownBody = this.shadowRoot.querySelector('.markdown-body');
    if (!markdownBody) return;

    markdownBody.innerHTML = html;
  }

  // clickedSumma 方法
  private async onClickedSumma(): Promise<void> {
    // 如果已经显示,直接隐藏
    if (this.isShow) {
      this.hide();
      return;
    }

    const newUrl = window.location.href;

    // 如果未初始化或 URL 发生变化,需要重新注入
    if (!this.hostNode || this.currentUrl !== newUrl) {
      // 如果存在旧的节点,先移除
      if (this.hostNode) {
        this.remove();
      }

      this.currentUrl = newUrl;
      this.inject();
      await this.processContent(true);
    }

    this.show();
  }

  // 隐藏界面
  private hide(): void {
    this.isShow = false;
    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector('.panel')?.classList.add('hidden');
    });

    // 移除事件监听
    if (this.mouseEventHandler) {
      document.removeEventListener('mousedown', this.mouseEventHandler);
      this.mouseEventHandler = null;
    }
  }

  // 显示界面
  private show(): void {
    this.isShow = true;

    requestAnimationFrame(() => {
      this.shadowRoot?.querySelector('.panel')?.classList.remove('hidden');
    });

    // 添加统一的鼠标事件监听
    this.mouseEventHandler = this.handleMouseEvent.bind(this);
    document.addEventListener('mousedown', this.mouseEventHandler);
  }

  // 处理内容
  private async processContent(shouldExtract = false): Promise<void> {
    // 显示进度条
    this.switchContentVisibility(true);

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
    this.switchContentVisibility(false);
    this.updateSummary(html);
  }

  // 提取内容
  private async extractContent(): Promise<void> {
    try {
      // 获取当前页面的 HTML
      const docClone = document.cloneNode(true) as Document;
      const content = await ContentExtractor.extractFromDom(docClone);
      this.content = content;
    } catch (error) {
      summaDebugLog('提取页面内容时发生错误:', error);
    }
  }

  // 总结内容
  private async summarizeContent(): Promise<void> {
    if (!this.currentModel) {
      this.summary = '### 错误\n\n模型未配置';
      return;
    }

    if (!this.content) {
      this.summary = '### 错误\n\n无法提取页面内容';
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'summarize',
        data: {
          model: this.currentModel,
          content: this.content,
          url: this.currentUrl
        }
      });

      if (response.error) {
        this.summary = `### 错误\n\n总结时发生错误: ${response.error}`;
      } else {
        this.summary = response.data.text || '### 错误\n\大语言模型返回的总结为空';
      }
    } catch (error) {
      summaDebugLog('总结时发生错误:', error as Error);
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

  // 注入页面
  private inject(): void {
    try {
      this.hostNode = document.createElement('div');
      this.shadowRoot = this.hostNode.attachShadow({ mode: 'open' });

      // 创建独立的 style 元素
      const styleSheet = document.createElement('link');
      styleSheet.rel = 'stylesheet';
      styleSheet.href = chrome.runtime.getURL('content.styles.css');

      // 先添加样式表
      this.shadowRoot.appendChild(styleSheet);

      // 再添加 HTML 内容
      this.shadowRoot.innerHTML += htmlTemplate;

      document.body.appendChild(this.hostNode);

      this.bindEvents();
      this.initializeIcons();
    } catch (error) {
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
    // 清理全局事件监听器
    if (this.mouseEventHandler) {
      document.removeEventListener('mousedown', this.mouseEventHandler);
      this.mouseEventHandler = null;
    }

    // 移除 DOM 节点
    if (this.hostNode) {
      this.hostNode.remove();
    }

    // 重置关键状态
    this.hostNode = null;
    this.shadowRoot = null;
    this.isShow = false;
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // 复制按钮
    const copyBtn = this.shadowRoot.querySelector('.copy-btn');
    copyBtn?.addEventListener('click', () => this.onCopy());

    // 刷新按钮
    const refreshBtn = this.shadowRoot.querySelector('.refresh-btn');
    refreshBtn?.addEventListener('click', (e: Event) => this.onRefresh(e as MouseEvent));

    // 关闭按钮
    const closeBtn = this.shadowRoot.querySelector('.close-btn');
    closeBtn?.addEventListener('click', () => this.onClose());

    // 设置按钮
    const settingsBtn = this.shadowRoot.querySelector('.settings-btn');
    settingsBtn?.addEventListener('click', () => this.onSettings());
  }

  private onRefresh(event: MouseEvent): void {
    if (!this.shadowRoot || this.modelList.length === 0) return;

    event.stopPropagation();

    // 如果菜单不存在,创建新菜单
    if (!this.currentMenu) {
      this.currentMenu = new ModelMenu(
        this.shadowRoot,
        this.modelList,
        this.onModelSelect.bind(this)
      );
    }

    // 切换菜单显示状态
    const targetElement = event.currentTarget as HTMLElement;
    this.currentMenu.isVisible()
      ? this.currentMenu.hide()
      : this.currentMenu.show(targetElement);
  }

  private onCopy(): void {
    if (!this.shadowRoot) return;
    if (this.summary.trim() === '') return;

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
        summaDebugLog('复制失败:', err);
      });
  }

  private onModelSelect(model: LLMModel): void {
    this.currentModel = model;
    StorageService.saveCurrentModel(model);
    this.processContent(false);
  }

  private onClose(): void {
    this.hide();
  }

  private onSettings(): void {
    // 使用 chrome.runtime.sendMessage 来请求打开选项页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
    // 隐藏当前面板
    this.hide();
    summaDebugLog('Settings clicked, requesting to open options page');
  }

  // 切换内容区域的显示内容
  private switchContentVisibility(showProgress: boolean): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelector('.progress')?.classList.toggle('hidden', !showProgress);
    this.shadowRoot.querySelector('.markdown-body')?.classList.toggle('hidden', showProgress);
  }

  // 处理所有鼠标事件
  private handleMouseEvent(event: MouseEvent): void {
    if (!this.hostNode) return;

    const target = event.target as Node;

    // 检查点击是否在宿主元素内
    const isClickInside = this.hostNode.contains(target) || target === this.hostNode;

    if (!isClickInside) {
      this.hide();
    }
  }

}

export default SummaPanel;