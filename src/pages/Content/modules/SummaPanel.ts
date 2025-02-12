import { icons } from '../../../lib/icons';
import { summaDebugLog, summaErrorLog } from '../../../lib/utils';
import { LLMModel } from '../../../services/LLM/provider';
import { StorageService } from '../../../services/storage';
import { ModelMenu } from './ModelMenu';
import htmlTemplate from './SummaPanel.html';
import { SummaryRenderer } from './SummaryRenderer';


class SummaPanel {
  private hostNode: HTMLDivElement | null;
  private shadowRoot: ShadowRoot | null;
  private currentUrl: string;
  private mouseEventHandler: ((event: MouseEvent) => void) | null;
  private llmList: LLMModel[] = [];
  private currentLLM: LLMModel | null = null;
  private menu: ModelMenu | null = null;
  private contentRender: SummaryRenderer | null = null;
  private isShow: boolean = false;

  constructor() {
    this.hostNode = null;
    this.shadowRoot = null;
    this.currentUrl = '';
    this.isShow = false;
    this.mouseEventHandler = null;
  }

  async init(): Promise<void> {
    // 只监听来自 background 的消息
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  // 懒加载获取模型列表
  private async getLLMList(): Promise<LLMModel[]> {
    if (this.llmList.length === 0) {
      this.llmList = await StorageService.getModelList();
    }
    return this.llmList;
  }

  // 确保当前模型
  private async ensureCurrentLLM(): Promise<void> {
    // 确保模型列表已加载
    const llmList = await this.getLLMList();

    // 如果模型列表为空则直接返回
    if (llmList.length === 0) return;

    const savedLLM = await StorageService.getCurrentModel();
    // 如果没有保存的模型,使用第一个模型
    if (!savedLLM) {
      this.currentLLM = llmList[0];
      StorageService.saveCurrentModel(this.currentLLM);
      return;
    }

    // 检查保存的模型是否在当前列表中
    const llmExists = llmList.some(llm =>
      llm.id === savedLLM.id &&
      llm.provider === savedLLM.provider
    );

    if (llmExists) {
      this.currentLLM = savedLLM;
    } else {
      this.currentLLM = llmList[0];
      StorageService.saveCurrentModel(this.currentLLM);
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

  // 渲染总结内容
  private async renderSummaryContent(): Promise<void> {
    if (!this.shadowRoot) return;

    const contentElement = this.shadowRoot.querySelector('.content');
    if (!contentElement) return;

    this.contentRender = new SummaryRenderer(
      contentElement as HTMLElement,
      this.currentLLM,
      this.currentUrl
    );

    await this.contentRender.executePipeline();
  }

  // 处理点击 Summa 按钮事件
  private async onClickedSumma(): Promise<void> {
    const currentPageUrl = window.location.href;

    // 首次初始化场景
    if (!this.hostNode) {
      this.currentUrl = currentPageUrl;
      await this.inject();
      this.show();
      this.renderSummaryContent();
      return;
    }

    // 已显示时直接隐藏并返回
    if (this.isShow) {
      this.hide();
      return;
    }

    // URL 发生变化时需要重新渲染
    const isUrlChanged = this.currentUrl !== currentPageUrl;
    if (isUrlChanged) {
      this.currentUrl = currentPageUrl;
      this.show();
      this.renderSummaryContent();
      return;
    }

    // 统一显示逻辑
    this.show();

  }


  // 注入页面
  private async inject(): Promise<void> {
    try {
      this.hostNode = document.createElement('div');
      this.shadowRoot = this.hostNode.attachShadow({ mode: 'open' });

      // 创建独立的 style 元素
      const styleSheet = document.createElement('link');
      styleSheet.rel = 'stylesheet';
      styleSheet.href = chrome.runtime.getURL('content.styles.css');

      // 先添加样式表
      this.shadowRoot.appendChild(styleSheet);

      // 添加 HTML 
      this.shadowRoot.innerHTML += htmlTemplate;

      document.body.appendChild(this.hostNode);

      this.bindEvents();
      this.initializeIcons();
      await this.ensureCurrentLLM();
      this.initLLMNameDisplay();
    } catch (error) {
      summaErrorLog('注入失败:', error);
    }
  }

  // 显示界面
  private show(): void {
    this.isShow = true;
    this.shadowRoot?.querySelector('.panel')?.classList.remove('hidden');

    // 添加统一的鼠标事件监听
    this.mouseEventHandler = this.handleMouseEvent.bind(this);
    document.addEventListener('mousedown', this.mouseEventHandler);
  }

  // 隐藏界面
  private hide(): void {
    this.isShow = false;
    this.shadowRoot?.querySelector('.panel')?.classList.add('hidden');

    // 移除事件监听
    if (this.mouseEventHandler) {
      document.removeEventListener('mousedown', this.mouseEventHandler);
      this.mouseEventHandler = null;
    }
  }

  private initializeIcons(): void {
    if (!this.shadowRoot) return;

    // 查找所有带有 data-icon 属性的元素
    const iconContainers = this.shadowRoot.querySelectorAll('[data-icon]');

    iconContainers.forEach(container => {
      const iconNames = container.getAttribute('data-icon')?.split(',') || [];
      iconNames.forEach(name => {
        const iconHtml = icons[name as keyof typeof icons];
        if (iconHtml) {
          container.innerHTML += iconHtml;
        }
      });
    });
  }

  private initLLMNameDisplay(): void {
    if (!this.shadowRoot) return;

    const nameSpan = this.shadowRoot.querySelector<HTMLSpanElement>('.refresh-btn .model-name');
    if (nameSpan) {
      nameSpan.textContent = this.currentLLM?.name ?? '未选择模型';
    }
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

  private async onRefresh(event: MouseEvent): Promise<void> {
    const llmList = await this.getLLMList();
    if (!this.shadowRoot || llmList.length === 0) return;

    event.stopPropagation();

    // 如果菜单不存在,创建新菜单
    if (!this.menu) {
      this.menu = new ModelMenu(
        this.shadowRoot,
        llmList,
        this.onLLMSelect.bind(this)
      );
    }

    // 切换菜单显示状态
    const targetElement = event.currentTarget as HTMLElement;
    this.menu.isVisible()
      ? this.menu.hide()
      : this.menu.show(targetElement);
  }

  private onCopy(): void {
    if (!this.contentRender) return;

    const summary = this.contentRender.getSummary();
    if (!summary.trim()) return;

    navigator.clipboard.writeText(summary)
      .then(() => {
        const copyBtn = this.shadowRoot?.querySelector('.copy-btn');
        if (!copyBtn) return;

        copyBtn.classList.add('copied');
        setTimeout(() => copyBtn.classList.remove('copied'), 2000);
      })
      .catch(err => {
        summaErrorLog('复制失败:', err);
      });
  }

  private onLLMSelect(llm: LLMModel) {
    this.currentLLM = llm;
    StorageService.saveCurrentModel(llm);
    this.initLLMNameDisplay();
    this.renderSummaryContent();
  }

  private onClose(): void {
    this.hide();
  }

  private onSettings(): void {
    // 使用 chrome.runtime.sendMessage 来请求打开选项页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
    // 隐藏当前面板
    this.hide();
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