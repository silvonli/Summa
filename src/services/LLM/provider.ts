/**
 * LLM 提供商
 */
export type LLMProvider = {
  id: string;
  name: string;
  apiKey?: string;
  apiHost?: string;
  models: LLMModel[];
  enable?: boolean;
}

/**
 * LLM 模型
 */
export type LLMModel = {
  id: string;
  name: string;
  provider: string; // 关联到 LLMProvider 的 id
}

/**
 * 默认提供商
 */
export const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    id: 'ANTHROPIC',
    name: 'Anthropic',
    models: [
      {
        id: 'claude-3-5-sonnet-latest',
        provider: 'ANTHROPIC',
        name: 'Claude 3.5 Sonnet'
      },
      {
        id: 'claude-3-opus-latest',
        provider: 'ANTHROPIC',
        name: 'Claude 3 Opus'
      },
    ],
  },
  {
    id: 'OPENAI',
    name: 'OpenAI',
    models: [
      {
        id: 'gpt-4o',
        provider: 'OPENAI',
        name: ' GPT-4o'
      },
      {
        id: 'gpt-4o-mini',
        provider: 'OPENAI',
        name: ' GPT-4o-mini'
      },
      {
        id: 'o1-mini',
        provider: 'OPENAI',
        name: ' o1-mini'
      },
    ],
  },
  {
    id: 'GOOGLE',
    name: 'Google AI',
    models: [],
  },
  {
    id: 'GROQ',
    name: 'Groq',
    models: [
      {
        id: 'llama3-8b-8192',
        provider: 'GROQ',
        name: 'LLaMA3 8B'
      },
      {
        id: 'llama3-70b-8192',
        provider: 'GROQ',
        name: 'LLaMA3 70B'
      },
      {
        id: 'mixtral-8x7b-32768',
        provider: 'GROQ',
        name: 'Mixtral 8x7B'
      },
      {
        id: 'gemma-7b-it',
        provider: 'GROQ',
        name: 'Gemma 7B'
      }
    ],
  },
  {
    id: 'OPENROUTER',
    name: 'OpenRouter',
    models: [
      {
        id: 'google/gemma-2-9b-it:free',
        provider: 'OPENROUTER',
        name: 'Google: Gemma 2 9B'
      },
      {
        id: 'microsoft/phi-3-medium-128k-instruct:free',
        provider: 'OPENROUTER',
        name: 'Phi-3 Medium 128K Instruct'
      },
      {
        id: 'meta-llama/llama-3-8b-instruct:free',
        provider: 'OPENROUTER',
        name: 'Meta: Llama 3 8B Instruct'
      },
      {
        id: 'mistralai/mistral-7b-instruct:free',
        provider: 'OPENROUTER',
        name: 'Mistral: Mistral 7B Instruct'
      }
    ],
  },
  {
    id: 'DEEPSEEK',
    name: 'DeepSeek',
    models: [
      {
        id: 'deepseek-chat',
        provider: 'DEEPSEEK',
        name: 'DeepSeek Chat'
      },
      {
        id: 'deepseek-coder',
        provider: 'DEEPSEEK',
        name: 'DeepSeek Coder'
      }
    ],
  },
  {
    id: 'MISTRAL',
    name: 'Mistral AI',
    models: [
      {
        id: 'pixtral-12b-2409',
        provider: 'MISTRAL',
        name: 'Pixtral-12B-2409'
      },
      {
        id: 'open-mistral-nemo',
        provider: 'MISTRAL',
        name: 'Open-Mistral-Nemo'
      }
    ],
  },
  {
    id: 'OPENAI_LIKE',
    name: 'OpenAI Like',
    models: [],
  },
  {
    id: 'LMSTUDIO',
    name: 'LMStudio',
    apiHost: 'http://localhost:1234',
    models: [],
  },
  {
    id: 'OLLAMA',
    name: 'Ollama',
    apiHost: 'http://localhost:11434',
    models: [],
  }
];

