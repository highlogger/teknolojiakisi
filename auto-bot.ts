/**
 * OTOMATİK HABER BOTU - Sürekli çalışır
 * Her 2 saatte bir çalışır, her seferde 20-25 haber üretir
 *
 * Kullanım: npx tsx auto-bot.ts
 * Sürekli çalışır, CTRL+C ile durdurulur
 */

import { runBot } from "./src/services/bot/index";

const INTERVAL_MINUTES = 120; // 2 saat
const MAX_PER_RUN = 25; // Her çalışmada max 25 haber

console.log("═".repeat(50));
console.log("  TeknolojiAkışı SÜREKLİ Haber Botu");
console.log(`  Her ${INTERVAL_MINUTES} dakikada bir çalışır`);
console.log(`  Hedef: ${MAX_PER_RUN} haber/sefer → ~${Math.round((24*60)/INTERVAL_MINUTES * MAX_PER_RUN)} haber/gün`);
console.log("═".repeat(50));
console.log("");

async function tick() {
  const start = Date.now();
  const time = new Date().toLocaleString("tr-TR");
  console.log(`\n⏰ [${time}] Bot çalışıyor...`);

  try {
    const results = await runBot();
    const total = results.reduce((s, r) => s + r.articlesGenerated, 0);
    const errors = results.filter((r) => r.status === "error").length;
    const duration = ((Date.now() - start) / 1000).toFixed(0);
    console.log(`✅ ${total} haber | ${duration}s | ${errors} hata`);
  } catch (err) {
    console.error("❌ Bot hatası:", (err as Error).message);
  }
}

async function main() {
  // İlk çalıştırma hemen
  await tick();

  // Sonra her INTERVAL_MINUTES dakikada bir
  setInterval(async () => {
    await tick();
  }, INTERVAL_MINUTES * 60 * 1000);
}

main().catch(console.error);
