/**
 * Entity Intelligence Engine — Configuration
 *
 * Merkezi entity ayarları.
 */

import type { EntityType } from "./types";
import { ENTITY_TYPE as E } from "./types";

// ─── AI Model ───────────────────────────────────────────────

export const ENTITY_EXTRACTION_MODEL = "deepseek-chat";
export const ENTITY_EXTRACTION_TEMPERATURE = 0.2; // Düşük — tutarlı çıktı
export const ENTITY_EXTRACTION_MAX_TOKENS = 2048;

// ─── Confidence Thresholds ──────────────────────────────────

export const CONFIDENCE_HIGH = 0.8;
export const CONFIDENCE_MEDIUM = 0.5;
export const CONFIDENCE_LOW = 0.3;
export const MIN_CONFIDENCE_FOR_STORAGE = 0.4; // Bu değerin altındaki entity'ler saklanmaz

// ─── Entity Type Labels ─────────────────────────────────────

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  person: "Kişi",
  company: "Şirket",
  product: "Ürün",
  software: "Yazılım",
  hardware: "Donanım",
  technology: "Teknoloji",
  programming_language: "Programlama Dili",
  framework: "Framework",
  operating_system: "İşletim Sistemi",
  game: "Oyun",
  movie: "Film",
  event: "Etkinlik",
  conference: "Konferans",
  country: "Ülke",
  city: "Şehir",
  organization: "Organizasyon",
  cryptocurrency: "Kripto Para",
  stock: "Hisse Senedi",
  website: "Web Sitesi",
  service: "Servis",
  device: "Cihaz",
  browser: "Tarayıcı",
  social_platform: "Sosyal Platform",
  ai_model: "AI Model",
  ai_company: "AI Şirketi",
  university: "Üniversite",
  research_paper: "Araştırma Makalesi",
  patent: "Patent",
};

// ─── Resolver Config ────────────────────────────────────────

export const RESOLVER_CONFIG = {
  /** Fuzzy match için minimum benzerlik skoru */
  minFuzzyScore: 0.85,
  /** AI resolver için minimum confidence */
  minAIResolverConfidence: 0.7,
  /** Maksimum alias sayısı */
  maxAliases: 10,
};

// ─── Known Entity Aliases ───────────────────────────────────

/** Sık karışan entity isimleri için önceden tanımlı alias'lar */
export const KNOWN_ALIASES: Record<string, string[]> = {
  OpenAI: ["Open AI", "Open-AI", "openai"],
  Google: ["Google Inc", "Google LLC", "Alphabet"],
  Microsoft: ["MS", "MSFT", "Microsoft Corp"],
  Apple: ["Apple Inc", "Apple Computer"],
  Meta: ["Facebook", "Meta Platforms"],
  Amazon: ["Amazon.com", "AWS"],
  NVIDIA: ["Nvidia", "nVidia"],
  Tesla: ["Tesla Motors", "Tesla Inc"],
  SpaceX: ["Space X", "Space-X"],
  ChatGPT: ["Chat GPT", "Chat-GPT"],
  GitHub: ["Github", "github.com"],
  YouTube: ["Youtube", "youtube.com"],
  Twitter: ["X", "x.com", "Twitter/X"],
  Instagram: ["IG", "insta"],
  WhatsApp: ["Whats App", "whatsapp"],
  DeepSeek: ["Deep Seek", "Deepseek"],
  Claude: ["Claude AI", "Anthropic Claude"],
  Gemini: ["Google Gemini", "Gemini AI"],
};
