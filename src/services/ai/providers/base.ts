/**
 * AI Core Engine — Provider Interface
 *
 * Tüm AI sağlayıcıları bu interface'i implemente eder.
 */

import type {
  AIMessage,
  AIClientOptions,
  AIStreamChunk,
  AIProvider as ProviderType,
} from "../types";

export interface AIProviderInterface {
  /** Sağlayıcı adı */
  readonly name: ProviderType;

  /** Model adı */
  readonly model: string;

  /**
   * Chat completion (text veya JSON)
   */
  chat(
    messages: AIMessage[],
    options?: AIClientOptions
  ): Promise<{
    content: string;
    promptTokens: number;
    completionTokens: number;
  }>;

  /**
   * Streaming chat completion
   */
  chatStream(
    messages: AIMessage[],
    options?: AIClientOptions
  ): AsyncGenerator<AIStreamChunk, void, unknown>;
}

/**
 * Provider yapılandırması
 */
export interface ProviderConstructorParams {
  apiKey: string;
  baseURL: string;
  model?: string;
}
