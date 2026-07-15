/**
 * Verification Agent — Constants & Thresholds
 *
 * Merkezi eşik değerleri, skor ağırlıkları ve güvenilir kaynak listeleri.
 */

// ─── Skor Ağırlıkları ───────────────────────────────────────

export const SCORE_WEIGHTS = {
  source: 0.25, // Kaynak güvenilirliği
  fact: 0.20, // Olgusal doğruluk
  consistency: 0.20, // Tutarlılık
  entity: 0.15, // Entity doğruluğu
  freshness: 0.10, // Güncellik
  technical: 0.10, // Teknik doğruluk
} as const;

// ─── Durum Eşikleri ─────────────────────────────────────────

export const STATUS_THRESHOLDS = {
  VERIFIED: 85, // ≥ 85 → VERIFIED
  LIKELY_VERIFIED: 70, // ≥ 70 → LIKELY_VERIFIED
  NEEDS_EDITOR_REVIEW: 50, // ≥ 50 → NEEDS_EDITOR_REVIEW
  INSUFFICIENT_EVIDENCE: 30, // ≥ 30 → INSUFFICIENT_EVIDENCE
  // < 30 → REJECT
} as const;

// ─── Kaynak Güven Skorları ──────────────────────────────────

export const SOURCE_RELIABILITY = {
  official: 95, // Resmi şirket/blog duyurusu
  press: 75, // Basın bülteni, haber ajansı
  community: 50, // Topluluk, forum, sosyal medya
  social_media: 30, // Sosyal medya gönderisi
  unknown: 20, // Bilinmeyen kaynak
} as const;

// ─── Minimum Kaynak Gereksinimleri ──────────────────────────

export const MIN_SOURCE_REQUIREMENTS = {
  independentSources: 2, // En az 2 bağımsız kaynak
  minReliabilityScore: 40, // Her kaynak en az 40 güven skoru
  preferOfficial: true, // Resmi kaynak tercih et
} as const;

// ─── Tarih Eşikleri ─────────────────────────────────────────

export const DATE_THRESHOLDS = {
  maxHoursForBreaking: 24, // Breaking haber için max 24 saat
  maxHoursForRecent: 72, // Güncel haber için max 72 saat
  staleAfterDays: 7, // 7 gün sonra eski sayılır
  rehashedWarningDays: 30, // 30 gün içinde tekrar eden haber
} as const;

// ─── Link Kontrolü ──────────────────────────────────────────

export const LINK_CHECK = {
  timeout: 10000, // 10 saniye
  maxRedirects: 3,
  userAgent: "TeknolojiAkisi-VerificationAgent/1.0",
  validStatusCodes: [200, 201, 202, 203, 206],
  warningStatusCodes: [301, 302, 307, 308], // Redirect
} as const;

// ─── Duplicate Eşikleri ─────────────────────────────────────

export const DUPLICATE_THRESHOLDS = {
  highSimilarity: 0.85, // %85+ → duplicate
  mediumSimilarity: 0.60, // %60+ → benzer, uyarı
  maxSimilarArticlesToCheck: 10,
} as const;

// ─── Teknik Doğrulama ───────────────────────────────────────

