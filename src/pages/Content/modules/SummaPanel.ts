import { icons } from '../../../lib/icons';
import { LLMModel } from '../../../services/LLM/provider';
import { summaDebugLog, summaErrorLog } from '../../../lib/utils';
import { StorageService } from '../../../services/storage';
import htmlTemplate from './SummaPanel.html';
import { SummaMenu } from './SummaMenu';
import { SummaryModel, ProcessStatus } from './SummaryModel';
import { SummaryView } from './SummaryView';


class SummaPanel {
  private hostNode: HTMLDivElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private currentUrl = '';
  private llmList: LLMModel[] = [];
  private currentLLM: LLMModel | null = null;
  private isShow = false;
  private menu: SummaMenu | null = null;

  private models: SummaryModel[] = [];
  private currentModelIndex = -1;
  private view: SummaryView | null = null;

  private mouseEventHandler: ((event: MouseEvent) => void) | null = null;


  async init(): Promise<void> {
    // 只监听来自 background 的消息
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  // 懒加载获取LLM列表
  private async getLLMList(): Promise<LLMModel[]> {
    if (this.llmList.length === 0) {
      this.llmList = await StorageService.getModelList();
    }
    return this.llmList;
  }

  // 确保当前LLM有效
  private async ensureCurrentLLM(): Promise<void> {
    const llmList = await this.getLLMList();
    if (llmList.length === 0) return;

    const savedLLM = await StorageService.getCurrentModel();

    // 使用空值合并运算符简化判断
    this.currentLLM = llmList.find(llm =>
      llm.id === savedLLM?.id &&
      llm.provider === savedLLM?.provider
    ) ?? llmList[0];

    if (this.currentLLM !== savedLLM) {
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

  // 开始新的 pipeline
  private async startNewPipeline(): Promise<void> {
    if (!this.shadowRoot) return;

    // 创建新Model实例
    const newModel = new SummaryModel(this.currentLLM, this.currentUrl);
    this.models.push(newModel);
    this.currentModelIndex = this.models.length - 1;

    await this.executePipeline();
  }

  async executePipeline(): Promise<void> {
    if (!this.view || this.currentModelIndex < 0) return;

    const currentModel = this.models[this.currentModelIndex];
    if (!currentModel) return;

    try {
      const modelIndex = this.currentModelIndex;

      this.view.showProgress(ProcessStatus.EXTRACTING);
      await currentModel.extractArticle();

      this.view.showProgress(ProcessStatus.SUMMARIZING);
      await currentModel.summarizeArticle();

      // 只有当用户仍在查看这个Model时才更新显示
      if (this.currentModelIndex === modelIndex) {
        this.view.showSummary(currentModel.getSummary());
      }
    } catch (error) {
      summaErrorLog('内容生成错误:', error);
    }
  }


  // 处理点击 Summa 按钮事件
  private async onClickedSumma(): Promise<void> {
    const currentPageUrl = window.location.href;

    // 首次初始化场景
    if (!this.hostNode) {
      this.currentUrl = currentPageUrl;
      await this.ensureCurrentLLM();
      await this.inject();
      this.show();
      this.startNewPipeline();
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
      this.models = [];
      this.show();
      this.startNewPipeline();
      this.updateLLMDisplay();
      this.updateSwitchButtons();
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
      this.initSummaryView();

      this.updateLLMDisplay();
      this.updateSwitchButtons();
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

  // 更新切换按钮的可见性和状态
  private updateSwitchButtons(): void {
    if (!this.shadowRoot) return;

    const switchContainer = this.shadowRoot.querySelector('.switch-container');
    if (!switchContainer) return;

    // 只有一个模型时隐藏切换按钮
    if (this.models.length <= 1) {
      switchContainer.classList.add('hidden');
      return;
    }

    switchContainer.classList.remove('hidden');
    const currentCount = this.shadowRoot.querySelector('.current-count');
    const totalCount = this.shadowRoot.querySelector('.total-count');

    if (currentCount && totalCount) {
      currentCount.textContent = `${this.currentModelIndex + 1}`;
      totalCount.textContent = `${this.models.length}`;
    }

    // 更新按钮状态
    const prevBtn = this.shadowRoot.querySelector('.prev-btn');
    const nextBtn = this.shadowRoot.querySelector('.next-btn');

    if (prevBtn) {
      prevBtn.classList.toggle('disabled', this.currentModelIndex <= 0);
    }
    if (nextBtn) {
      nextBtn.classList.toggle('disabled', this.currentModelIndex >= this.models.length - 1);
    }
  }

  private updateLLMDisplay(llm: LLMModel | null = this.currentLLM): void {
    if (!this.shadowRoot) return;

    const nameSpan = this.shadowRoot.querySelector<HTMLSpanElement>('.refresh-btn .model-name');
    if (nameSpan) {
      nameSpan.textContent = llm?.name ?? '未选择大语言模型';
    }
  }

  private initSummaryView(): void {
    if (!this.shadowRoot) return;

    const contentElement = this.shadowRoot.querySelector('.content');
    if (!contentElement) return;

    this.view = new SummaryView(contentElement as HTMLElement);
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

    // 切换按钮
    const prevBtn = this.shadowRoot.querySelector('.prev-btn');
    const nextBtn = this.shadowRoot.querySelector('.next-btn');
    prevBtn?.addEventListener('click', () => this.onSwitch('prev'));
    nextBtn?.addEventListener('click', () => this.onSwitch('next'));

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

  // prev/next 按钮方法
  private async onSwitch(direction: 'prev' | 'next'): Promise<void> {
    const newIndex = direction === 'prev'
      ? this.currentModelIndex - 1
      : this.currentModelIndex + 1;

    if (newIndex < 0 || newIndex >= this.models.length) return;

    this.currentModelIndex = newIndex;
    const currentModel = this.models[newIndex];

    if (currentModel) {
      if (currentModel.isCompleted()) {
        // 如果已完成，显示结果
        this.view?.showSummary(currentModel.getSummary());
      } else {
        // 如果未完成，显示进度
        this.view?.showProgress(currentModel.getProcess());
      }

      this.updateLLMDisplay(currentModel.getLLM());
      this.updateSwitchButtons();
    }
  }

  // 复制按钮方法
  private onCopy(): void {
    if (this.currentModelIndex < 0) return;

    const currentModel = this.models[this.currentModelIndex];
    if (!currentModel) return;

    const summary = currentModel.getSummary();
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

  // 刷新按钮方法
  private async onRefresh(event: MouseEvent): Promise<void> {
    const llmList = await this.getLLMList();
    if (!this.shadowRoot || llmList.length === 0) return;

    event.stopPropagation();

    // 创建新菜单
    if (!this.menu) {
      this.menu = new SummaMenu(
        this.shadowRoot,
        llmList,
        this.onLLMSelect.bind(this)
      );
    }

    // 显示或隐藏菜单
    const targetElement = event.currentTarget as HTMLElement;
    this.menu.isVisible()
      ? this.menu.hide()
      : this.menu.show(targetElement);
  }

  // LLM选择方法
  private onLLMSelect(llm: LLMModel) {
    this.currentLLM = llm;
    StorageService.saveCurrentModel(llm);
    this.startNewPipeline();
    this.updateLLMDisplay(llm);
    this.updateSwitchButtons();
  }

  // 关闭按钮方法
  private onClose(): void {
    this.hide();
  }

  // 设置按钮方法
  private onSettings(): void {
    // 使用 chrome.runtime.sendMessage 发送请求打开选项页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
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