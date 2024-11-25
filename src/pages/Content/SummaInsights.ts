import { summaDebugLog } from '../../lib/utils';
import summaTemplate from './summa.html';
import { marked } from 'marked';

const extract = `
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

  private toggle(): void {
    if (!this.hostNode) {
      this.inject();
      // 提取内容
      this.extractContent();
      // 总结内容
      this.summarizeContent();
      // todo:等待 3 秒模拟分析
      setTimeout(() => {
        this.wrapUp();
      }, 3000);
    }

    this.isShow = !this.isShow;
    if (this.isShow) {
      this.setVisibility(true);
    } else {
      this.setVisibility(false);
    }
  }

  private setVisibility(visible: boolean): void {
    this.shadowRoot?.querySelector('.app')?.classList.toggle('hidden', !visible);
  }


  private extractContent(): void {
    this.content = extract;
  }

  private summarizeContent(): void {
    const summary = this.content;
    this.summary = summary;
  }

  private wrapUp(): void {
    marked.use({
      async: false,
      pedantic: false,
      gfm: true,
    });
    const html = marked.parse(this.summary) as string;
    const progress = this.shadowRoot?.querySelector('.progress');
    const markdownBody = this.shadowRoot?.querySelector('.markdown-body');

    if (markdownBody) {
      markdownBody.innerHTML = html;
    }

    if (progress) {
      progress.classList.add('hidden');
    }

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

  private refresh(): void {
    this.summarizeContent();
    this.wrapUp();
  }
}

export default SummaInsights;