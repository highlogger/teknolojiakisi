/**
 * Production Auto Bot - CommonJS versiyonu
 * Docker container'da calisir, tsx gerektirmez
 *
 * v3: Tech filtre, BotLog, kategori siniflandirma, SEO pipeline, inline logger
 */

// ─── Inline Logger (CommonJS uyumlu) ────────────────────────
var LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };
var LOG_COLORS = { debug: "\x1b[90m", info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", fatal: "\x1b[35m", reset: "\x1b[0m" };

function createLogger(context) {
  var isProd = process.env.NODE_ENV === "production";
  function write(level, message, data, err) {
    if (isProd) {
      var entry = { ts: new Date().toISOString(), level: level, ctx: context, msg: message, data: data || undefined };
      if (err) { entry.error = err.message || String(err); if (err.stack) entry.stack = err.stack; }
      (level === "error" || level === "fatal" ? process.stderr : process.stdout).write(JSON.stringify(entry) + "\n");
    } else {
      var c = LOG_COLORS[level] || "", r = LOG_COLORS.reset;
      var time = new Date().toISOString().split("T")[1].split(".")[0];
      var line = c + "[" + time + "] [" + level.toUpperCase() + "] [" + context + "] " + message + r;
      if (data && Object.keys(data).length) line += " " + JSON.stringify(data);
      if (err) line += "\n" + c + "       → " + (err.message || String(err)) + r;
      if (err && err.stack && (level === "error" || level === "fatal")) {
        err.stack.split("\n").slice(1, 4).forEach(function(s) { line += "\n       " + s.trim(); });
      }
      (level === "error" || level === "fatal") ? botlog.error(line) : console.log(line);
    }
  }
  return {
    debug: function(m, d) { if (!isProd) write("debug", m, d); },
    info: function(m, d) { write("info", m, d); },
    warn: function(m, d) { write("warn", m, d); },
    error: function(m, e, d) { write("error", m, d, e); },
    fatal: function(m, e, d) { write("fatal", m, d, e); }
  };
}

var botlog = createLogger("bot");

const { PrismaClient } = require("@prisma/client");
const OpenAI = require("openai");

const prisma = new PrismaClient();
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "sk-placeholder",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
});

const INTERVAL_MINUTES = 120; // 2 saat
const MAX_PER_SOURCE = 3;
const MAX_TOTAL = 25;

// === TEKNOLOJI FILTRESI ===
const TECH_KEYWORDS = [
  "teknoloji", "yapay zeka", "telefon", "bilgisayar", "laptop", "tablet",
  "yazilim", "donanim", "internet", "uygulama", "guncelleme", "cip",
  "islemci", "ekran", "batarya", "sarj", "robot", "drone", "uzay",
  "oyun", "siber", "veri", "bulut", "kod", "program", "sistem",
  "akilli", "dijital", "elektrikli", "otonom", "surucusuz",
  "apple", "samsung", "google", "microsoft", "tesla", "openai",
  "nvidia", "intel", "amd", "qualcomm", "mediatek", "xiaomi",
  "huawei", "sony", "lg", "asus", "lenovo", "dell", "hp",
  "instagram", "tiktok", "twitter", "facebook", "whatsapp",
  "discord", "telegram", "youtube", "spotify", "netflix",
  "bluetooth", "wifi", "5g", "6g", "ssd", "gpu", "cpu", "api",
  "blockchain", "kripto", "nft", "metaverse", "quantum",
  "linux", "windows", "macos", "ios", "android", "chrome",
  "chatgpt", "gpt", "llm", "claude", "gemini", "copilot",
  "iphone", "ipad", "macbook", "pixel", "galaxy", "playstation",
  "xbox", "nintendo", "steam", "snapdragon", "geforce",
  "rocket", "spacex", "nasa", "starlink", "startup", "funding",
  "app", "software", "hardware", "firmware", "update", "vr", "ar",
];

const NON_TECH_PATTERNS = [
  /\b(movie|film|cinema|hollywood|box\s*office|actor|actress|celebrity|oscar)\b/i,
  /\b(dizi|film|sinema|oyuncu|unlu|fragman)\b/i,
  /\b(football|soccer|basketball|baseball|tennis|golf|nfl|nba|mlb|champions\s*league)\b/i,
  /\b(futbol|basketbol|tenis|voleybol|spor\s*musabaka)\b/i,
  /\b(cancer|diabetes|therapy|vaccine|clinical\s*trial|diagnosis|treatment|patient)\b/i,
  /\b(kanser|diyabet|tedavi|asi|hasta|klinik\s*deney|teshis|ilac)\b/i,
  /\b(fashion|beauty|makeup|skincare|cosmetic|runway|outfit)\b/i,
  /\b(moda|guzellik|makyaj|kozmetik|cilt\s*bakimi|giyim)\b/i,
  /\b(recipe|cooking|restaurant|chef|cuisine|food|baking|gourmet)\b/i,
  /\b(yemek\s*tarifi|asci|restoran|mutfak|gurme)\b/i,
  /\b(election|campaign|democrat|republican|congress|senate|president\s(?!tech)|vote)\b/i,
  /\b(secim|milletvekili|baskan|oy\s*verme|meclis)\b/i,
  /\b(album|concert|tour|singer|rapper|band|orchestra|festival\s(?!tech|gaming))\b/i,
  /\b(album|konser|sarkici|rapci|grup|orkestra|muzik\s*festival)\b/i,
  /\b(perfume|fragrance|scent|aroma)\b/i,
  /\b(parfum|koku|esans)\b/i,
];

function quickTechFilter(title, content) {
  var text = title + " " + content;
  for (var i = 0; i < NON_TECH_PATTERNS.length; i++) {
    if (NON_TECH_PATTERNS[i].test(text)) return false;
  }
  var lower = text.toLowerCase();
  for (var j = 0; j < TECH_KEYWORDS.length; j++) {
    if (lower.indexOf(TECH_KEYWORDS[j].toLowerCase()) !== -1) return true;
  }
  return false;
}

// === KATEGORI SINIFLANDIRMA ===
async function classifyCategory(title, content) {
  try {
    var result = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      temperature: 0.2,
      max_tokens: 30,
      messages: [
        { role: "system", content: "SADECE su kategori slug'larindan birini dondur: yapay-zeka, mobil, web, donanim, yazilim, oyun, bilim, guvenlik, sosyal-medya, otomotiv, genel. Baska bir sey yazma." },
        { role: "user", content: "Baslik: " + title + "\n\nIcerik: " + content.substring(0, 300) },
      ],
    });
    var cat = (result.choices[0]?.message?.content || "genel").trim().toLowerCase();
    return cat;
  } catch (e) {
    return "genel";
  }
}

