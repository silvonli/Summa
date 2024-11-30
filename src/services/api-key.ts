

export function getAPIKey(provider: string, userApiKeys?: Record<string, string>) {

  // First check user-provided API keys
  if (userApiKeys?.[provider]) {
    return userApiKeys[provider];
  }

  // Fall back to environment variables
  switch (provider) {
    case 'Anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'OpenAI':
      return process.env.OPENAI_API_KEY;
    case 'Google':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'Groq':
      return process.env.GROQ_API_KEY;
    case 'HuggingFace':
      return process.env.HuggingFace_API_KEY;
    case 'OpenRouter':
      return process.env.OPEN_ROUTER_API_KEY;
    case 'Deepseek':
      return process.env.DEEPSEEK_API_KEY;
    case 'Mistral':
      return process.env.MISTRAL_API_KEY;
    case 'OpenAILike':
      return process.env.OPENAI_LIKE_API_KEY;
    case 'xAI':
      return process.env.XAI_API_KEY;
    case 'Cohere':
      return process.env.COHERE_API_KEY;
    case 'AzureOpenAI':
      return process.env.AZURE_OPENAI_API_KEY;
    default:
      return '';
  }
}

export function getBaseURL(provider: string) {
  switch (provider) {
    case 'OpenAILike':
      return process.env.OPENAI_LIKE_API_BASE_URL || '';
    case 'LMStudio':
      return process.env.LMSTUDIO_API_BASE_URL || 'http://localhost:1234';
    case 'Ollama': {
      let baseUrl = process.env.OLLAMA_API_BASE_URL || 'http://localhost:11434';

      if (process.env.RUNNING_IN_DOCKER === 'true') {
        baseUrl = baseUrl.replace('localhost', 'host.docker.internal');
      }

      return baseUrl;
    }
    default:
      return '';
  }
}