/** Bilinen API, framework, dil isimleri (doğrulama için referans) */
export const KNOWN_TECHNICAL_TERMS: Record<string, string[]> = {
  programming_languages: [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
    "Swift", "Kotlin", "Ruby", "PHP", "Scala", "R", "Dart", "Zig", "Mojo",
  ],
  frameworks: [
    "React", "Next.js", "Vue", "Angular", "Svelte", "Nuxt", "Gatsby",
    "Django", "Flask", "FastAPI", "Spring", "Express", "NestJS", "Laravel",
    "Ruby on Rails", "ASP.NET", "Flutter", "React Native", "Electron",
  ],
  ai_models: [
    "GPT-4", "GPT-4o", "GPT-4o-mini", "GPT-4 Turbo", "GPT-3.5",
    "Claude 3.5 Sonnet", "Claude Sonnet 4.6", "Claude Opus 4",
    "Gemini 1.5 Pro", "Gemini 2.5 Pro", "Gemini Ultra",
    "DeepSeek-V3", "DeepSeek-R1", "DeepSeek-Chat",
    "LLaMA 3", "LLaMA 4", "Mixtral", "Grok 2", "Grok 3",
    "Stable Diffusion 3", "DALL-E 3", "Midjourney v6",
    "Sora", "Runway Gen-3", "Kling",
  ],
  operating_systems: [
    "Windows 11", "Windows 10", "macOS Sequoia", "macOS Sonoma",
    "iOS 18", "iOS 19", "Android 15", "Android 16",
    "Ubuntu 24.04", "Ubuntu 22.04", "Fedora 40",
    "ChromeOS", "iPadOS 18",
  ],
  hardware: [
    "RTX 5090", "RTX 4090", "RTX 5080", "RTX 4080",
    "M4 Ultra", "M4 Max", "M4 Pro", "M3 Ultra",
    "Snapdragon 8 Gen 4", "Snapdragon X Elite",
    "Apple A18 Pro", "Apple A17 Pro",
    "AMD Ryzen 9 9950X", "Intel Core Ultra 9 285K",
  ],
  cloud_services: [
    "AWS", "Azure", "Google Cloud", "Cloudflare", "Vercel", "Netlify",
    "Supabase", "Firebase", "PlanetScale", "Neon", "Railway", "Fly.io",
  ],
};

// ─── Güvenilir Domain'ler ───────────────────────────────────

export const TRUSTED_DOMAINS = [
  // Resmi şirket blogları
  "openai.com", "anthropic.com", "deepseek.com", "blog.google",
  "ai.googleblog.com", "research.google", "aws.amazon.com",
  "azure.microsoft.com", "cloud.google.com",
  "meta.com", "about.fb.com", "engineering.fb.com",
  "developer.apple.com", "machinelearning.apple.com",
  "nvidia.com", "blogs.nvidia.com",
  "intel.com", "amd.com", "qualcomm.com",
  "microsoft.com", "devblogs.microsoft.com",
  "github.blog", "github.com",
  // Teknoloji medyası
  "techcrunch.com", "theverge.com", "arstechnica.com",
  "wired.com", "engadget.com", "theinformation.com",
  "venturebeat.com", "zdnet.com", "cnet.com",
  "tomshardware.com", "anandtech.com", "gsmarena.com",
  "9to5mac.com", "9to5google.com", "androidpolice.com",
  "xda-developers.com", "phoronix.com",
  // Türk teknoloji medyası
  "shiftdelete.net", "donanimhaber.com", "webtekno.com",
  "technopat.net", "chip.com.tr", "log.com.tr",
  // Resmi duyuru siteleri
  "prnewswire.com", "businesswire.com", "globenewswire.com",
];

/**
 * Bir domain'in güvenilir olup olmadığını kontrol et
 */
export function isTrustedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return TRUSTED_DOMAINS.some(
      (d) => hostname === d || hostname.endsWith("." + d)
    );
  } catch {
    return false;
  }
}

/**
 * Kaynak tipini tahmin et
 */
export function guessSourceType(url: string): "official" | "press" | "community" | "unknown" {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    // Resmi şirket blogları / docs
    if (
      hostname.includes("blog.") ||
      hostname.includes("developer.") ||
      hostname.includes("engineering.") ||
      hostname.includes("research.") ||
      hostname.includes("newsroom.") ||
      hostname.includes("docs.") ||
      hostname.endsWith(".com") && TRUSTED_DOMAINS.slice(0, 13).some(d => hostname.includes(d.split(".")[0]))
    ) {
      return "official";
    }

    // Basın / haber siteleri
    if (
      TRUSTED_DOMAINS.slice(13, 28).some(d => hostname.includes(d.split(".")[0])) ||
      hostname.includes("news.") ||
      hostname.includes("tech")
    ) {
      return "press";
    }

    // Topluluk
    if (
      hostname.includes("reddit.com") ||
      hostname.includes("news.ycombinator.com") ||
      hostname.includes("stackoverflow.com") ||
      hostname.includes("medium.com") ||
      hostname.includes("dev.to") ||
      hostname.includes("forum.")
    ) {
      return "community";
    }

    return "unknown";
  } catch {
    return "unknown";
  }
}