// === BOT LOG KAYDI ===
async function createBotLog(params) {
  try {
    await prisma.botLog.create({
      data: {
        sourceId: params.sourceId || null,
        status: params.status,
        articlesFound: params.articlesFound || 0,
        articlesGenerated: params.articlesGenerated || 0,
        articlesPublished: params.articlesPublished || 0,
        errorMessage: params.errorMessage || null,
        durationMs: params.durationMs || 0,
      },
    });
  } catch (e) {
    botlog.error("  ⚠️ BotLog kayit hatasi:", e.message);
  }
}

// === ANA BOT ===
botlog.info("TeknolojiAkisi Bot v3 baslatiliyor");
botlog.info("Interval: " + INTERVAL_MINUTES + "dk | Max: " + MAX_TOTAL + "/run | Hedef: ~" + (Math.round((24 * 60) / INTERVAL_MINUTES) * MAX_TOTAL) + " haber/gun");
botlog.info("Ozellikler: Tech filtre | Kategori AI | BotLog | Structured Logging");

async function tick() {
  var start = Date.now();
  var time = new Date().toLocaleString("tr-TR");
  console.log("\n⏰ [" + time + "] Bot calisiyor...");

  try {
    var sources = await prisma.source.findMany({
      where: { isActive: true },
      orderBy: { priority: "desc" },
    });

    var totalProcessed = 0;
    var autoPublishSetting = await prisma.siteSetting.findUnique({
      where: { key: "autoPublish" },
    });
    var autoPublish = autoPublishSetting?.value === "true";
    console.log("📋 Auto-publish: " + (autoPublish ? "ACIK" : "KAPALI"));
    console.log("📡 " + sources.length + " aktif kaynak\n");

    for (var si = 0; si < sources.length; si++) {
      var source = sources[si];
      if (totalProcessed >= MAX_TOTAL) break;

      var sourceStart = Date.now();
      console.log("📥 [" + source.name + "] (" + source.language.toUpperCase() + ")");

      try {
        var RssParser = require("rss-parser");
        var parser = new RssParser({ timeout: 15000 });
        var feed;
        try {
          feed = await parser.parseURL(source.feedUrl);
        } catch (e) {
          console.log("   ⚠️ RSS hatasi: " + e.message);
          await createBotLog({ sourceId: source.id, status: "error", errorMessage: "RSS: " + e.message, durationMs: Date.now() - sourceStart });
          continue;
        }

        var items = (feed.items || []).slice(0, MAX_PER_SOURCE * 3); // Daha fazla cek, filtrele
        var techItems = [];
        for (var ii = 0; ii < items.length; ii++) {
          var item = items[ii];
          if (!item.title || !item.link) continue;
          var itemContent = item.contentSnippet || item.content || item.summary || "";
          if (quickTechFilter(item.title, itemContent)) {
            techItems.push(item);
          }
        }
        console.log("   ↳ " + items.length + " ham → " + techItems.length + " tech (filtre)");

        var processed = 0;
        for (var ti = 0; ti < techItems.length && processed < MAX_PER_SOURCE && totalProcessed < MAX_TOTAL; ti++) {
          var item = techItems[ti];

          // Daha once islenmis mi?
          var existing = await prisma.article.findFirst({ where: { originalUrl: item.link } });
          if (existing) continue;

          // AI ile baslik cevirisi + icerik uret
          var content = item.contentSnippet || item.content || item.summary || "";
          var aiResult = await deepseek.chat.completions.create({
            model: "deepseek-chat",
            temperature: 0.7,
            max_tokens: 2048,
            messages: [
              {
                role: "system",
                content: "Sen deneyimli bir Turk teknoloji yazarisin. Verilen haberi ozgun sekilde Turkce'ye uyarla.\n\nCikti formati (kesinlikle bu formatta olmali):\nBASLIK: [Turkce haber basligi]\nOZET: [1-2 cumlelik Turkce ozet]\nICERIK:\n[HTML formatinda Turkce haber - <p>, <h2>, <ul>, <li> kullan]",
              },
              {
                role: "user",
                content: "Kaynak: " + source.name + "\nOrijinal Baslik: " + item.title + "\n\nOrijinal Icerik: " + content.substring(0, 3000) + "\n\nBu haberi yukaridaki formatta Turkce'ye uyarla. BASLIK, OZET ve ICERIK kisimlarini mutlaka belirt.",
              },
            ],
          });

          var aiText = aiResult.choices[0]?.message?.content || "";
          var promptTokens = aiResult.usage?.prompt_tokens || 0;
          var completionTokens = aiResult.usage?.completion_tokens || 0;

          // Baslik, ozet ve icerigi ayristir
          var turkishTitle = item.title.substring(0, 200);
          var turkishExcerpt = content.substring(0, 250);
          var generatedContent = content;

          var titleMatch = aiText.match(/BASLIK:\s*(.+?)(?:\n|$)/);
          var ozetMatch = aiText.match(/OZET:\s*([\s\S]+?)(?=\nICERIK:)/);
          var icerikMatch = aiText.match(/ICERIK:\s*([\s\S]+)/);

          if (titleMatch && titleMatch[1].trim()) turkishTitle = titleMatch[1].trim().substring(0, 200);
          if (ozetMatch && ozetMatch[1].trim()) turkishExcerpt = ozetMatch[1].trim().substring(0, 300);
          if (icerikMatch && icerikMatch[1].trim()) {
            generatedContent = icerikMatch[1].trim();
          } else if (aiText) {
            generatedContent = aiText;
          }

          // Kategori siniflandir
          var categorySlug = await classifyCategory(turkishTitle, generatedContent);
          var category = await prisma.category.findFirst({ where: { slug: categorySlug } });
          var categoryId = category?.id;
          if (!categoryId) {
            var genelCat = await prisma.category.findFirst({ where: { slug: "genel" } });
            categoryId = genelCat?.id;
          }

          // Yazar bul
          var authorId = null;
          try {
            var author = await prisma.author.findFirst({ where: { isBot: true } });
            authorId = author?.id;
          } catch (e) {}

          // SEO meta
          var metaTitle = turkishTitle.substring(0, 60);
          var metaDescription = turkishExcerpt.substring(0, 160);

          // Slug
          var slug = turkishTitle
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .substring(0, 60) + "-" + Date.now().toString(36);

          await prisma.article.create({
            data: {
              title: turkishTitle,
              slug: slug,
              excerpt: turkishExcerpt,
              content: generatedContent,
              categoryId: categoryId,
              authorId: authorId,
              sourceId: source.id,
              originalUrl: item.link,
              originalTitle: item.title,
              language: "tr",
              status: autoPublish ? "published" : "draft",
              isAiGenerated: true,
              aiModel: "deepseek-chat",
              aiPromptTokens: promptTokens,
              aiCompletionTokens: completionTokens,
              metaTitle: metaTitle,
              metaDescription: metaDescription,
              publishedAt: autoPublish ? new Date() : null,
            },
          });

          totalProcessed++;
          processed++;
          console.log("   ✅ [" + totalProcessed + "/" + MAX_TOTAL + "] " + turkishTitle.substring(0, 50) + "... [" + categorySlug + "]");
          await new Promise(function(r) { setTimeout(r, 800); });
        }

        // Kaynak fetch zamanini guncelle
        try {
          await prisma.source.update({ where: { id: source.id }, data: { lastFetchedAt: new Date() } });
        } catch (e) {}

        await createBotLog({
          sourceId: source.id,
          status: processed > 0 ? "success" : "no_new",
          articlesFound: items.length,
          articlesGenerated: processed,
          articlesPublished: autoPublish ? processed : 0,
          durationMs: Date.now() - sourceStart,
        });

      } catch (srcErr) {
        botlog.error("   ❌ Kaynak hatasi: " + (srcErr.message || srcErr));
        await createBotLog({
          sourceId: source.id,
          status: "error",
          errorMessage: srcErr.message || "Bilinmeyen hata",
          durationMs: Date.now() - sourceStart,
        });
      }
    }

    var duration = ((Date.now() - start) / 1000).toFixed(0);
    console.log("✅ " + totalProcessed + " haber | " + duration + "s");
  } catch (err) {
    botlog.error("❌ Bot hatasi:", err.message);
  }
}

async function main() {
  await tick();
  setInterval(function() { tick(); }, INTERVAL_MINUTES * 60 * 1000);
}

main().catch(console.error);
