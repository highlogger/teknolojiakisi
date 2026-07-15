/**
 * Topic Hub System — Merkezi Konfigürasyon
 *
 * Tüm topic tanımları, renk, açıklama, SEO metadata'sı burada.
 * Yeni topic eklemek için sadece TOPIC_CONFIGS'a ekleme yapın.
 */
import type { TopicDefinition } from "./types";

export const TOPIC_CONFIGS: Record<string, TopicDefinition> = {
  openai: {
    name: "OpenAI", slug: "openai", category: "yapay-zeka", icon: "🤖", color: "#10A37F",
    keywords: ["GPT", "ChatGPT", "DALL-E", "Sam Altman", "Sora", "Codex"],
    description: "OpenAI, GPT serisi modelleriyle yapay zeka dünyasına yön veren araştırma şirketidir. ChatGPT, DALL-E ve Sora gibi ürünleriyle tanınır.",
    seoTitle: "OpenAI Haberleri — GPT, ChatGPT, Sora Güncellemeleri",
    seoDescription: "OpenAI hakkında en güncel haberler: GPT modelleri, ChatGPT özellikleri, DALL-E görsel üretimi, Sora video AI ve OpenAI API gelişmeleri.",
  },
  chatgpt: {
    name: "ChatGPT", slug: "chatgpt", category: "yapay-zeka", icon: "💬", color: "#10A37F",
    keywords: ["GPT-4", "GPT-5", "OpenAI", "yapay zeka sohbet"],
    description: "ChatGPT, OpenAI tarafından geliştirilen, dünyanın en popüler yapay zeka sohbet asistanıdır.",
    seoTitle: "ChatGPT Haberleri — GPT-5, Yeni Özellikler, Kullanım İpuçları",
    seoDescription: "ChatGPT hakkında her şey: yeni özellikler, GPT-5 gelişmeleri, kullanım ipuçları, prompt mühendisliği ve ChatGPT Plus rehberleri.",
  },
  google: {
    name: "Google", slug: "google", category: "web", icon: "🔍", color: "#4285F4",
    keywords: ["Gemini", "Android", "Chrome", "Pixel", "Google AI"],
    description: "Google, arama motoru, yapay zeka, mobil işletim sistemi ve bulut teknolojilerinde dünya lideridir.",
    seoTitle: "Google Haberleri — Gemini AI, Android, Pixel Güncellemeleri",
    seoDescription: "Google hakkında en güncel teknoloji haberleri: Gemini yapay zeka, Android güncellemeleri, Pixel cihazlar ve Google Cloud.",
  },
  apple: {
    name: "Apple", slug: "apple", category: "mobil", icon: "🍎", color: "#555555",
    keywords: ["iPhone", "iPad", "Mac", "iOS", "Vision Pro", "Apple Intelligence"],
    description: "Apple, iPhone, Mac, iPad ve Vision Pro ile tüketici teknolojisinde öncüdür.",
    seoTitle: "Apple Haberleri — iPhone, iOS 19, Mac, Vision Pro",
    seoDescription: "Apple dünyasından son haberler: iPhone serisi, iOS güncellemeleri, Mac bilgisayarlar, Vision Pro ve Apple Intelligence.",
  },
  microsoft: {
    name: "Microsoft", slug: "microsoft", category: "yazilim", icon: "🪟", color: "#00A4EF",
    keywords: ["Windows", "Copilot", "Azure", "Office", "Xbox"],
    description: "Microsoft, Windows, Azure bulut platformu, Copilot AI asistanı ve Office ürünleriyle kurumsal teknolojinin lideridir.",
    seoTitle: "Microsoft Haberleri — Windows 12, Copilot, Azure",
    seoDescription: "Microsoft güncellemeleri: Windows 12 beklentileri, Copilot AI özellikleri, Azure bulut ve Microsoft 365 yenilikleri.",
  },
  meta: {
    name: "Meta", slug: "meta", category: "sosyal-medya", icon: "👤", color: "#0668E1",
    keywords: ["Facebook", "Instagram", "WhatsApp", "Threads", "Llama"],
    description: "Meta (eski Facebook), sosyal medya platformları ve açık kaynak yapay zeka modelleriyle teknoloji dünyasında yer alır.",
    seoTitle: "Meta Haberleri — Instagram, WhatsApp, Threads, Llama AI",
    seoDescription: "Meta platformlarındaki son gelişmeler: Instagram algoritma değişiklikleri, WhatsApp özellikleri, Threads ve Llama açık kaynak AI.",
  },
  nvidia: {
    name: "NVIDIA", slug: "nvidia", category: "donanim", icon: "🟢", color: "#76B900",
    keywords: ["RTX", "GPU", "CUDA", "GeForce", "AI", "DLSS"],
    description: "NVIDIA, yapay zeka ve oyun için GPU teknolojisinde dünya lideridir. RTX serisi ekran kartlarıyla tanınır.",
    seoTitle: "NVIDIA Haberleri — RTX 5090, GPU, Yapay Zeka",
    seoDescription: "NVIDIA hakkında en güncel haberler: RTX 50 serisi, GeForce ekran kartları, CUDA, AI hızlandırıcılar ve DLSS teknolojisi.",
  },
  tesla: {
    name: "Tesla", slug: "tesla", category: "otomotiv", icon: "⚡", color: "#E82127",
    keywords: ["EV", "FSD", "Cybertruck", "Optimus", "Model Y"],
    description: "Tesla, elektrikli araçlar, otonom sürüş ve robotik teknolojilerinde öncüdür.",
    seoTitle: "Tesla Haberleri — Cybertruck, FSD, Elektrikli Araçlar",
    seoDescription: "Tesla'dan son haberler: Cybertruck teslimatları, Full Self-Driving güncellemeleri, Optimus robot ve yeni Model Y.",
  },
  samsung: {
    name: "Samsung", slug: "samsung", category: "mobil", icon: "📱", color: "#1428A0",
    keywords: ["Galaxy", "One UI", "Exynos", "Galaxy AI"],
    description: "Samsung, Galaxy akıllı telefon serisi, tabletler ve tüketici elektroniğinde dünya lideridir.",
    seoTitle: "Samsung Haberleri — Galaxy S25, One UI, Galaxy AI",
    seoDescription: "Samsung Galaxy ekosistemi: Galaxy S25 serisi, One UI 7 güncellemesi, Galaxy AI özellikleri ve katlanabilir cihazlar.",
  },
  deepseek: {
    name: "DeepSeek", slug: "deepseek", category: "yapay-zeka", icon: "🧠", color: "#4F46E5",
    keywords: ["V3", "R1", "DeepSeek API", "açık kaynak AI"],
    description: "DeepSeek, uygun fiyatlı ve yüksek performanslı yapay zeka modelleriyle AI dünyasında rekabeti artırıyor.",
    seoTitle: "DeepSeek Haberleri — DeepSeek V3, R1, API Fiyatları",
    seoDescription: "DeepSeek hakkında her şey: DeepSeek V3 ve R1 modelleri, API fiyatlandırması, açık kaynak stratejisi ve rakiplerle karşılaştırmalar.",
  },
  claude: {
    name: "Claude", slug: "claude", category: "yapay-zeka", icon: "🤖", color: "#D97706",
    keywords: ["Anthropic", "Sonnet", "Opus", "Haiku", "Claude Code"],
    description: "Claude, Anthropic tarafından geliştirilen, güvenli ve etik yapay zeka asistanıdır.",
    seoTitle: "Claude Haberleri — Claude Sonnet, Opus, Anthropic",
    seoDescription: "Anthropic Claude hakkında güncel haberler: Claude Sonnet 4.6, Claude Opus, Claude Code ve API gelişmeleri.",
  },
  gemini: {
    name: "Gemini", slug: "gemini", category: "yapay-zeka", icon: "🌟", color: "#8E7CC3",
    keywords: ["Google", "Gemini Pro", "Gemini Ultra", "Google AI"],
    description: "Gemini, Google'ın en gelişmiş çok modlu yapay zeka modelidir.",
    seoTitle: "Gemini Haberleri — Gemini 2.5 Pro, Google AI",
    seoDescription: "Google Gemini hakkında son gelişmeler: Gemini 2.5 Pro, Gemini Ultra, Google AI Studio ve ücretsiz kullanım.",
  },
  xiaomi: { name: "Xiaomi", slug: "xiaomi", category: "mobil", icon: "📲", color: "#FF6900", keywords: ["Redmi", "POCO", "HyperOS"], description: "Xiaomi, uygun fiyatlı akıllı telefonlar ve akıllı ev ekosistemiyle tanınır.", seoTitle: "Xiaomi Haberleri", seoDescription: "Xiaomi hakkında en güncel teknoloji haberleri." },
  amazon: { name: "Amazon", slug: "amazon", category: "web", icon: "📦", color: "#FF9900", keywords: ["AWS", "Alexa", "Prime"], description: "Amazon, e-ticaret ve AWS bulut platformuyla teknoloji devidir.", seoTitle: "Amazon Haberleri — AWS, Alexa", seoDescription: "Amazon teknoloji haberleri: AWS, Alexa AI ve Amazon cihazları." },
  intel: { name: "Intel", slug: "intel", category: "donanim", icon: "💎", color: "#0071C5", keywords: ["Core Ultra", "Xeon", "Arc"], description: "Intel, işlemci teknolojisinde 50+ yıllık deneyime sahip yarı iletken devidir.", seoTitle: "Intel Haberleri — Core Ultra, ARC GPU", seoDescription: "Intel hakkında son haberler: Core Ultra işlemciler, ARC ekran kartları ve Xeon sunucu çipleri." },
  amd: { name: "AMD", slug: "amd", category: "donanim", icon: "🔴", color: "#ED1C24", keywords: ["Ryzen", "Radeon", "EPYC"], description: "AMD, Ryzen işlemciler ve Radeon ekran kartlarıyla bilgisayar donanımında güçlü bir oyuncudur.", seoTitle: "AMD Haberleri — Ryzen, Radeon", seoDescription: "AMD hakkında son gelişmeler: Ryzen işlemciler, Radeon GPU'lar ve EPYC sunucu çipleri." },
  twitter: { name: "X / Twitter", slug: "twitter", category: "sosyal-medya", icon: "𝕏", color: "#000000", keywords: ["Elon Musk", "Grok", "X Premium"], description: "X (eski Twitter), Elon Musk liderliğinde süper uygulama vizyonuyla dönüşüyor.", seoTitle: "X (Twitter) Haberleri — Grok AI", seoDescription: "X platformu haberleri: Grok AI, X Premium özellikleri ve platform güncellemeleri." },
  instagram: { name: "Instagram", slug: "instagram", category: "sosyal-medya", icon: "📷", color: "#E4405F", keywords: ["Reels", "Threads", "Meta"], description: "Instagram, Meta bünyesinde dünyanın en büyük görsel sosyal medya platformudur.", seoTitle: "Instagram Haberleri — Reels, Algoritma", seoDescription: "Instagram güncellemeleri: Reels algoritması, yeni özellikler, Threads entegrasyonu." },
  tiktok: { name: "TikTok", slug: "tiktok", category: "sosyal-medya", icon: "🎵", color: "#000000", keywords: ["ByteDance", "CapCut"], description: "TikTok, ByteDance'e ait kısa video platformudur.", seoTitle: "TikTok Haberleri — Yeni Özellikler", seoDescription: "TikTok hakkında güncel haberler ve platform güncellemeleri." },
  spacex: { name: "SpaceX", slug: "spacex", category: "bilim", icon: "🚀", color: "#005288", keywords: ["Starship", "Starlink", "Falcon"], description: "SpaceX, yeniden kullanılabilir roket teknolojisiyle uzay taşımacılığında devrim yaratıyor.", seoTitle: "SpaceX Haberleri — Starship, Starlink", seoDescription: "SpaceX'ten son haberler: Starship fırlatmaları, Starlink uydu ağı ve Falcon 9 görevleri." },
  bitcoin: { name: "Bitcoin", slug: "bitcoin", category: "genel", icon: "₿", color: "#F7931A", keywords: ["BTC", "kripto", "ETF", "halving"], description: "Bitcoin, dünyanın ilk ve en büyük kripto para birimidir.", seoTitle: "Bitcoin Haberleri — BTC, ETF, Kripto", seoDescription: "Bitcoin ve kripto para dünyasından son haberler: BTC fiyatı, ETF'ler ve blockchain gelişmeleri." },
  playstation: { name: "PlayStation", slug: "playstation", category: "oyun", icon: "🎮", color: "#003791", keywords: ["PS5", "PSVR2", "Sony"], description: "PlayStation, Sony'nin dünyaca ünlü oyun konsolu markasıdır.", seoTitle: "PlayStation Haberleri — PS5, PSVR2", seoDescription: "PlayStation dünyası: PS5 oyunları, PSVR2 ve Sony'nin oyun stratejisi." },
  xbox: { name: "Xbox", slug: "xbox", category: "oyun", icon: "🎯", color: "#107C10", keywords: ["Game Pass", "Microsoft"], description: "Xbox, Microsoft'un oyun platformudur. Game Pass ile oyun dünyasında devrim yarattı.", seoTitle: "Xbox Haberleri — Game Pass", seoDescription: "Xbox ekosistemi: Game Pass kütüphanesi, yeni oyunlar ve Microsoft'un oyun stratejisi." },
  "yapay-zeka": { name: "Yapay Zeka", slug: "yapay-zeka", category: "yapay-zeka", icon: "🧠", color: "#7C3AED", keywords: ["AI", "LLM", "GPT", "makine öğrenmesi"], description: "Yapay zeka, modern teknolojinin en dönüştürücü alanlarından biridir.", seoTitle: "Yapay Zeka Haberleri — AI, LLM, Makine Öğrenmesi", seoDescription: "Yapay zeka dünyasından en güncel haberler: LLM modelleri, makine öğrenmesi, AI araçları." },
  "siber-guvenlik": { name: "Siber Güvenlik", slug: "siber-guvenlik", category: "guvenlik", icon: "🔒", color: "#DC2626", keywords: ["hack", "veri ihlali", "şifre", "malware"], description: "Siber güvenlik, dijital dünyanın en kritik konularından biridir.", seoTitle: "Siber Güvenlik Haberleri", seoDescription: "Siber güvenlik haberleri: veri ihlalleri, hack saldırıları ve korunma yöntemleri." },
  blockchain: { name: "Blockchain", slug: "blockchain", category: "genel", icon: "⛓️", color: "#6366F1", keywords: ["kripto", "NFT", "Web3", "DeFi"], description: "Blockchain teknolojisi, merkeziyetsiz uygulamaların temelini oluşturur.", seoTitle: "Blockchain Haberleri — Web3, DeFi", seoDescription: "Blockchain ve Web3 dünyasından haberler: DeFi, NFT'ler ve merkeziyetsiz teknolojiler." },
};

// ─── Varsayılan Değerler ─────────────────────────────────────

export const DEFAULT_TOPIC_COLOR = "#3B82F6";
export const DEFAULT_TOPIC_ICON = "📌";

// ─── Yardımcı ────────────────────────────────────────────────

export function getTopicConfig(slug: string): TopicDefinition | null {
  return TOPIC_CONFIGS[slug] || null;
}

export function getAllTopicConfigs(): TopicDefinition[] {
  return Object.values(TOPIC_CONFIGS);
}
