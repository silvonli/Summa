import { summaDebugLog, summaErrorLog } from '../../../lib/utils';
import htmlTemplate from './SummaPanel.html';
import { marked } from 'marked';
import { icons } from '../../../lib/icons';
import { LLMModel } from '../../../services/LLM/provider';
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
  private article: string;
  private summary: string;
  private currentUrl: string;
  private mouseEventHandler: ((event: MouseEvent) => void) | null;
  private currentModel: LLMModel | null = null;
  private modelList: LLMModel[] = [];
  private currentMenu: ModelMenu | null = null;
  private currentRequestId: string;

  constructor() {
    this.hostNode = null;
    this.shadowRoot = null;
    this.isShow = false;
    this.article = '';
    this.summary = '';
    this.currentUrl = '';
    this.mouseEventHandler = null;
    this.currentRequestId = '';
  }

  async init(): Promise<void> {
    // 只监听来自 background 的消息
    chrome.runtime.onMessage.addListener(this.handleMessages.bind(this));
  }

  // 懒加载获取模型列表
  private async getModelList(): Promise<LLMModel[]> {
    if (this.modelList.length === 0) {
      this.modelList = await StorageService.getModelList();
    }
    return this.modelList;
  }

  // 懒加载获取当前模型
  private async getCurrentModel(): Promise<LLMModel | null> {
    if (!this.currentModel) {
      await this.initializeCurrentModel();
    }
    return this.currentModel;
  }

  // 初始化当前模型
  private async initializeCurrentModel(): Promise<void> {
    // 确保模型列表已加载
    const modelList = await this.getModelList();

    // 如果模型列表为空则直接返回
    if (modelList.length === 0) return;

    const savedModel = await StorageService.getCurrentModel();
    // 如果没有保存的模型,使用第一个模型
    if (!savedModel) {
      this.currentModel = modelList[0];
      StorageService.saveCurrentModel(this.currentModel);
      return;
    }

    // 检查保存的模型是否在当前列表中
    const modelExists = modelList.some(model =>
      model.id === savedModel.id &&
      model.provider === savedModel.provider
    );

    if (modelExists) {
      this.currentModel = savedModel;
    } else {
      this.currentModel = modelList[0];
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

  // 更新总结显示
  private updateSummary(html: string): void {
    if (!this.shadowRoot) return;

    const markdownBody = this.shadowRoot.querySelector('.markdown-body');
    if (!markdownBody) return;

    markdownBody.innerHTML = html;
  }

  // 处理正文
  private async handleArticle(shouldExtractArticle: boolean = true): Promise<void> {
    try {
      // 生成新的请求ID
      const requestId = Date.now().toString();
      this.currentRequestId = requestId;

      // 切换到显示进度条
      this.switchContentVisibility(true);

      // 提取正文
      if (shouldExtractArticle) {
        this.updateProcess(ProcessStatus.EXTRACTING);
        await this.extractArticle();
        if (this.checkRequestCancelled(requestId)) return;
      }

      this.updateProcess(ProcessStatus.SUMMARIZING);

      // 生成总结
      await this.summarizeArticle();
      if (this.checkRequestCancelled(requestId)) return;

      this.updateProcess(ProcessStatus.PARSING);

      // 解析总结
      const html = await this.parseSummary();
      if (this.checkRequestCancelled(requestId)) return;

      // 切换到显示总结
      this.switchContentVisibility(false);
      this.updateSummary(html);

    } catch (error) {
      summaErrorLog('发生错误:', error);
    }
  }


  // clickedSumma 方法
  private onClickedSumma() {
    // 如果已经显示,直接隐藏
    if (this.isShow) {
      this.hide();
      return;
    }

    const newUrl = window.location.href;

    // 如果没有宿主节点，需要初始化
    if (!this.hostNode) {
      this.currentUrl = newUrl;
      this.inject();
      this.show();
      this.handleArticle();
      return;
    }

    // 如果 URL 发生变化，需要重新处理
    if (this.currentUrl !== newUrl) {
      this.currentUrl = newUrl;
      this.show();
      this.handleArticle();
      return;
    }

    // URL 没有变化，直接显示
    this.show();
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

  // 显示界面
  private show(): void {
    this.isShow = true;
    this.shadowRoot?.querySelector('.panel')?.classList.remove('hidden');

    // 添加统一的鼠标事件监听
    this.mouseEventHandler = this.handleMouseEvent.bind(this);
    document.addEventListener('mousedown', this.mouseEventHandler);
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
    const currentModel = await this.getCurrentModel();
    if (!currentModel) {
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
          model: currentModel,
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

      // 添加 HTML 
      this.shadowRoot.innerHTML += htmlTemplate;

      document.body.appendChild(this.hostNode);

      this.bindEvents();
      this.initializeIcons();
      this.initModelNameDisplay();
    } catch (error) {
      summaErrorLog('注入失败:', error);
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

  private async initModelNameDisplay(): Promise<void> {
    if (!this.shadowRoot) return;

    const currentModel = await this.getCurrentModel();
    const modelNameSpan = this.shadowRoot.querySelector<HTMLSpanElement>('.refresh-btn .model-name');
    if (modelNameSpan) {
      modelNameSpan.textContent = currentModel?.name ?? '未选择模型';
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
    const modelList = await this.getModelList();
    if (!this.shadowRoot || modelList.length === 0) return;

    event.stopPropagation();

    // 如果菜单不存在,创建新菜单
    if (!this.currentMenu) {
      this.currentMenu = new ModelMenu(
        this.shadowRoot,
        modelList,
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
    if (!this.shadowRoot || this.summary.trim() === '') return;

    // 复制到剪贴板
    navigator.clipboard.writeText(this.summary)
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

  private onModelSelect(model: LLMModel) {
    this.currentModel = model;
    StorageService.saveCurrentModel(model);
    this.initModelNameDisplay();
    // 如果正文为空或者正文不存在,需要重新提取
    const shouldExtractArticle = !this.article || this.article.length === 0;
    this.handleArticle(shouldExtractArticle);
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

  // 切换内容区域的显示内容
  private switchContentVisibility(showProgress: boolean): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.querySelector('.progress')?.classList.toggle('content-hidden', !showProgress);
    this.shadowRoot.querySelector('.markdown-body')?.classList.toggle('content-hidden', showProgress);
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

  /**
   * 检查当前请求是否已被新请求取代
   * @param requestId 当前处理的请求ID
   * @returns 是否已被取消
   */
  private checkRequestCancelled(requestId: string): boolean {
    if (this.currentRequestId !== requestId) {
      summaDebugLog('checkRequestCancelled: 检测到新请求，终止当前处理');
      return true;
    }
    return false;
  }

}

export default SummaPanel;