/**
 * AI Core Engine — DeepSeek Provider
 *
 * OpenAI-uyumlu API kullanır.
 * DeepSeek Chat ve DeepSeek Reasoner modellerini destekler.
 */

import OpenAI from "openai";
import type {
  AIMessage,
  AIClientOptions,
  AIStreamChunk,
  AIProvider as ProviderType,
} from "../types";
import type { AIProviderInterface, ProviderConstructorParams } from "./base";
import { providerError } from "../errors";

export class DeepSeekProvider implements AIProviderInterface {
  readonly name: ProviderType = "deepseek";
  readonly model: string;
  private client: OpenAI;

  constructor(params: ProviderConstructorParams) {
    this.model = params.model || "deepseek-chat";
    this.client = new OpenAI({
      apiKey: params.apiKey,
      baseURL: params.baseURL,
    });
  }

  async chat(
    messages: AIMessage[],
    options?: AIClientOptions
  ): Promise<{
    content: string;
    promptTokens: number;
    completionTokens: number;
  }> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        response_format:
          options?.responseFormat === "json_object"
            ? { type: "json_object" }
            : undefined,
      });

      const content = response.choices[0]?.message?.content || "";

      return {
        content,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      };
    } catch (error) {
      throw providerError(
        (error as Error).message || "Unknown error",
        "deepseek",
        (error as { status?: number }).status
      );
    }
  }

  async *chatStream(
    messages: AIMessage[],
    options?: AIClientOptions
  ): AsyncGenerator<AIStreamChunk, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options?.model || this.model,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      });

      for await (const chunk of stream) {
        yield {
          content: chunk.choices[0]?.delta?.content || "",
          finishReason: chunk.choices[0]?.finish_reason,
          index: chunk.choices[0]?.index || 0,
        };
      }
    } catch (error) {
      throw providerError(
        (error as Error).message || "Unknown error",
        "deepseek",
        (error as { status?: number }).status
      );
    }
  }
}
