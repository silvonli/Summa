
// 存储键定义
const STORAGE_KEYS = {
  USER_API_KEYS: 'user_api_keys',
  USER_BASE_URLS: 'user_base_urls',
} as const;

// 存储服务
export const StorageService = {

  // 获取用户 API 密钥
  async getUserApiKeys(): Promise<Record<string, string>> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.USER_API_KEYS);
    return result[STORAGE_KEYS.USER_API_KEYS] || {};
  },

  // 更新用户 API 密钥
  async updateUserApiKeys(apiKeys: Record<string, string>): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.USER_API_KEYS]: apiKeys });
  },

  // 获取用户基础 URL
  async getUserBaseURLs(): Promise<Record<string, string>> {
    const result = await chrome.storage.sync.get(STORAGE_KEYS.USER_BASE_URLS);
    return result[STORAGE_KEYS.USER_BASE_URLS] || {};
  },

  // 更新用户基础 URL
  async updateUserBaseURLs(baseURLs: Record<string, string>): Promise<void> {
    await chrome.storage.sync.set({ [STORAGE_KEYS.USER_BASE_URLS]: baseURLs });
  },

}; 