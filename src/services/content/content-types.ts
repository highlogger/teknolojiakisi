/**
 * Content Engine — Extensible Content Type System
 *
 * İleride News, Review, Guide, Comparison, Opinion, Interview, Video, Podcast, Live Blog desteklenecek.
 * Henüz sadece News kullanılıyor.
 */

import type { ContentType } from "./types";
import { CONTENT_TYPE } from "./types";

// ─── Content Type Registry ─────────────────────────────────

export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  labelTr: string;
  description: string;
  icon: string;
  requiresMedia: boolean;
  requiresSource: boolean;
  defaultStatus: string;
  enabled: boolean; // Henüz kullanımda değilse false
}

const contentTypeRegistry = new Map<ContentType, ContentTypeConfig>();

// ─── Register Content Types ────────────────────────────────

function register(config: ContentTypeConfig): void {
  contentTypeRegistry.set(config.type, config);
}

register({
  type: CONTENT_TYPE.NEWS,
  label: "News",
  labelTr: "Haber",
  description: "Güncel teknoloji haberi",
  icon: "📰",
  requiresMedia: false,
  requiresSource: true,
  defaultStatus: "draft",
  enabled: true,
});

register({
  type: CONTENT_TYPE.REVIEW,
  label: "Review",
  labelTr: "İnceleme",
  description: "Ürün/hizmet incelemesi",
  icon: "⭐",
  requiresMedia: true,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.GUIDE,
  label: "Guide",
  labelTr: "Rehber",
  description: "Adım adım rehber/tutorial",
  icon: "📖",
  requiresMedia: false,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.COMPARISON,
  label: "Comparison",
  labelTr: "Karşılaştırma",
  description: "İki veya daha fazla ürünün karşılaştırması",
  icon: "⚖️",
  requiresMedia: false,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.OPINION,
  label: "Opinion",
  labelTr: "Görüş",
  description: "Yazar görüşü/analizi",
  icon: "💭",
  requiresMedia: false,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.INTERVIEW,
  label: "Interview",
  labelTr: "Röportaj",
  description: "Soru-cevap formatında röportaj",
  icon: "🎙️",
  requiresMedia: true,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.VIDEO,
  label: "Video",
  labelTr: "Video",
  description: "Video içeriği",
  icon: "🎬",
  requiresMedia: true,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.PODCAST,
  label: "Podcast",
  labelTr: "Podcast",
  description: "Ses içeriği",
  icon: "🎧",
  requiresMedia: true,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

register({
  type: CONTENT_TYPE.LIVE_BLOG,
  label: "Live Blog",
  labelTr: "Canlı Blog",
  description: "Canlı güncellenen içerik",
  icon: "🔴",
  requiresMedia: false,
  requiresSource: false,
  defaultStatus: "draft",
  enabled: false,
});

// ─── Public API ────────────────────────────────────────────

export function getContentTypeConfig(type: ContentType): ContentTypeConfig | undefined {
  return contentTypeRegistry.get(type);
}

export function getEnabledContentTypes(): ContentTypeConfig[] {
  return Array.from(contentTypeRegistry.values()).filter((c) => c.enabled);
}

export function getAllContentTypes(): ContentTypeConfig[] {
  return Array.from(contentTypeRegistry.values());
}

export function isContentTypeEnabled(type: ContentType): boolean {
  return contentTypeRegistry.get(type)?.enabled ?? false;
}
