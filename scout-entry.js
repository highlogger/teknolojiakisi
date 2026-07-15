/**
 * Scout Agent — Production Entry Point
 *
 * AI Newsroom'un ilk aşaması.
 * Her 2 saatte bir çalışır, yeni haberleri keşfeder, queue'ya ekler.
 * Haber yazmaz, publish etmez, rewrite yapmaz.
 */
const { PrismaClient } = require("@prisma/client");
const RssParser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");

const prisma = new PrismaClient();
const INTERVAL_MINUTES = 120;

// Tech filter
const TECH_KEYWORDS = [
  "teknoloji", "yapay zeka", "telefon", "bilgisayar", "laptop", "yazılım", "donanım",
  "internet", "uygulama", "güncelleme", "çip", "işlemci", "robot", "drone", "uzay",
  "oyun", "siber", "veri", "bulut", "kod", "apple", "samsung", "google", "microsoft",
  "tesla", "openai", "nvidia", "intel", "amd", "instagram", "tiktok", "twitter",
  "whatsapp", "discord", "telegram", "youtube", "spotify", "netflix",
  "bluetooth", "wifi", "5g", "6g", "ssd", "gpu", "cpu", "api", "blockchain",
  "kripto", "linux", "windows", "macos", "ios", "android", "chatgpt", "gpt", "llm",
  "claude", "gemini", "copilot", "iphone", "ipad", "macbook", "pixel", "galaxy",
  "playstation", "xbox", "nintendo", "steam", "spacex", "nasa", "starlink", "startup",
];

const NON_TECH = [
  /\b(movie|film|cinema|hollywood|oscar|emmy)\b/i,
  /\b(football|soccer|basketball|baseball|nfl|nba|champions)\b/i,
  /\b(cancer|diabetes|therapy|vaccine|clinical)\b/i,
  /\b(fashion|beauty|makeup|skincare|cosmetic)\b/i,
  /\b(election|campaign|democrat|republican|congress|senate)\b/i,
];

function isTechRelevant(title, content) {
  const text = title + " " + content;
  for (const p of NON_TECH) if (p.test(text)) return false;
  const lower = text.toLowerCase();
  return TECH_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

async function scout() {
  const start = Date.now();
  const time = new Date().toLocaleString("tr-TR");
  console.log(`\n🔍 [${time}] Scout Agent calisiyor...`);

  try {
    const sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });

    let found = 0, queued = 0, dup = 0, nonTech = 0;

    for (const source of sources) {
      try {
        if (source.type !== "rss" || !source.feedUrl) continue;

        const parser = new RssParser({ timeout: 15000 });
        const feed = await parser.parseURL(source.feedUrl);

        for (const item of (feed.items || []).slice(0, 5)) {
          if (!item.title || !item.link) continue;
          found++;

          const content = item.contentSnippet || item.content || item.summary || "";
          if (!isTechRelevant(item.title, content)) { nonTech++; continue; }

          const existing = await prisma.article.findFirst({ where: { originalUrl: item.link } });
          if (existing) { dup++; continue; }

          // Queue'ya ekle (şimdilik sadece logla, AI Newsroom pipeline'a gonder)
          console.log(`  📰 [${source.name}] ${item.title.substring(0, 60)}...`);
          queued++;
        }

        await prisma.source.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date() },
        }).catch(() => {});

      } catch (srcErr) {
        console.error(`  ⚠️ ${source.name}: ${srcErr.message}`);
      }
    }

    await prisma.botLog.create({
      data: {
        status: queued > 0 ? "success" : "no_new",
        articlesFound: found,
        articlesGenerated: queued,
        articlesPublished: 0,
        durationMs: Date.now() - start,
      },
    }).catch(() => {});

    const duration = ((Date.now() - start) / 1000).toFixed(0);
    console.log(`✅ ${queued} yeni haber kesfedildi | ${found} bulundu | ${nonTech} tech-degil | ${dup} duplicate | ${duration}s`);

  } catch (err) {
    console.error("❌ Scout hatasi:", err.message);
  }
}

async function main() {
  console.log("═══ TeknolojiAkisi Scout Agent v1 ═══");
  console.log(`Interval: ${INTERVAL_MINUTES}dk`);
  console.log("Gorev: RSS → Tech filter → Duplicate check → Queue");
  console.log("═".repeat(40));

  await scout();
  setInterval(scout, INTERVAL_MINUTES * 60 * 1000);
}

main().catch(console.error);
