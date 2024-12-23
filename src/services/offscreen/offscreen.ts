import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { summaDebugLog } from '../../lib/utils';

let turndownService: TurndownService | null = null;

const initTurndownService = () => {
  summaDebugLog('Offscreen: 初始化 TurndownService');
  if (!turndownService) {
    turndownService = new TurndownService({
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
    });

    turndownService.use(gfm);
    turndownService.addRule('strikethrough', {
      filter: ['del', 's'],
      replacement: function (content) {
        return '~' + content + '~';
      }
    });
  }
  return turndownService;
};

const extractContent = async (html: string): Promise<string> => {
  summaDebugLog('Offscreen: 开始提取内容', { htmlLength: html.length });
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    summaDebugLog('Offscreen: HTML 解析完成');

    const article = new Readability(doc, {
      keepClasses: true,
      debug: false,
      charThreshold: 100,
    }).parse();

    if (!article) {
      summaDebugLog('Offscreen: Readability 解析失败');
      throw new Error('无法解析文章内容');
    }

    summaDebugLog('Offscreen: Readability 解析成功', {
      title: article.title,
      contentLength: article.content.length
    });

    // 移除 HTML 注释
    article.content = article.content.replace(/(\<!--.*?\-->)/g, "");

    // 处理标题
    if (article.title.length > 0) {
      const h2Regex = /<h2[^>]*>(.*?)<\/h2>/;
      const match = article.content.match(h2Regex);
      if (match?.[0].includes(article.title)) {
        article.content = article.content.replace("<h2", "<h1").replace("</h2", "</h1");
      } else {
        article.content = `<h1>${article.title}</h1>\n${article.content}`;
      }
    }

    // 转换为 Markdown
    const turndownService = initTurndownService();
    let markdown = turndownService.turndown(article.content);
    summaDebugLog('Offscreen: Markdown 转换完成', { markdownLength: markdown.length });

    // 清理特殊的头部引用
    return markdown.replace(/\[\]\(#[^)]*\)/g, '');
  } catch (error) {
    summaDebugLog('Offscreen: 处理过程中出错', error);
    throw error;
  }
};

// 监听来自 Service Worker 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OFFSCREEN_EXTRACT_HTML') {
    extractContent(message.html)
      .then(markdown => {
        sendResponse({ success: true, markdown });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // 表示会异步发送响应
  }
}); 