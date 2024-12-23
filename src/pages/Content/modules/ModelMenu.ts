import { LLMModel } from '../../../services/LLM/provider';

export class ModelMenu {
  private menuElement: HTMLElement;
  private shadowRoot: ShadowRoot;
  private onModelSelect: (model: LLMModel) => void;

  constructor(shadowRoot: ShadowRoot, models: LLMModel[], onModelSelect: (model: LLMModel) => void) {
    this.shadowRoot = shadowRoot;
    this.onModelSelect = onModelSelect;

    // 创建菜单元素
    this.menuElement = document.createElement('div');
    this.menuElement.className = 'model-menu';
    this.initializeMenu(models);
  }

  private initializeMenu(models: LLMModel[]): void {
    // 创建菜单项
    models.forEach(model => {
      const item = document.createElement('div');
      item.className = 'model-menu-item';
      item.textContent = model.name;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onModelSelect(model);
        this.hide();
      });

      this.menuElement.appendChild(item);
    });

    // 添加到 shadow DOM
    this.shadowRoot.querySelector('.header')?.appendChild(this.menuElement);

    // 添加点击外部关闭菜单的处理
    document.addEventListener('click', () => this.hide());
    this.menuElement.addEventListener('click', (e) => e.stopPropagation());
  }

  show(anchorElement: HTMLElement): void {
    const rect = anchorElement.getBoundingClientRect();
    const offsetParent = this.menuElement.offsetParent as HTMLElement;
    const offsetRect = offsetParent?.getBoundingClientRect() || { top: 0, left: 0 };

    // 使用 Math.max 确保位置不会出现负值
    this.menuElement.style.top = `${Math.max(rect.bottom - (offsetRect?.top || 0), 0) + 0}px`;
    this.menuElement.style.left = `${Math.max(rect.left - (offsetRect?.left || 0), 0) - 12}px`;
    this.menuElement.classList.add('show');
  }

  hide(): void {
    this.menuElement.classList.remove('show');
  }

  isVisible(): boolean {
    return this.menuElement.classList.contains('show');
  }
} 