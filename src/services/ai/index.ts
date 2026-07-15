/**
 * AI Core Engine v1
 *
 * Tüm yapay zeka işlemleri için tek giriş noktası.
 *
 * Kullanım:
 *   import { ai, AIClient } from "@/services/ai";
 *   const response = await ai.simple(systemPrompt, userPrompt);
 *   const json = await ai.chatJSONWithPrompt("seo-optimization", content);
 */

// ─── Client ─────────────────────────────────────────────────
export { AIClient, ai } from "./client";

// ─── Prompt Yönetimi ────────────────────────────────────────
export {
  registerPrompt,
  getPrompt,
  listPrompts,
  findPrompt,
} from "./prompts/registry";

// ─── Provider ───────────────────────────────────────────────
export { DeepSeekProvider } from "./providers/deepseek";
export type { AIProviderInterface, ProviderConstructorParams } from "./providers/base";

// ─── Hata Yönetimi ──────────────────────────────────────────
export {
  AIError,
  networkError,
  timeoutError,
  rateLimitError,
  jsonParseError,
  providerError,
  validationError,
  classifyError,
} from "./errors";

// ─── Konfigürasyon ──────────────────────────────────────────
export {
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  AI_MODELS,
  PROVIDER_CONFIGS,
  DEFAULT_CLIENT_OPTIONS,
  RETRY_CONFIG,
  TOKEN_LIMITS,
} from "./config";

// ─── Logger ─────────────────────────────────────────────────
export { aiLogger } from "./logger";

// ─── Tipler ─────────────────────────────────────────────────
export type {
  AIProvider,
  AIModel,
  AIClientOptions,
  AIMessage,
  AIChatRequest,
  AIChatResponse,
  AIJSONResponse,
  AIStreamChunk,
  AIErrorCode,
  AIErrorDetails,
  PromptTemplate,
  ProviderConfig,
  RetryConfig,
} from "./types";
