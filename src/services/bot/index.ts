/**
 * Haber Botu Ana Orchestrator
 *
 * Tüm bot iş akışını yönetir:
 * 1. Aktif kaynakları al
 * 2. Her kaynaktan haberleri çek
 * 3. AI ile içerik üret
 * 4. Veritabanına kaydet
 */

import prisma from "@/lib/db";
import { botLogger as log } from "@/lib/logger";
import { fetchFromSource, filterRecentArticles, filterProcessedArticles } from "./fetcher";
import { generateArticle } from "./generator";
import { quickTechFilter, TRENDING_TOPICS, FACTORY_TOPICS, TRENDING_SYSTEM_PROMPT, buildTrendingPrompt } from "./prompts";
import {
  publishArticle,
  createBotLog,
  updateSourceFetchTime,
  getAutoPublishSetting,
  findCategoryBySlug,
  getDefaultBotAuthor,
} from "./publisher";
import type { BotRunResult } from "@/types";

const AI_MODEL = "deepseek-chat";
const MAX_ARTICLES_PER_SOURCE = 3;
const MAX_TOTAL_ARTICLES = 25; // Sürekli mod için her 2 saatte 25 haber
const DELAY_BETWEEN_GENERATIONS_MS = 500;

/**
 * Tüm bot iş akışını çalıştırır
 */
