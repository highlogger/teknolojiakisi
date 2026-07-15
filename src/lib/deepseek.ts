/**
 * Deepseek API wrapper — Geriye dönük uyumlu
 *
 * Bu dosya artık AI Core Engine'i kullanır.
 * Mevcut tüm import'lar çalışmaya devam eder.
 *
 * @deprecated Yeni kodda doğrudan `import { ai } from "@/services/ai"` kullanın.
 */

import OpenAI from "openai";
import { ai } from "@/services/ai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
});

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  userPrompt: string;
  responseFormat?: "text" | "json_object";
}

/**
 * Deepseek API'ye istek atar ve yanıtı döner
 */
export async function chat(options: ChatOptions): Promise<{
  content: string;
  promptTokens: number;
  completionTokens: number;
}> {
  const response = await ai.simple(options.systemPrompt, options.userPrompt, {
    model: options.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    responseFormat: options.responseFormat,
  });

  return {
    content: response.content,
    promptTokens: response.usage.promptTokens,
    completionTokens: response.usage.completionTokens,
  };
}

/**
 * JSON formatında yanıt almak için
 */
export async function chatJSON<T>(
  options: Omit<ChatOptions, "responseFormat">
): Promise<{
  data: T;
  promptTokens: number;
  completionTokens: number;
}> {
  const response = await ai.simpleJSON<T>(
    options.systemPrompt,
    options.userPrompt,
    {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    }
  );

  if (!response.success || !response.parsed) {
    throw new Error(`Failed to parse JSON from AI response`);
  }

  return {
    data: response.parsed,
    promptTokens: response.usage.promptTokens,
    completionTokens: response.usage.completionTokens,
  };
}

export default deepseek;
