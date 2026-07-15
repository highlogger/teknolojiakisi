/**
 * Scout Agent — AI Newsroom Entry Point
 *
 * Görevi: RSS/Web kaynaklardan yeni teknoloji haberlerini tespit et,
 * duplicate kontrolü yap, Job Queue'ya gönder.
 *
 * HABER YAZMAZ. PUBLISH ETMEZ. REWRITE YAPMAZ.
 * Sadece bulur, filtreler, queue'ya ekler.
 *
 * Sonraki adım: AI Newsroom pipeline (Writer → SEO → Editor → Publisher)
 */

import prisma from "@/lib/db";
import type { AgentInput, AgentOutput } from "@/services/agents/base/types";

export const AGENT_NAME = "Scout Agent";
export const AGENT_VERSION = "1.0.0";

// ─── Types ───────────────────────────────────────────────────

export interface ScoutedArticle {
  id: string;           // Benzersiz keşif ID'si
  title: string;
  url: string;
  content: string;      // Ham içerik (orijinal dilde)
  excerpt: string;
  imageUrl?: string;
  sourceId: string;
  sourceName: string;
  language: string;
  publishedAt?: string;
  discoveredAt: string;
  priority: "breaking" | "high" | "normal" | "low";
  status: "queued" | "processing" | "completed" | "rejected";
}

export interface ScoutResult {
  version: string;
  startedAt: string;
  completedAt: string;
  sourcesChecked: number;
  articlesFound: number;
  articlesQueued: number;
  articlesSkipped: { duplicate: number; nonTech: number; old: number };
  queue: ScoutedArticle[];
  errors: string[];
}

// ─── Main API ────────────────────────────────────────────────

