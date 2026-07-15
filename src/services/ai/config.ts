/**
 * AI Core Engine — Merkezi Konfigürasyon
 *
 * Tüm AI ayarları buradan yönetilir.
 * Model isimleri kod içerisine dağılmaz.
 */

import type { ProviderConfig, AIModel, RetryConfig } from "./types";

// ─── Varsayılan Model ───────────────────────────────────────

export const DEFAULT_PROVIDER = "deepseek" as const;
export const DEFAULT_MODEL = "deepseek-chat";

// ─── Model Tanımları ────────────────────────────────────────

export const AI_MODELS: Record<string, AIModel> = {
  // DeepSeek
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek Chat",
    provider: "deepseek",
    maxTokens: 8192,
    supportsJSON: true,
    supportsStreaming: true,
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    name: "DeepSeek Reasoner",
    provider: "deepseek",
    maxTokens: 8192,
    supportsJSON: false,
    supportsStreaming: false,
  },
  // OpenAI (gelecek)
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    maxTokens: 16384,
    supportsJSON: true,
    supportsStreaming: true,
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    maxTokens: 16384,
    supportsJSON: true,
    supportsStreaming: true,
  },
  // Gemini (gelecek)
  "gemini-2.5-pro": {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "gemini",
    maxTokens: 32768,
    supportsJSON: true,
    supportsStreaming: true,
  },
  // Claude (gelecek)
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "claude",
    maxTokens: 8192,
    supportsJSON: true,
    supportsStreaming: true,
  },
};

// ─── Provider Konfigürasyonları ─────────────────────────────

export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  deepseek: {
    provider: "deepseek",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    defaultModel: "deepseek-chat",
    models: [AI_MODELS["deepseek-chat"], AI_MODELS["deepseek-reasoner"]],
  },
  openai: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY || "",
    baseURL: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: [AI_MODELS["gpt-4o"], AI_MODELS["gpt-4o-mini"]],
  },
  gemini: {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY || "",
    baseURL: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.5-pro",
    models: [AI_MODELS["gemini-2.5-pro"]],
  },
  claude: {
    provider: "claude",
    apiKey: process.env.CLAUDE_API_KEY || "",
    baseURL: "https://api.anthropic.com/v1",
    defaultModel: "claude-sonnet-4-6",
    models: [AI_MODELS["claude-sonnet-4-6"]],
  },
};

// ─── Varsayılan Client Ayarları ─────────────────────────────

export const DEFAULT_CLIENT_OPTIONS = {
  temperature: 0.7,
  maxTokens: 4096,
  timeout: 60000, // 60 saniye
  maxRetries: 3,
  responseFormat: "text" as const,
};

// ─── Retry Konfigürasyonu ───────────────────────────────────

export const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,   // 1 saniye
  maxDelay: 30000,   // 30 saniye
  retryableCodes: [
    "NETWORK_ERROR",
    "TIMEOUT",
    "RATE_LIMIT",
    "PROVIDER_ERROR",
  ],
};

// ─── Token Limitleri ─────────────────────────────────────────

export const TOKEN_LIMITS = {
  DEFAULT_MAX_TOKENS: 4096,
  CATEGORY_CLASSIFICATION: 50,
  TRANSLATION: 4096,
  QUALITY_CHECK: 4096,
  SEO_OPTIMIZATION: 2048,
  TRENDING_CONTENT: 4096,
  TITLE_GENERATION: 100,
  SUMMARY: 250,
  TAG_GENERATION: 200,
} as const;