export async function runBot(): Promise<BotRunResult[]> {
  const startTime = Date.now();
  const results: BotRunResult[] = [];

  console.log("\n🤖 TeknolojiAkışı Haber Botu Başlatılıyor...\n");

  // Auto-publish ayarını kontrol et
  const autoPublish = await getAutoPublishSetting();
  console.log(`📋 Auto-publish: ${autoPublish ? "AÇIK" : "KAPALI (taslak olarak kaydedilecek)"}`);

  // Aktif kaynakları al (en yüksek öncelikli)
  const sources = await prisma.source.findMany({
    where: { isActive: true },
    orderBy: { priority: "desc" },
  });

  console.log(`📡 ${sources.length} aktif kaynak bulundu\n`);
  console.log(`🎯 Hedef: En fazla ${MAX_TOTAL_ARTICLES} teknoloji haberi\n`);

  let totalProcessed = 0;

  for (const source of sources) {
    // Toplam limite ulaşıldıysa dur
    if (totalProcessed >= MAX_TOTAL_ARTICLES) {
      console.log(`✅ Toplam ${MAX_TOTAL_ARTICLES} haber hedefine ulaşıldı, duruluyor.`);
      break;
    }
    const sourceStart = Date.now();
    console.log(`📥 [${source.name}] (${source.language.toUpperCase()}) - ${source.type.toUpperCase()}`);

    try {
      // Adım 1: Haberleri çek
      const fetched = await fetchFromSource(source);
      console.log(`   ↳ ${fetched.length} haber bulundu (ham)`);

      // Son 48 saattekileri filtrele
      const recent = filterRecentArticles(fetched, 48);
      console.log(`   ↳ ${recent.length} haber son 48 saatte`);

      // Daha önce işlenmemiş olanları filtrele
      const fresh = await filterProcessedArticles(recent);
      console.log(`   ↳ ${fresh.length} haber işlenmemiş`);

      if (fresh.length === 0) {
        console.log(`   ⏭️ Atlanıyor (yeni haber yok)`);
        await createBotLog({
          sourceId: source.id,
          status: "no_new",
          articlesFound: fetched.length,
          articlesGenerated: 0,
          articlesPublished: 0,
          durationMs: Date.now() - sourceStart,
        });
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          status: "no_new",
          articlesFound: fetched.length,
          articlesGenerated: 0,
          articlesPublished: 0,
          durationMs: Date.now() - sourceStart,
        });
        continue;
      }

      // 🔍 Teknoloji filtresi: Sadece teknoloji/AI odaklı haberleri işle
      const techArticles = fresh.filter((a) => quickTechFilter(a.title, a.content || a.excerpt || ""));
      const skippedNonTech = fresh.length - techArticles.length;
      if (skippedNonTech > 0) {
        console.log(`   🔍 Filtre: ${skippedNonTech} teknoloji dışı haber elendi`);
      }

      if (techArticles.length === 0) {
        console.log(`   ⏭️ Atlanıyor (teknoloji odaklı yeni haber yok)`);
        await createBotLog({
          sourceId: source.id,
          status: "no_new",
          articlesFound: fetched.length,
          articlesGenerated: 0,
          articlesPublished: 0,
          durationMs: Date.now() - sourceStart,
        });
        results.push({
          sourceId: source.id,
          sourceName: source.name,
          status: "no_new",
          articlesFound: fetched.length,
          articlesGenerated: 0,
          articlesPublished: 0,
          durationMs: Date.now() - sourceStart,
        });
        continue;
      }

      // En fazla MAX_ARTICLES_PER_SOURCE işle
      const toProcess = techArticles.slice(0, MAX_ARTICLES_PER_SOURCE);

      let generated = 0;
      let published = 0;

      for (const article of toProcess) {
        try {
          // Adım 2: AI ile içerik üret
          const { generated: genArticle, totalPromptTokens, totalCompletionTokens } =
            await generateArticle(article);

          // Kategori tahmini yap
          const categorySlug = await import("./generator").then((m) =>
            m.classifyCategory(genArticle.title, genArticle.content)
          );
          const categoryId = await findCategoryBySlug(categorySlug);

          // Bot yazar seç
          const authorId = await getDefaultBotAuthor();

          // Adım 3: Yayınla
          const result = await publishArticle(genArticle, article, {
            categoryId,
            authorId,
            sourceId: source.id,
            aiModel: AI_MODEL,
            promptTokens: totalPromptTokens,
            completionTokens: totalCompletionTokens,
            autoPublish,
            featuredImage: article.imageUrl,
          });

          generated++;
          totalProcessed++;
          if (result.status === "published") published++;

          console.log(`   ✅ [${totalProcessed}/${MAX_TOTAL_ARTICLES}] ${genArticle.title.substring(0, 50)}... [${result.status}]`);

          // Rate limiting - API'ye aşırı yüklenmemek için bekle
          await sleep(DELAY_BETWEEN_GENERATIONS_MS);
        } catch (err) {
          console.error(`   ❌ Üretim hatası: ${(err as Error).message}`);
        }
      }

      // Kaynağın son çekilme zamanını güncelle
      await updateSourceFetchTime(source.id);

      // Bot log'u oluştur
      const duration = Date.now() - sourceStart;
      const status = generated > 0 ? "success" : "error";

      await createBotLog({
        sourceId: source.id,
        status,
        articlesFound: fetched.length,
        articlesGenerated: generated,
        articlesPublished: published,
        durationMs: duration,
      });

      console.log(`   📊 ${generated} üretildi, ${published} yayınlandı (${duration}ms)\n`);

      results.push({
        sourceId: source.id,
        sourceName: source.name,
        status,
        articlesFound: fetched.length,
        articlesGenerated: generated,
        articlesPublished: published,
        durationMs: duration,
      });
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error(`   ❌ Kaynak hatası: ${errorMessage}`);

      await createBotLog({
        sourceId: source.id,
        status: "error",
        articlesFound: 0,
        articlesGenerated: 0,
        articlesPublished: 0,
        errorMessage,
        durationMs: Date.now() - sourceStart,
      });

      results.push({
        sourceId: source.id,
        sourceName: source.name,
        status: "error",
        articlesFound: 0,
        articlesGenerated: 0,
        articlesPublished: 0,
        errorMessage,
        durationMs: Date.now() - sourceStart,
      });
    }
  }

  // === SEO Trend + Fabrika İçerik Üretimi ===
  console.log("\n🔥 SEO Trend + Fabrika İçerik Üretimi Başlıyor...\n");
  const trendingAutoPublish = await getAutoPublishSetting();

  // Fabrika konularından rastgele 3 tane seç
  // Fabrika konularından rastgele 8 tane seç
  const shuffled = [...FACTORY_TOPICS].sort(() => Math.random() - 0.5);
  const selectedFactory = shuffled.slice(0, 10);
  const allTopics = [
    ...TRENDING_TOPICS,
    ...selectedFactory.map(t => ({ topic: t, category: "yazilim", prompt: `"${t}" konusunda kapsamlı bir Türkçe rehber/tutorial yaz. Adım adım anlat. Kod örnekleri ver. Türkçe kaynak az olduğu için detaylı ol. SEO uyumlu başlık ve etiketler kullan. "Teknoloji Akışı" markasına doğal atıflar yap.\n\nHTML formatında: <h2> başlıklar, <p> paragraflar, <pre><code> kod blokları, <ul>/<li> listeler, <strong> vurgular.` }))
  ];

  for (const trend of allTopics) {
    if (totalProcessed >= MAX_TOTAL_ARTICLES) {
      console.log(`✅ Toplam ${MAX_TOTAL_ARTICLES} haber hedefine ulaşıldı.`);
      break;
    }

    try {
      console.log(`  [Trend] ${trend.topic.substring(0, 60)}...`);
      const { chat } = await import("@/lib/deepseek");
      const result = await chat({
        systemPrompt: TRENDING_SYSTEM_PROMPT,
        userPrompt: buildTrendingPrompt(trend.topic, trend.prompt),
        temperature: 0.8,
        maxTokens: 4096,
      });

      const categoryId = await findCategoryBySlug(trend.category);
      const authorId = await getDefaultBotAuthor();

      // Basit slug ve excerpt oluştur
      const { slugify } = await import("@/lib/utils");
      const slug = slugify(trend.topic) + "-" + Date.now().toString(36);
      const excerpt = result.content
        .replace(/<[^>]*>/g, "")
        .substring(0, 250) + "...";

      await prisma.article.create({
        data: {
          title: trend.topic,
          slug,
          excerpt,
          content: result.content,
          categoryId,
          authorId,
          language: "tr",
          status: trendingAutoPublish ? "published" : "draft",
          isAiGenerated: true,
          aiModel: AI_MODEL,
          aiPromptTokens: result.promptTokens,
          aiCompletionTokens: result.completionTokens,
          metaTitle: trend.topic.substring(0, 60),
          metaDescription: excerpt.substring(0, 160),
          publishedAt: trendingAutoPublish ? new Date() : null,
        },
      });

      totalProcessed++;
      console.log(`   ✅ [${totalProcessed}/${MAX_TOTAL_ARTICLES}] ${trend.topic.substring(0, 50)}... [${trendingAutoPublish ? "published" : "draft"}]`);

      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_GENERATIONS_MS));
    } catch (err) {
      console.error(`   ❌ Trend içerik hatası: ${(err as Error).message}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  const totalGenerated = results.reduce((s, r) => s + r.articlesGenerated, 0);
  const totalPublished = results.reduce((s, r) => s + r.articlesPublished, 0);

  console.log("═══════════════════════════════════════");
  console.log(`🏁 Bot tamamlandı!`);
  console.log(`   ⏱️  Süre: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(`   📝 Toplam üretilen: ${totalGenerated}`);
  console.log(`   📰 Toplam yayınlanan: ${totalPublished}`);
  console.log(`   🔍 Teknoloji filtresi aktif — sadece tech/AI haberleri işlendi`);
  console.log("═══════════════════════════════════════\n");

  return results;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
