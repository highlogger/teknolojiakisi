/**
 * AI Core Engine — Client
 *
 * Tek AI giriş noktası.
 * Görevleri: model seçimi, token yönetimi, retry, timeout, JSON mode, streaming, hata yönetimi.
 */

import type {
  AIProvider as ProviderType,
  AIMessage,
  AIClientOptions,
  AIChatResponse,
  AIJSONResponse,
  AIStreamChunk,
  PromptTemplate,
} from "./types";
import { AIError, classifyError } from "./errors";
import { AI_MODELS, DEFAULT_CLIENT_OPTIONS, RETRY_CONFIG } from "./config";
import { getPrompt } from "./prompts/registry";
import { aiLogger as log } from "./logger";

// Lazy-load provider
let DeepSeekProvider: typeof import("./providers/deepseek").DeepSeekProvider;
let cachedProvider: import("./providers/base").AIProviderInterface | null = null;

async function getProvider(
  provider?: ProviderType,
  model?: string
): Promise<import("./providers/base").AIProviderInterface> {
  const p = provider || "deepseek";

  if (cachedProvider && cachedProvider.name === p) {
    return cachedProvider;
  }

  switch (p) {
    case "deepseek": {
      if (!DeepSeekProvider) {
        DeepSeekProvider = (await import("./providers/deepseek")).DeepSeekProvider;
      }
      cachedProvider = new DeepSeekProvider({
        apiKey: process.env.DEEPSEEK_API_KEY || "",
        baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
        model: model || "deepseek-chat",
      });
      return cachedProvider;
    }
    case "openai":
      throw new AIError({
        code: "PROVIDER_ERROR",
        message: "OpenAI provider henüz implemente edilmedi",
        provider: "openai",
        retryable: false,
      });
    case "gemini":
      throw new AIError({
        code: "PROVIDER_ERROR",
        message: "Gemini provider henüz implemente edilmedi",
        provider: "gemini",
        retryable: false,
      });
    case "claude":
      throw new AIError({
        code: "PROVIDER_ERROR",
        message: "Claude provider henüz implemente edilmedi",
        provider: "claude",
        retryable: false,
      });
    default:
      throw new AIError({
        code: "VALIDATION_ERROR",
        message: `Bilinmeyen provider: ${p}`,
        retryable: false,
      });
  }
}

// ─── Yardımcı ───────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── AI Client ──────────────────────────────────────────────

export class AIClient {
  private options: AIClientOptions;

  constructor(options?: AIClientOptions) {
    this.options = {
      ...DEFAULT_CLIENT_OPTIONS,
      ...options,
    };
  }

  /**
   * Chat completion — ana metot
   */
  async chat(
    messages: AIMessage[],
    options?: AIClientOptions
  ): Promise<AIChatResponse> {
    const opts = { ...this.options, ...options };
    const start = Date.now();
    const provider = await getProvider(opts.provider, opts.model);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (opts.maxRetries ?? RETRY_CONFIG.maxRetries); attempt++) {
      try {
        const result = await provider.chat(messages, opts);

        log.info("AI chat completed", {
          provider: provider.name,
          model: provider.model,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
        });

        return {
          success: true,
          provider: provider.name,
          model: provider.model,
          content: result.content,
          usage: {
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            totalTokens: result.promptTokens + result.completionTokens,
          },
          duration: Date.now() - start,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const aiError = classifyError(error, provider.name);

        if (
          attempt < (opts.maxRetries ?? RETRY_CONFIG.maxRetries) &&
          aiError.retryable
        ) {
          const delay = Math.min(
            RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
            RETRY_CONFIG.maxDelay
          );
          log.warn(`Retry ${attempt + 1}/${opts.maxRetries} after ${delay}ms`, {
            error: aiError.message,
          });
          await sleep(delay);
          continue;
        }

        log.error("AI chat failed", aiError);
        return {
          success: false,
          provider: provider.name,
          model: provider.model,
          content: "",
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          duration: Date.now() - start,
          error: aiError.toJSON(),
        };
      }
    }

    // Should never reach here but TypeScript needs it
    return {
      success: false,
      provider: provider.name,
      model: provider.model,
      content: "",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      duration: Date.now() - start,
      error: classifyError(lastError, provider.name).toJSON(),
    };
  }

  /**
   * JSON chat completion
   */
  async chatJSON<T = Record<string, unknown>>(
    messages: AIMessage[],
    options?: AIClientOptions
  ): Promise<AIJSONResponse<T>> {
    const response = await this.chat(messages, {
      ...options,
      responseFormat: "json_object",
    });

    if (!response.success) {
      return { ...response, parsed: {} as T };
    }

    // JSON parse dene
    try {
      const parsed = JSON.parse(response.content) as T;
      return { ...response, parsed };
    } catch {
      // Code block içinde JSON ara
      const jsonMatch = response.content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]) as T;
          return { ...response, parsed };
        } catch {
          // ikinci deneme de başarısız
        }
      }

      log.warn("JSON parse failed for AI response");
      return {
        ...response,
        success: false,
        error: {
          code: "JSON_PARSE_ERROR",
          message: "Failed to parse AI response as JSON",
          retryable: false,
        },
        parsed: {} as T,
      };
    }
  }

  /**
   * Prompt ile chat
   */
  async chatWithPrompt(
    promptName: string,
    userContent: string,
    options?: AIClientOptions
  ): Promise<AIChatResponse> {
    const prompt = getPrompt(promptName);
    if (!prompt) {
      throw new AIError({
        code: "VALIDATION_ERROR",
        message: `Prompt bulunamadı: ${promptName}`,
        retryable: false,
      });
    }

    return this.chat(
      [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: userContent },
      ],
      {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        responseFormat: prompt.responseFormat,
        ...options,
      }
    );
  }

  /**
   * Prompt ile JSON chat
   */
  async chatJSONWithPrompt<T = Record<string, unknown>>(
    promptName: string,
    userContent: string,
    options?: AIClientOptions
  ): Promise<AIJSONResponse<T>> {
    const prompt = getPrompt(promptName);
    if (!prompt) {
      throw new AIError({
        code: "VALIDATION_ERROR",
        message: `Prompt bulunamadı: ${promptName}`,
        retryable: false,
      });
    }

    return this.chatJSON<T>(
      [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: userContent },
      ],
      {
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        ...options,
      }
    );
  }

  /**
   * Streaming chat
   */
  async *chatStream(
    messages: AIMessage[],
    options?: AIClientOptions
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    const opts = { ...this.options, ...options };
    const provider = await getProvider(opts.provider, opts.model);
    yield* provider.chatStream(messages, opts);
  }

  /**
   * Basit prompt (sadece system + user)
   */
  async simple(
    systemPrompt: string,
    userPrompt: string,
    options?: AIClientOptions
  ): Promise<AIChatResponse> {
    return this.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options
    );
  }

  /**
   * Basit JSON prompt
   */
  async simpleJSON<T = Record<string, unknown>>(
    systemPrompt: string,
    userPrompt: string,
    options?: AIClientOptions
  ): Promise<AIJSONResponse<T>> {
    return this.chatJSON<T>(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      options
    );
  }
}

// ─── Singleton ──────────────────────────────────────────────

/** Varsayılan AI Client instance'ı */
export const ai = new AIClient();
