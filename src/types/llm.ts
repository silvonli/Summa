/**
 * LLM 提供商接口
 */
export interface LLMProvider {
  id: string;
  name: string;
  apiEndpoint?: string;
  apiKey?: string;
}

/**
 * LLM 模型接口
 */
export interface LLMModel {
  id: string;
  name: string;
  providerId: string; // 关联到 LLMProvider 的 id
}


/**
 * 默认提供商
 */
export const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'OPENAI',
    name: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1',
  },
  {
    id: 'ANTHROPIC',
    name: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com',
  },
  {
    id: 'OPENROUTER',
    name: 'OpenRouter',
    apiEndpoint: 'https://openrouter.ai/api/v1',
  }
];

/**
 * 模型配置示例
 */
export const DEFAULT_MODELS: LLMModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    providerId: 'OPENAI',
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    providerId: 'ANTHROPIC',
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o-mini',
    providerId: 'OPENROUTER',
  }
]; 
