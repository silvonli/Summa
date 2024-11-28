import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { summaDebugLog } from '../../lib/utils';

export class ContentExtractor {
  private static turndownService: TurndownService;

  // 初始化 TurndownService
  private static initTurndownService() {
    if (!this.turndownService) {
      this.turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
      });

      this.turndownService.use(gfm);

      this.turndownService.addRule('strikethrough', {
        filter: ['del', 's'],
        replacement: function (content) {
          return '~' + content + '~';
        }
      });
    }
    return this.turndownService;
  }

  // 从 document 提取内容
  public static async extractFromDom(doc: Document) {
    const turndownService = this.initTurndownService();

    const article = new Readability(doc, {
      keepClasses: true,
      debug: false,
      charThreshold: 100,
    }).parse();

    if (!article) {
      throw new Error('无法解析文章内容');
    }

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

    summaDebugLog('html article content', article.content);
    // 转换为 Markdown
    let markdown = turndownService.turndown(article.content);
    summaDebugLog('markdown article content', markdown);

    // 清理特殊的头部引用
    return markdown.replace(/\[\]\(#[^)]*\)/g, '');
  }

}
