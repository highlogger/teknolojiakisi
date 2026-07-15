/**
 * SEO Agent — Utility Functions
 */

/** Türkçe karakterleri dönüştürerek SEO dostu slug oluştur */
export function slugify(text: string): string {
  const charMap: Record<string, string> = {
    ğ: "g", Ğ: "g", ş: "s", Ş: "s", ı: "i", İ: "i",
    ç: "c", Ç: "c", ö: "o", Ö: "o", ü: "u", Ü: "u",
  };

  return text
    .toLowerCase()
    .replace(/[ğĞşŞıİçÇöÖüÜ]/g, (c) => charMap[c] || c)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

/** HTML etiketlerini temizle */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Kelime sayısı */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

/** Okuma süresi (dk) */
export function readingTime(wordCount: number): string {
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} dk`;
}
