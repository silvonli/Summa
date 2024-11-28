import { LLMProvider, DEFAULT_PROVIDERS } from '../types/llm';

// 存储键定义
const STORAGE_KEYS = {
  PROVIDERS: 'llm_providers',
} as const;

// 存储服务
export const StorageService = {
  // 获取所有提供商配置
  async getProviders(): Promise<LLMProvider[]> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.PROVIDERS);
    return result[STORAGE_KEYS.PROVIDERS] || [];
  },

  // 更新提供商配置
  async updateProvider(provider: LLMProvider): Promise<void> {
    const providers = await this.getProviders();
    const index = providers.findIndex(p => p.id === provider.id);

    if (index >= 0) {
      providers[index] = provider;
    } else {
      providers.push(provider);
    }

    await chrome.storage.sync.set({ [STORAGE_KEYS.PROVIDERS]: providers });
  },

  // 初始化存储
  async initialize(): Promise<void> {
    const existingProviders = await this.getProviders();
    if (existingProviders.length === 0) {
      await chrome.storage.sync.set({
        [STORAGE_KEYS.PROVIDERS]: DEFAULT_PROVIDERS
      });
    }
  }
}; 