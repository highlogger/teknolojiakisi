/**
 * Bot manuel tetikleme scripti
 *
 * Kullanım: npx tsx src/services/bot/trigger.ts
 *
 * Bu script komut satırından botu çalıştırmak için kullanılır.
 * Cron job ile otomatik çalıştırma için de bu script kullanılabilir.
 */

import { runBot } from "./index";

async function main() {
  console.log("═".repeat(40));
  console.log("  TeknolojiAkışı Haber Botu");
  console.log("═".repeat(40));

  try {
    const results = await runBot();

    // Özet
    const totalGenerated = results.reduce((s, r) => s + r.articlesGenerated, 0);
    const totalPublished = results.reduce((s, r) => s + r.articlesPublished, 0);
    const errors = results.filter((r) => r.status === "error");

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} kaynakta hata oluştu:`);
      for (const e of errors) {
        console.log(`   - ${e.sourceName}: ${e.errorMessage}`);
      }
    }

    if (totalGenerated === 0) {
      console.log("\n💤 İşlenecek yeni haber bulunamadı.");
    }

    process.exit(totalGenerated > 0 || errors.length === 0 ? 0 : 1);
  } catch (err) {
    console.error("\n❌ Bot çalıştırma hatası:", err);
    process.exit(1);
  }
}

main();
