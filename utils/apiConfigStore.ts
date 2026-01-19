import { APIConfig, DEFAULT_API_CONFIG, LLMProvider } from '../types/apiConfig';

// 从环境变量获取默认值
const getDefaultTavilyApiKey = (): string => {
  // 尝试从 Vite 环境变量获取
  if (typeof window !== 'undefined') {
    // 浏览器环境
    return (window as any)['env']?.VITE_TAVILY_API_KEY || 
           process?.env?.VITE_TAVILY_API_KEY || 
           process?.env?.VITE_TAVILY_API_KEY_1 || 
           '';
  }
  // 构建时环境
  return process?.env?.VITE_TAVILY_API_KEY || process?.env?.VITE_TAVILY_API_KEY_1 || '';
};

const getDefaultGeminiModelFast = (): string => {
  if (typeof window !== 'undefined') {
    return (window as any)['env']?.VITE_GEMINI_MODEL_FAST || 
           process?.env?.VITE_GEMINI_MODEL_FAST || 
           'gemini-3.0-flash';
  }
  return process?.env?.VITE_GEMINI_MODEL_FAST || 'gemini-3.0-flash';
};

const getDefaultGeminiModelDeep = (): string => {
  if (typeof window !== 'undefined') {
    return (window as any)['env']?.VITE_GEMINI_MODEL_DEEP || 
           process?.env?.VITE_GEMINI_MODEL_DEEP || 
           'gemini-3.0-pro';
  }
  return process?.env?.VITE_GEMINI_MODEL_DEEP || 'gemini-3.0-pro';
};

const getDefaultLLMEndpoint = (): string => {
  if (typeof window !== 'undefined') {
    return (window as any)['env']?.VITE_LLM_ENDPOINT || 
           process?.env?.VITE_LLM_ENDPOINT || 
           '';
  }
  return process?.env?.VITE_LLM_ENDPOINT || '';
};

const getDefaultLLMProvider = (): LLMProvider => {
  if (typeof window !== 'undefined') {
    const provider = (window as any)['env']?.VITE_LLM_PROVIDER || 
                  process?.env?.VITE_LLM_PROVIDER;
    if (provider && ['gemini', 'openai', 'claude', 'deepseek', 'custom'].includes(provider)) {
      return provider as LLMProvider;
    }
    return 'openai'; // 默认为OpenAI格式
  }
  const provider = process?.env?.VITE_LLM_PROVIDER;
  if (provider && ['gemini', 'openai', 'claude', 'deepseek', 'custom'].includes(provider)) {
    return provider as LLMProvider;
  }
  return 'openai'; // 默认为OpenAI格式
};

const STORAGE_KEY = 'netpulse_api_config';

