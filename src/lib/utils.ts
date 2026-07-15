import slugifyLib from "slugify";

/**
 * Türkçe karakter uyumlu slug üretir
 */
export function slugify(text: string): string {
  return slugifyLib(text, {
    lower: true,
    strict: true,
    locale: "tr",
    remove: /[*+~.()'"!:@]/g,
  });
}

/**
 * Tarihi Türkçe locale ile formatlar
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Intl.DateTimeFormat("tr-TR", options).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/**
 * Göreceli zaman (örn: "3 saat önce", "2 gün önce")
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  const intervals: [number, string][] = [
    [31536000, "yıl"],
    [2592000, "ay"],
    [604800, "hafta"],
    [86400, "gün"],
    [3600, "saat"],
    [60, "dakika"],
  ];

  for (const [secondsInUnit, label] of intervals) {
    const count = Math.floor(seconds / secondsInUnit);
    if (count >= 1) {
      return `${count} ${label} önce`;
    }
  }

  return "az önce";
}

/**
 * Metinden ilk N kelimeyi alır
 */
export function truncateWords(text: string, wordCount: number): string {
  const words = text.split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(" ") + "...";
}

/**
 * HTML içeriğinden düz metin çıkarır
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, "");
}

/**
 * Türkçe karakter kontrolü
 */
export function validateTurkishChars(text: string): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Türkçe'de olmaması gereken karakterler
  if (/[âêîôûÂÊÎÔÛ]/g.test(text)) {
    issues.push("Şapkalı harf tespit edildi (â, ê, î, ô, û)");
  }

  // Eksik Türkçe karakter uyarısı (İngilizce karşılıklar)
  const missingChecks = [
    { pattern: /\b([A-Z])i\b/g, msg: "'İ' yerine 'I' kullanılmış olabilir" },
  ];

  for (const { pattern, msg } of missingChecks) {
    if (pattern.test(text)) {
      issues.push(msg);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Sayfalama için offset hesaplar
 */
export function getPagination(
  page: number,
  pageSize: number
): { skip: number; take: number } {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

/**
 * Rastgele ID oluşturur
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
