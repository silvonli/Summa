import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';
import type { LanguageModelV1 } from 'ai';

export const DEFAULT_NUM_CTX = 32768;

type OptionalApiKey = string | undefined;

export function getAnthropicModel(apiKey: OptionalApiKey, model: string) {
  const anthropic = createAnthropic({
    apiKey,
  });

  return anthropic(model);
}
export function getOpenAILikeModel(baseURL: string, apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL,
    apiKey,
  });

  return openai(model);
}

export function getCohereAIModel(apiKey: OptionalApiKey, model: string) {
  const cohere = createCohere({
    apiKey,
  });

  return cohere(model);
}

export function getOpenAIModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    apiKey,
  });

  return openai(model);
}

export function getMistralModel(apiKey: OptionalApiKey, model: string) {
  const mistral = createMistral({
    apiKey,
  });

  return mistral(model);
}

export function getGoogleModel(apiKey: OptionalApiKey, model: string) {
  const google = createGoogleGenerativeAI({
    apiKey,
  });

  return google(model);
}

export function getGroqModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });

  return openai(model);
}

export function getHuggingFaceModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api-inference.huggingface.co/v1/',
    apiKey,
  });

  return openai(model);
}

export function getOllamaModel(baseURL: string, model: string) {
  const ollamaInstance = ollama(model, {
    numCtx: DEFAULT_NUM_CTX,
  }) as LanguageModelV1 & { config: any };

  ollamaInstance.config.baseURL = `${baseURL}/api`;

  return ollamaInstance;
}

export function getDeepseekModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey,
  });

  return openai(model);
}

export function getOpenRouterModel(apiKey: OptionalApiKey, model: string) {
  const openRouter = createOpenRouter({
    apiKey,
  });

  return openRouter.chat(model);
}

export function getLMStudioModel(baseURL: string, model: string) {
  const lmstudio = createOpenAI({
    baseURL: `${baseURL}/v1`,
    apiKey: '',
  });

  return lmstudio(model);
}

export function getXAIModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey,
  });

  return openai(model);
}

export function getBailianModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
    apiKey,
  });

  return openai(model);
}

export function getTogetherModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.together.xyz/v1',
    apiKey,
  });

  return openai(model);
}

export function getHyperbolicModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.hyperbolic.xyz/v1',
    apiKey,
  });

  return openai(model);
}

export function getSilliconflowModel(apiKey: OptionalApiKey, model: string) {
  const openai = createOpenAI({
    baseURL: 'https://api.siliconflow.cn/v1',
    apiKey,
  });

  return openai(model);
}

export function getModel(provider: string, model: string, apiKeys?: Record<string, string>, baseURLs?: Record<string, string>) {
  const apiKey = apiKeys?.[provider] ?? '';
  const baseURL = baseURLs?.[provider] ?? '';

  switch (provider) {
    case 'ANTHROPIC':
      return getAnthropicModel(apiKey, model);
    case 'OPENAI':
      return getOpenAIModel(apiKey, model);
    case 'GROQ':
      return getGroqModel(apiKey, model);
    case 'OPENROUTER':
      return getOpenRouterModel(apiKey, model);
    case 'GOOGLE':
      return getGoogleModel(apiKey, model);
    case 'OPENAI_LIKE':
      return getOpenAILikeModel(baseURL, apiKey, model);
    case 'DEEPSEEK':
      return getDeepseekModel(apiKey, model);
    case 'MISTRAL':
      return getMistralModel(apiKey, model);
    case 'LMSTUDIO':
      return getLMStudioModel(baseURL, model);
    case 'OLLAMA':
      return getOllamaModel(baseURL, model);
    case 'SILLICONFLOW':
      return getSilliconflowModel(apiKey, model);
    case 'BAILIAN':
      return getBailianModel(apiKey, model);
    case 'TOGETHER':
      return getTogetherModel(apiKey, model);
    case 'HYPERBOLIC':
      return getHyperbolicModel(apiKey, model);

    // 以下没有提供商没有在设置页面提供
    case 'xAI':
      return getXAIModel(apiKey, model);
    case 'Cohere':
      return getCohereAIModel(apiKey, model);
    case 'HuggingFace':
      return getHuggingFaceModel(apiKey, model);
  }
}