export const apiConfigStore = {
  // 获取配置
  get(): APIConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_API_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load API config:', e);
    }
    
    // 如果没有存储的配置，则尝试使用环境变量中的默认值
    const defaultConfig = { ...DEFAULT_API_CONFIG };
    
    // 从环境变量获取API密钥
    const envTavilyKey = getDefaultTavilyApiKey();
    const envGeminiKey = typeof window !== 'undefined' ? 
      (window as any)['env']?.VITE_GEMINI_API_KEY || process?.env?.VITE_GEMINI_API_KEY :
      process?.env?.VITE_GEMINI_API_KEY;
    
    // 如果环境变量中有API密钥，则自动启用配置
    if (envTavilyKey && envGeminiKey) {
      defaultConfig.searchApiKey = envTavilyKey;
      defaultConfig.llmApiKey = envGeminiKey;
      defaultConfig.enabled = true; // 自动启用配置
    }
    
    const defaultGeminiFastModel = getDefaultGeminiModelFast();
    const defaultGeminiDeepModel = getDefaultGeminiModelDeep();
    
    if (defaultGeminiFastModel !== 'gemini-3.0-flash') {
      defaultConfig.llmModelFast = defaultGeminiFastModel;
    }
    
    if (defaultGeminiDeepModel !== 'gemini-3.0-pro') {
      defaultConfig.llmModelDeep = defaultGeminiDeepModel;
    }
    
    // 从环境变量获取默认的端点和提供商
    const defaultEndpoint = getDefaultLLMEndpoint();
    const defaultProvider = getDefaultLLMProvider();
    
    if (defaultEndpoint) {
      defaultConfig.llmEndpoint = defaultEndpoint;
    }
    
    // 只有当用户没有自定义配置时才更新提供商
    if (!localStorage.getItem(STORAGE_KEY)) {
      defaultConfig.llmProvider = defaultProvider;
    }
    
    return defaultConfig;
  },

  // 保存配置
  save(config: APIConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  },

  // 清除配置
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    
    // 检查环境变量中是否有API密钥，如果有则自动保存到本地存储
    const envTavilyKey = getDefaultTavilyApiKey();
    const envGeminiKey = typeof window !== 'undefined' ? 
      (window as any)['env']?.VITE_GEMINI_API_KEY || process?.env?.VITE_GEMINI_API_KEY :
      process?.env?.VITE_GEMINI_API_KEY;
    
    if (envTavilyKey && envGeminiKey) {
      // 创建一个包含环境变量配置的新配置对象
      const envConfig: APIConfig = {
        ...DEFAULT_API_CONFIG,
        searchProvider: 'tavily',
        searchApiKey: envTavilyKey,
        llmProvider: getDefaultLLMProvider(),
        llmApiKey: envGeminiKey,
        llmEndpoint: getDefaultLLMEndpoint(),
        llmModelFast: getDefaultGeminiModelFast(),
        llmModelDeep: getDefaultGeminiModelDeep(),
        enabled: true, // 自动启用
      };
      
      // 保存环境变量配置到本地存储
      localStorage.setItem(STORAGE_KEY, JSON.stringify(envConfig));
    }
  },

  // 检查是否有有效的自定义配置
  hasCustomConfig(): boolean {
    const config = this.get();
    
    // 检查本地存储中是否存在用户自定义配置
    const hasLocalStorageConfig = !!localStorage.getItem(STORAGE_KEY);
    
    if (hasLocalStorageConfig) {
      // 如果本地存储中有配置，则使用该配置的enabled状态
      return config.enabled && !!config.searchApiKey && !!config.llmApiKey;
    } else {
      // 如果没有本地存储配置，检查环境变量中是否有API密钥
      // 如果环境变量中有密钥，则自动认为已启用自定义配置
      const envTavilyKey = getDefaultTavilyApiKey();
      const envGeminiKey = typeof window !== 'undefined' ? 
        (window as any)['env']?.VITE_GEMINI_API_KEY || process?.env?.VITE_GEMINI_API_KEY :
        process?.env?.VITE_GEMINI_API_KEY;
      
      if (envTavilyKey && envGeminiKey) {
        return true; // 环境变量中有密钥，自动启用
      }
      
      // 否则按照原来的逻辑
      return config.enabled && !!config.searchApiKey && !!config.llmApiKey;
    }
  },
  
  // 检查是否仅使用环境变量中的配置
  hasEnvConfigOnly(): boolean {
    const config = this.get();
    const hasLocalStorageConfig = !!localStorage.getItem(STORAGE_KEY);
    
    if (hasLocalStorageConfig) {
      return false; // 有本地存储配置，不是仅使用环境变量
    }
    
    // 检查环境变量中是否有API密钥
    const envTavilyKey = getDefaultTavilyApiKey();
    const envGeminiKey = typeof window !== 'undefined' ? 
      (window as any)['env']?.VITE_GEMINI_API_KEY || process?.env?.VITE_GEMINI_API_KEY :
      process?.env?.VITE_GEMINI_API_KEY;
    
    return !!(envTavilyKey && envGeminiKey);
  },
};
