/**
 * AI Core Engine — Hata Yönetimi
 *
 * Tüm AI hatalarını standart formata çevirir.
 */

import type { AIErrorCode, AIErrorDetails, AIProvider } from "./types";

/**
 * AI hatası sınıfı
 */
export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly provider?: AIProvider;
  public readonly statusCode?: number;
  public readonly retryable: boolean;
  public readonly raw?: unknown;

  constructor(details: AIErrorDetails) {
    super(details.message);
    this.name = "AIError";
    this.code = details.code;
    this.provider = details.provider;
    this.statusCode = details.statusCode;
    this.retryable = details.retryable;
    this.raw = details.raw;
  }

  toJSON(): AIErrorDetails {
    return {
      code: this.code,
      message: this.message,
      provider: this.provider,
      statusCode: this.statusCode,
      retryable: this.retryable,
      raw: this.raw,
    };
  }
}

// ─── Hata Fabrikası ─────────────────────────────────────────

export function networkError(message: string, provider?: AIProvider): AIError {
  return new AIError({
    code: "NETWORK_ERROR",
    message: `Network error: ${message}`,
    provider,
    retryable: true,
  });
}

export function timeoutError(timeoutMs: number, provider?: AIProvider): AIError {
  return new AIError({
    code: "TIMEOUT",
    message: `Request timed out after ${timeoutMs}ms`,
    provider,
    retryable: true,
  });
}

export function rateLimitError(provider?: AIProvider, raw?: unknown): AIError {
  return new AIError({
    code: "RATE_LIMIT",
    message: "Rate limit exceeded. Please wait before retrying.",
    provider,
    retryable: true,
    raw,
  });
}

export function jsonParseError(content: string, provider?: AIProvider): AIError {
  return new AIError({
    code: "JSON_PARSE_ERROR",
    message: `Failed to parse AI response as JSON`,
    provider,
    retryable: false,
    raw: { content: content.substring(0, 500) },
  });
}

export function providerError(
  message: string,
  provider: AIProvider,
  statusCode?: number
): AIError {
  return new AIError({
    code: "PROVIDER_ERROR",
    message: `Provider error (${provider}): ${message}`,
    provider,
    statusCode,
    retryable: statusCode ? statusCode >= 500 : true,
  });
}

export function validationError(message: string): AIError {
  return new AIError({
    code: "VALIDATION_ERROR",
    message: `Validation error: ${message}`,
    retryable: false,
  });
}

/**
 * Genel hatayı AIError'a dönüştür
 */
export function classifyError(
  error: unknown,
  provider?: AIProvider
): AIError {
  if (error instanceof AIError) return error;

  const message = error instanceof Error ? error.message : String(error);

  // Network hataları
  if (
    message.includes("ECONNREFUSED") ||
    message.includes("ENOTFOUND") ||
    message.includes("ETIMEDOUT") ||
    message.includes("fetch failed")
  ) {
    return networkError(message, provider);
  }

  // Timeout
  if (
    message.includes("timeout") ||
    message.includes("timed out")
  ) {
    return timeoutError(60000, provider);
  }

  // Rate limit
  if (
    message.includes("429") ||
    message.includes("rate") ||
    message.includes("too many requests")
  ) {
    return rateLimitError(provider, error);
  }

  // Provider hatası
  if (message.includes("401") || message.includes("403")) {
    return providerError("Authentication failed", provider || "deepseek", 401);
  }

  return new AIError({
    code: "UNKNOWN_ERROR",
    message,
    provider,
    retryable: false,
    raw: error,
  });
}
