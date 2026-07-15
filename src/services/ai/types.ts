/**
 * AI Core Engine — Merkezi Tip Tanımlamaları
 *
 * Tüm AI modülleri bu tipleri kullanır.
 * any kullanımından kaçınılır.
 */

// ─── Provider ───────────────────────────────────────────────

export type AIProvider = "deepseek" | "openai" | "gemini" | "claude";

// ─── Model ──────────────────────────────────────────────────

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  maxTokens: number;
  supportsJSON: boolean;
  supportsStreaming: boolean;
}

// ─── Client Options ─────────────────────────────────────────

export interface AIClientOptions {
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  maxRetries?: number;
  responseFormat?: "text" | "json_object";
  stream?: boolean;
}

// ─── Message ────────────────────────────────────────────────

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ─── Chat Request ───────────────────────────────────────────

export interface AIChatRequest {
  messages: AIMessage[];
  options?: Omit<AIClientOptions, "stream">;
}

// ─── Chat Response — Standard ───────────────────────────────

export interface AIChatResponse {
  success: boolean;
  provider: AIProvider;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration: number; // ms
  metadata?: {
    finishReason?: string;
    requestId?: string;
    cached?: boolean;
  };
  error?: AIErrorDetails;
}

// ─── JSON Chat Response ─────────────────────────────────────

export interface AIJSONResponse<T = Record<string, unknown>> extends AIChatResponse {
  parsed: T;
}

// ─── Stream Chunk ───────────────────────────────────────────

export interface AIStreamChunk {
  content: string;
  finishReason?: string | null;
  index: number;
}

// ─── AI Error ───────────────────────────────────────────────

export type AIErrorCode =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "JSON_PARSE_ERROR"
  | "PROVIDER_ERROR"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

export interface AIErrorDetails {
  code: AIErrorCode;
  message: string;
  provider?: AIProvider;
  statusCode?: number;
  retryable: boolean;
  raw?: unknown;
}

// ─── Prompt ─────────────────────────────────────────────────

export interface PromptTemplate {
  name: string;
  version: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

// ─── Provider Config ────────────────────────────────────────

export interface ProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseURL: string;
  defaultModel: string;
  models: AIModel[];
}

// ─── Retry Config ───────────────────────────────────────────

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableCodes: AIErrorCode[];
}
