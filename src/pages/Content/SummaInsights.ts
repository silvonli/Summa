
import { summaDebugLog } from '../../lib/utils';
// const summaTemplate = require('./summa.html');
import summaTemplate from './summa.html';

class SummaInsights {
  private container: HTMLDivElement | null;
  private shadowRoot: ShadowRoot | null;

  constructor() {
    this.container = null;
    this.shadowRoot = null;
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

  private toggle(): void {
    if (this.container) {
      this.remove();
    } else {
      this.inject();
    }
  }

  private inject(): void {
    try {
      // 创建容器
      this.container = document.createElement('div');

      // 创建 Shadow DOM
      this.shadowRoot = this.container.attachShadow({ mode: 'open' });

      // 拼接样式
      const style = `
      <style>
        @import "${chrome.runtime.getURL('summa.css')}";
      </style>
      `;

      // 拼接 HTML
      const template = style + summaTemplate;
      summaDebugLog('开始注入：', template);
      this.shadowRoot.innerHTML = template;

      // 添加到页面
      summaDebugLog('开始添加到页面');
      document.body.appendChild(this.container);

      // 绑定事件处理
      this.bindEvents();
    } catch (error) {
      console.error('Failed to inject Summa:', error);
      summaDebugLog('注入失败:', error);
    }
  }

  private remove(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.shadowRoot = null;
    }
  }

  private bindEvents(): void {
    if (!this.shadowRoot) return;

    // 删除按钮事件
    const deleteButton = this.shadowRoot.querySelector('.delete');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => this.remove());
    }

    // 其他按钮事件...
  }
}

export default SummaInsights;