import { LLMProvider, LLMModel } from '../types/provider';

const STORAGE_KEY = 'llm_providers';

export class StorageService {
  // 获取所有保存的providers
  static async getProviders(): Promise<Record<string, LLMProvider>> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || {};
  }

  // 保存单个provider
  static async saveProvider(provider: LLMProvider): Promise<void> {
    const providers = await this.getProviders();
    providers[provider.id] = provider;
    await chrome.storage.local.set({ [STORAGE_KEY]: providers });
  }

  // 获取单个provider
  static async getProvider(id: string): Promise<LLMProvider | null> {
    const providers = await this.getProviders();
    return providers[id] || null;
  }

  // 获取模型列表
  static async getModelList(): Promise<LLMModel[]> {
    const providers = await this.getProviders();
    const enabledModels = Object.values(providers)
      .filter(provider => provider.enable)
      .flatMap(provider => provider.models);
    return enabledModels;
  }

  // 获取用户 API 密钥
  static async getUserApiKeys(): Promise<Record<string, string>> {
    const providers = await this.getProviders();
    return Object.entries(providers).reduce((acc, [providerId, provider]) => {
      if (provider.enable && provider.apiKey) {
        acc[providerId] = provider.apiKey;
      }
      return acc;
    }, {} as Record<string, string>);
  }

  // 获取用户基础 URL
  static async getUserBaseURLs(): Promise<Record<string, string>> {
    const providers = await this.getProviders();
    return Object.entries(providers).reduce((acc, [providerId, provider]) => {
      if (provider.enable && provider.apiHost) {
        acc[providerId] = provider.apiHost;
      }
      return acc;
    }, {} as Record<string, string>);
  }
} 