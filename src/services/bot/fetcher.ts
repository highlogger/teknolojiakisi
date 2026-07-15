import RssParser from "rss-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import prisma from "@/lib/db";
import { botLogger as log } from "@/lib/logger";
import type { FetchedArticle, SourceType, SourceLanguage } from "@/types";

const rssParser = new RssParser({
  timeout: 15000,
  headers: {
    "User-Agent": "TeknolojiAkisiBot/1.0 (RSS Reader; teknolojiakisi.com.tr)",
  },
});

/**
 * RSS feed'den haberleri çeker
 */
async function fetchFromRSS(
  feedUrl: string,
  sourceId: string,
  sourceName: string,
  language: SourceLanguage
): Promise<FetchedArticle[]> {
  try {
    const feed = await rssParser.parseURL(feedUrl);
    const articles: FetchedArticle[] = [];

    for (const item of feed.items || []) {
      if (!item.title || !item.link) continue;

      // İçeriği temizle
      const content = item.contentSnippet || item.content || item.summary || "";

      articles.push({
        title: item.title.trim(),
        url: item.link,
        content: cleanHtml(content).substring(0, 3000),
        excerpt: item.contentSnippet?.substring(0, 250) || "",
        imageUrl: extractImageFromRSSItem(item),
        publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        sourceId,
        sourceName,
        language,
      });
    }

    return articles;
  } catch (error) {
    log.error(`RSS hatası (${sourceName}):`, (error as Error).message);
    return [];
  }
}

/**
 * Web scraping ile haberleri çeker (CSS selector bazlı)
 */
async function fetchFromWeb(
  source: {
    id: string;
    name: string;
    url: string;
    language: string;
    selectorTitle?: string | null;
    selectorContent?: string | null;
    selectorImage?: string | null;
    selectorLink?: string | null;
  }
): Promise<FetchedArticle[]> {
  try {
    const { data } = await axios.get(source.url, {
      timeout: 15000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    const $ = cheerio.load(data);
    const articles: FetchedArticle[] = [];

    // Varsayılan selector'ler
    const titleSel = source.selectorTitle || "article h2 a, article h3 a, .post-title a, .entry-title a";
    const linkSel = source.selectorLink || source.selectorTitle || "article h2 a, article h3 a";
    const imageSel = source.selectorImage || "article img, .post-thumbnail img";

    $(titleSel).each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const url = $el.attr("href") || "";

      if (title && url && title.length > 10) {
        articles.push({
          title,
          url: url.startsWith("http") ? url : new URL(url, source.url).href,
          content: "",
          sourceId: source.id,
          sourceName: source.name,
          language: source.language as SourceLanguage,
        });
      }
    });

    // Resim URL'lerini ekle
    $(imageSel).each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      // Basitçe ilk resmi al, daha sonra geliştirilebilir
    });

    return articles.slice(0, 10);
  } catch (error) {
    log.error(`Web scraping hatası (${source.name}):`, (error as Error).message);
    return [];
  }
}

/**
 * Tek bir kaynaktan haberleri çeker
 */
export async function fetchFromSource(
  source: {
    id: string;
    name: string;
    url: string;
    type: string;
    feedUrl?: string | null;
    language: string;
    selectorTitle?: string | null;
    selectorContent?: string | null;
    selectorImage?: string | null;
    selectorLink?: string | null;
  }
): Promise<FetchedArticle[]> {
  const sourceType = source.type as SourceType;
  const language = source.language as SourceLanguage;

  if (sourceType === "rss" && source.feedUrl) {
    return fetchFromRSS(source.feedUrl, source.id, source.name, language);
  }

  if (sourceType === "web") {
    return fetchFromWeb(source);
  }

  return [];
}

/**
 * Son 24 saatteki haberleri filtreler
 */
export function filterRecentArticles(
  articles: FetchedArticle[],
  hoursBack: number = 24
): FetchedArticle[] {
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return articles.filter((a) => {
    if (!a.publishedAt) return true; // Tarihsiz haberleri dahil et
    return a.publishedAt >= cutoff;
  });
}

/**
 * Daha önce işlenmiş haberleri filtreler
 */
export async function filterProcessedArticles(
  articles: FetchedArticle[]
): Promise<FetchedArticle[]> {
  const urls = articles.map((a) => a.url).filter(Boolean);

  const existing = await prisma.article.findMany({
    where: { originalUrl: { in: urls } },
    select: { originalUrl: true },
  });

  const existingUrls = new Set(
    existing.map((e) => e.originalUrl).filter(Boolean)
  );

  return articles.filter((a) => !existingUrls.has(a.url));
}

// --- Yardımcı fonksiyonlar ---

function cleanHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[^;]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageFromRSSItem(item: RssParser.Item): string | undefined {
  // Önce enclosure'ı kontrol et
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }

  // content içinde ilk <img> etiketini ara
  const content = item.content || (item as Record<string, unknown>)["content:encoded"] as string || "";
  const imgMatch = content?.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  // media:content veya media:thumbnail
  const mediaContent = (item as Record<string, unknown>)["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  const mediaThumbnail = (item as Record<string, unknown>)["media:thumbnail"] as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  return undefined;
}