export async function scout(): Promise<ScoutResult> {
  const startTime = new Date();
  const errors: string[] = [];
  const queue: ScoutedArticle[] = [];
  const skipped = { duplicate: 0, nonTech: 0, old: 0 };

  let sourcesChecked = 0;
  let articlesFound = 0;

  try {
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });

    sourcesChecked = sources.length;

    for (const source of sources) {
      try {
        // RSS/Web fetch (mevcut fetcher mantığı)
        const rawArticles = await fetchSourceArticles(source);

        for (const raw of rawArticles) {
          articlesFound++;

          // 1. Tech filter
          if (!isTechRelevant(raw.title, raw.content || raw.excerpt || "")) {
            skipped.nonTech++;
            continue;
          }

          // 2. Duplicate check
          const exists = await prisma.article.findFirst({
            where: { originalUrl: raw.url },
            select: { id: true },
          });
          if (exists) {
            skipped.duplicate++;
            continue;
          }

          // 3. Recent check (48 saat)
          if (raw.publishedAt) {
            const pubDate = new Date(raw.publishedAt);
            const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
            if (hoursAgo > 48) {
              skipped.old++;
              continue;
            }
          }

          // 4. Queue'ya ekle
          const scouted: ScoutedArticle = {
            id: `scout_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
            title: raw.title,
            url: raw.url,
            content: raw.content || raw.excerpt || "",
            excerpt: raw.excerpt || "",
            imageUrl: raw.imageUrl,
            sourceId: source.id,
            sourceName: source.name,
            language: source.language,
            publishedAt: raw.publishedAt,
            discoveredAt: new Date().toISOString(),
            priority: determinePriority(source, raw),
            status: "queued",
          };

          queue.push(scouted);
        }

        // Kaynak fetch zamanını güncelle
        await prisma.source.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date() },
        }).catch(() => {});

      } catch (srcErr) {
        errors.push(`${source.name}: ${srcErr instanceof Error ? srcErr.message : "Bilinmeyen hata"}`);
      }
    }

    // BotLog kaydı
    await prisma.botLog.create({
      data: {
        status: queue.length > 0 ? "success" : "no_new",
        articlesFound,
        articlesGenerated: queue.length,
        articlesPublished: 0,
        durationMs: Date.now() - startTime.getTime(),
      },
    }).catch(() => {});

  } catch (err) {
    errors.push(`Scout hatası: ${err instanceof Error ? err.message : "Bilinmeyen"}`);
  }

  return {
    version: AGENT_VERSION,
    startedAt: startTime.toISOString(),
    completedAt: new Date().toISOString(),
    sourcesChecked,
    articlesFound,
    articlesQueued: queue.length,
    articlesSkipped: skipped,
    queue,
    errors,
  };
}

// ─── Fetch ────────────────────────────────────────────────────

async function fetchSourceArticles(source: {
  id: string; name: string; type: string; feedUrl?: string | null;
  language: string; url: string;
  selectorTitle?: string | null; selectorLink?: string | null;
}): Promise<Array<{
  title: string; url: string; content?: string; excerpt?: string;
  imageUrl?: string; publishedAt?: string;
}>> {
  if (source.type === "rss" && source.feedUrl) {
    return fetchRSS(source.feedUrl, source.name);
  }
  if (source.type === "web") {
    return fetchWeb(source.url, source);
  }
  return [];
}

async function fetchRSS(feedUrl: string, sourceName: string): Promise<Array<{
  title: string; url: string; content?: string; excerpt?: string;
  imageUrl?: string; publishedAt?: string;
}>> {
  try {
    const RssParser = (await import("rss-parser")).default;
    const parser = new RssParser({ timeout: 15000 });
    const feed = await parser.parseURL(feedUrl);

    return (feed.items || [])
      .filter(item => item.title && item.link)
      .map(item => ({
        title: item.title!.trim(),
        url: item.link!,
        content: item.contentSnippet || item.content || item.summary || "",
        excerpt: item.contentSnippet?.substring(0, 250) || "",
        imageUrl: extractImage(item),
        publishedAt: item.pubDate || undefined,
      }));
  } catch {
    return [];
  }
}

async function fetchWeb(url: string, source: {
  selectorTitle?: string | null; selectorLink?: string | null;
}): Promise<Array<{
  title: string; url: string;
}>> {
  try {
    const axios = (await import("axios")).default;
    const cheerio = (await import("cheerio"));
    const { data } = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "TeknolojiAkisi-Scout/1.0", "Accept": "text/html" },
    });

    const $ = cheerio.load(data);
    const titleSel = source.selectorTitle || "article h2 a, article h3 a";
    const results: Array<{ title: string; url: string }> = [];

    $(titleSel).each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr("href") || "";
      if (title && href && title.length > 10) {
        results.push({
          title,
          url: href.startsWith("http") ? href : new URL(href, url).href,
        });
      }
    });

    return results.slice(0, 10);
  } catch {
    return [];
  }
}

// ─── Tech Filter ──────────────────────────────────────────────

const TECH_KEYWORDS = [
  "teknoloji", "yapay zeka", "telefon", "bilgisayar", "laptop", "yazılım", "donanım",
  "internet", "uygulama", "güncelleme", "çip", "işlemci", "robot", "drone", "uzay",
  "oyun", "siber", "veri", "bulut", "kod", "apple", "samsung", "google", "microsoft",
  "tesla", "openai", "nvidia", "intel", "amd", "instagram", "tiktok", "twitter",
  "facebook", "whatsapp", "discord", "telegram", "youtube", "spotify", "netflix",
  "bluetooth", "wifi", "5g", "6g", "ssd", "gpu", "cpu", "api", "blockchain",
  "kripto", "nft", "metaverse", "linux", "windows", "macos", "ios", "android",
  "chatgpt", "gpt", "llm", "claude", "gemini", "copilot", "iphone", "ipad",
  "macbook", "pixel", "galaxy", "playstation", "xbox", "nintendo", "steam",
  "spacex", "nasa", "starlink", "startup",
];

const NON_TECH = [
  /\b(movie|film|cinema|hollywood|oscar|emmy)\b/i,
  /\b(football|soccer|basketball|baseball|nfl|nba|champions)\b/i,
  /\b(cancer|diabetes|therapy|vaccine|clinical)\b/i,
  /\b(fashion|beauty|makeup|skincare|cosmetic)\b/i,
  /\b(election|campaign|democrat|republican|congress|senate)\b/i,
];

function isTechRelevant(title: string, content: string): boolean {
  const text = `${title} ${content}`;
  for (const pattern of NON_TECH) {
    if (pattern.test(text)) return false;
  }
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

// ─── Priority ─────────────────────────────────────────────────

function determinePriority(
  source: { priority: number },
  article: { publishedAt?: string }
): "breaking" | "high" | "normal" | "low" {
  if (source.priority >= 9) return "breaking";
  if (source.priority >= 7) return "high";
  if (article.publishedAt) {
    const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60);
    if (hoursAgo <= 6) return "high";
  }
  return "normal";
}

// ─── Image Extraction ─────────────────────────────────────────

function extractImage(item: Record<string, unknown>): string | undefined {
  if ((item as { enclosure?: { url?: string } }).enclosure?.url)
    return (item as { enclosure: { url: string } }).enclosure.url;
  const content = (item as { content?: string })["content"] ||
    (item as Record<string, string>)["content:encoded"] || "";
  const match = content?.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

// ─── Agent Interface ─────────────────────────────────────────

export async function execute(input: AgentInput): Promise<AgentOutput> {
  const startTime = Date.now();
  try {
    const result = await scout();
    return {
      success: result.articlesQueued > 0 || result.errors.length === 0,
      outputs: { scoutResult: result, queue: result.queue },
      summary: {
        status: result.articlesQueued > 0 ? "SUCCESS" : "NO_NEWS",
        score: result.articlesQueued > 0 ? 100 : 50,
        confidence: 95,
        warnings: [],
        errors: result.errors,
      },
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false, outputs: {},
      summary: { status: "ERROR", score: 0, confidence: 0, warnings: [], errors: [String(error)] },
      duration: Date.now() - startTime,
    };
  }
}

export async function dryRun(input: AgentInput): Promise<AgentOutput> {
  const result = await execute(input);
  return { ...result, summary: { ...result.summary, status: `DRY_RUN: ${result.summary.status}` } };
}

export const scoutAgent = { name: AGENT_NAME, version: AGENT_VERSION, execute, dryRun, scout };
export default scoutAgent;
