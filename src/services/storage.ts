import { LLMProvider } from '../types/provider';

const STORAGE_KEY = 'llm_providers';

export const StorageService = {
  // 获取所有保存的providers
  async getProviders(): Promise<Record<string, LLMProvider>> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || {};
  },

  // 保存单个provider
  async saveProvider(provider: LLMProvider): Promise<void> {
    const providers = await this.getProviders();
    providers[provider.id] = provider;
    await chrome.storage.local.set({ [STORAGE_KEY]: providers });
  },

  // 获取单个provider
  async getProvider(id: string): Promise<LLMProvider | null> {
    const providers = await this.getProviders();
    return providers[id] || null;
  }
}; 