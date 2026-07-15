/**
 * Topic Hub System — Merkezi Konu Yönetimi
 *
 * Konu sayfaları, topic ilişkileri, topic bazlı içerik sorguları.
 * SEO, internal linking ve Discover için temel.
 */
import prisma from "@/lib/db";

// ─── Topic Registry ──────────────────────────────────────────

export const TOPIC_REGISTRY: Record<string, TopicDefinition> = {
  openai: { name: "OpenAI", slug: "openai", category: "yapay-zeka", keywords: ["GPT", "ChatGPT", "DALL-E", "Sam Altman"], icon: "🤖" },
  chatgpt: { name: "ChatGPT", slug: "chatgpt", category: "yapay-zeka", keywords: ["GPT-4", "GPT-5", "OpenAI"], icon: "💬" },
  google: { name: "Google", slug: "google", category: "web", keywords: ["Gemini", "Android", "Chrome", "Pixel"], icon: "🔍" },
  apple: { name: "Apple", slug: "apple", category: "mobil", keywords: ["iPhone", "iPad", "Mac", "iOS", "Vision Pro"], icon: "🍎" },
  microsoft: { name: "Microsoft", slug: "microsoft", category: "yazilim", keywords: ["Windows", "Copilot", "Azure", "Office"], icon: "🪟" },
  meta: { name: "Meta", slug: "meta", category: "sosyal-medya", keywords: ["Facebook", "Instagram", "WhatsApp", "Threads", "Llama"], icon: "👤" },
  nvidia: { name: "NVIDIA", slug: "nvidia", category: "donanim", keywords: ["RTX", "GPU", "CUDA", "AI"], icon: "🟢" },
  tesla: { name: "Tesla", slug: "tesla", category: "otomotiv", keywords: ["EV", "FSD", "Cybertruck", "Optimus"], icon: "⚡" },
  samsung: { name: "Samsung", slug: "samsung", category: "mobil", keywords: ["Galaxy", "One UI", "Exynos"], icon: "📱" },
  deepseek: { name: "DeepSeek", slug: "deepseek", category: "yapay-zeka", keywords: ["V3", "R1", "API"], icon: "🧠" },
  claude: { name: "Claude", slug: "claude", category: "yapay-zeka", keywords: ["Anthropic", "Sonnet", "Opus"], icon: "🤖" },
  gemini: { name: "Gemini", slug: "gemini", category: "yapay-zeka", keywords: ["Google", "AI", "Pro", "Ultra"], icon: "🌟" },
  xiaomi: { name: "Xiaomi", slug: "xiaomi", category: "mobil", keywords: ["Redmi", "POCO", "HyperOS"], icon: "📲" },
  amazon: { name: "Amazon", slug: "amazon", category: "web", keywords: ["AWS", "Alexa", "Prime"], icon: "📦" },
  intel: { name: "Intel", slug: "intel", category: "donanim", keywords: ["Core Ultra", "Xeon", "Arc"], icon: "💎" },
  amd: { name: "AMD", slug: "amd", category: "donanim", keywords: ["Ryzen", "Radeon", "EPYC"], icon: "🔴" },
  twitter: { name: "X / Twitter", slug: "twitter", category: "sosyal-medya", keywords: ["Elon Musk", "Grok", "X Premium"], icon: "𝕏" },
  instagram: { name: "Instagram", slug: "instagram", category: "sosyal-medya", keywords: ["Reels", "Threads", "Meta"], icon: "📷" },
  tiktok: { name: "TikTok", slug: "tiktok", category: "sosyal-medya", keywords: ["ByteDance", "CapCut"], icon: "🎵" },
  spacex: { name: "SpaceX", slug: "spacex", category: "bilim", keywords: ["Starship", "Starlink", "Falcon"], icon: "🚀" },
  bitcoin: { name: "Bitcoin", slug: "bitcoin", category: "genel", keywords: ["BTC", "kripto", "ETF"], icon: "₿" },
  playstation: { name: "PlayStation", slug: "playstation", category: "oyun", keywords: ["PS5", "PSVR2", "Sony"], icon: "🎮" },
  xbox: { name: "Xbox", slug: "xbox", category: "oyun", keywords: ["Game Pass", "Microsoft"], icon: "🎯" },
  "yapay-zeka": { name: "Yapay Zeka", slug: "yapay-zeka", category: "yapay-zeka", keywords: ["AI", "LLM", "GPT", "makine"], icon: "🧠" },
  siber: { name: "Siber Güvenlik", slug: "siber-guvenlik", category: "guvenlik", keywords: ["hack", "veri", "şifre"], icon: "🔒" },
  blockchain: { name: "Blockchain", slug: "blockchain", category: "genel", keywords: ["kripto", "NFT", "Web3"], icon: "⛓️" },
};

export interface TopicDefinition {
  name: string; slug: string; category: string;
  keywords: string[]; icon: string;
}

export interface TopicStats {
  articleCount: number; latestArticle: { title: string; slug: string; publishedAt: Date } | null;
  topCategories: Array<{ name: string; count: number }>;
  relatedTopics: Array<{ slug: string; name: string; relevance: number }>;
}

// ─── Topic Queries ───────────────────────────────────────────

export function getTopic(slug: string): TopicDefinition | null {
  return TOPIC_REGISTRY[slug] || null;
}

export function getAllTopics(): TopicDefinition[] {
  return Object.values(TOPIC_REGISTRY);
}

export function getTopicsByCategory(category: string): TopicDefinition[] {
  return Object.values(TOPIC_REGISTRY).filter(t => t.category === category);
}

export function searchTopics(query: string): TopicDefinition[] {
  const lower = query.toLowerCase();
  return Object.values(TOPIC_REGISTRY).filter(t =>
    t.name.toLowerCase().includes(lower) || t.keywords.some(k => k.toLowerCase().includes(lower))
  );
}

// ─── Topic Stats ─────────────────────────────────────────────

export async function getTopicStats(slug: string): Promise<TopicStats | null> {
  const topic = getTopic(slug);
  if (!topic) return null;
  try {
    const [articleCount, latestArticle] = await Promise.all([
      prisma.article.count({ where: { status: "published", OR: [{ title: { contains: topic.name } }, { excerpt: { contains: topic.name } }] } }),
      prisma.article.findFirst({ where: { status: "published", title: { contains: topic.name } }, select: { title: true, slug: true, publishedAt: true }, orderBy: { publishedAt: "desc" } }),
    ]);
    const related = findRelatedTopics(slug, topic);
    return { articleCount, latestArticle: latestArticle || null, topCategories: [], relatedTopics: related };
  } catch { return null; }
}

// ─── Related Topics ──────────────────────────────────────────

function findRelatedTopics(slug: string, topic: TopicDefinition): Array<{ slug: string; name: string; relevance: number }> {
  const related: Array<{ slug: string; name: string; relevance: number }> = [];
  for (const [key, other] of Object.entries(TOPIC_REGISTRY)) {
    if (key === slug) continue;
    const sharedKeywords = topic.keywords.filter(k => other.keywords.some(ok => ok.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(ok.toLowerCase())));
    const sameCategory = topic.category === other.category ? 1 : 0;
    const relevance = sharedKeywords.length * 25 + sameCategory * 20;
    if (relevance > 0) related.push({ slug: key, name: other.name, relevance: Math.min(100, relevance) });
  }
  return related.sort((a, b) => b.relevance - a.relevance).slice(0, 8);
}

export const topicHub = { getTopic, getAllTopics, getTopicsByCategory, searchTopics, getTopicStats, TOPIC_REGISTRY };
export default topicHub;
