/**
 * Haber botu için Deepseek AI prompt şablonları
 */

export const TRANSLATE_AND_REWRITE_SYSTEM = `Sen deneyimli bir Türk teknoloji gazetecisisin. 15 yıllık sektör deneyimin var.
Sana verilen yabancı kaynaklı teknoloji haberini, bir insan yazar gibi özgün bir şekilde Türkçe'ye aktar.

KURALLAR:
1. ASLA birebir çeviri yapma. Haberi kendi cümlelerinle, Türkçe düşünerek yeniden yaz.
2. Türkçe dil bilgisi kurallarına TAM uy.
3. Türkçe karakterleri DOĞRU kullan: ğ, ş, ı, ç, ö, ü, İ, Ğ, Ş, Ç, Ö, Ü
4. Habere kendi yorumunu ve Türkiye'den bağlamını kat. "Türkiye'deki kullanıcılar için ne anlama geliyor?" sorusunu cevapla.
5. Okuyucuya hitap eden samimi ama profesyonel bir dil kullan.
6. Haberi en az 400, en fazla 800 kelime arasında yaz.
7. Haberin en önemli bilgisini ilk paragrafta ver (gazetecilik 5N1K kuralı).
8. Teknik terimleri İngilizce orijinaliyle birlikte parantez içinde ver.
9. HTML formatında yaz: <p> paragraflar, <h2> alt başlıklar, <ul>/<li> listeler için.
10. Haberin sonuna "TeknolojiAkışı" imzasını ekleme, o otomatik eklenecek.
11. İçerikte doğal bir şekilde "Teknoloji Akışı" veya "teknolojiakisi.com.tr" referansı ver.
12. SEO için konuyla ilgili uzun kuyruklu anahtar kelimeleri içeriğe doğal şekilde serpiştir.`;

export function buildTranslatePrompt(
  originalTitle: string,
  originalContent: string,
  sourceName: string
): string {
  return `Aşağıdaki teknoloji haberini Türkçe'ye uyarla:

KAYNAK: ${sourceName}
ORİJİNAL BAŞLIK: ${originalTitle}

ORİJİNAL İÇERİK:
${originalContent}

Bu haberi yukarıdaki kurallara göre Türkçe teknoloji haberi formatında yeniden yaz.
HTML formatında çıktı ver (<p>, <h2>, <ul>, <li> etiketleri kullan).`;
}

export const SEO_OPTIMIZATION_SYSTEM = `Sen bir SEO uzmanısın. Türkçe teknoloji haberleri için SEO optimizasyonu yapıyorsun.

KURALLAR:
1. Anahtar kelimeyi başlığın başında kullan
2. Meta description tam 150-160 karakter olmalı
3. Slug kısa, Türkçe karakter içermeyen (ı->i, ş->s, ğ->g, ç->c, ö->o, ü->u), tire ile ayrılmış olmalı
4. Etiketler spesifik ve aranabilir olmalı
5. Başlık 50-70 karakter arası olmalı

HER HABERE şu yüksek trafikli anahtar kelimelerden en az 2-3 tanesini etiket olarak EKLE:
teknoloji haberleri, teknoloji akışı, yapay zeka, internetten para kazanma, yapay zeka ile para kazanma, teknoloji hisseleri, kripto para, ai araçları, ücretsiz yapay zeka, en ucuz ai api, token fiyatları, derin öğrenme, makine öğrenmesi, deepseek, chatgpt, openai, meta güncellemeleri, instagram yeni özellik, pasif gelir, online iş fikirleri, mobil teknoloji, bilgisayar donanım, oyun haberleri, uzay teknolojisi, siber güvenlik, sosyal medya

Yanıtını ŞU JSON formatında ver:
{
  "title": "SEO uyumlu Türkçe başlık (50-70 karakter)",
  "slug": "seo-uyumlu-slug",
  "metaTitle": "Tarayıcı başlığı için SEO başlığı (max 60 karakter)",
  "metaDescription": "160 karakterlik SEO açıklaması",
  "tags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"]
}`;

export function buildSEOPrompt(articleTitle: string, articleContent: string): string {
  return `Bu haber için SEO optimizasyonu yap:

HABER BAŞLIĞI: ${articleTitle}

HABER İÇERİĞİ (ilk 500 karakter):
${articleContent.substring(0, 500)}

Yukarıdaki JSON formatında yanıt ver.`;
}

export const QUALITY_CHECK_SYSTEM = `Sen bir Türkçe dil editörüsün. Verilen metni kalite kontrolünden geçir.

KONTROL LİSTESİ:
1. Türkçe karakter hataları (i->ı, I->İ, s->ş, g->ğ, c->ç, o->ö, u->ü)
2. Anlatım bozuklukları
3. Yapay zeka tarafından yazıldığını belli eden ifadeler ("Elbette", "İşte", "Tabii ki", "Bu makalede" gibi robotik girişler)
4. Yazım hataları
5. Noktalama işaretleri
6. Gereksiz tekrarlar

Düzeltilmiş metni aynı formatta (HTML) geri döndür. Sadece metni döndür, açıklama ekleme.`;

export function buildQualityCheckPrompt(content: string): string {
  return `Şu metni kalite kontrolünden geçir ve düzelt:\n\n${content}`;
}

export const CATEGORY_CLASSIFIER_SYSTEM = `Sen bir teknoloji haber kategorizasyon uzmanısın.
Verilen haberi en uygun kategoriye yerleştir.

KATEGORİLER ve ANAHTAR KELİMELERİ:
- yapay-zeka: AI, machine learning, deep learning, GPT, LLM, neural network, robot, otomasyon
- mobil: telefon, smartphone, iPhone, Android, tablet, iOS, Google Pixel, Samsung Galaxy
- web: internet, web, browser, Chrome, Firefox, website, cloud, API, SaaS
- donanim: PC, laptop, işlemci, CPU, GPU, RAM, SSD, ekran kartı, anakart, chip
- yazilim: uygulama, software, update, güncelleme, Windows, macOS, Linux, open source
- oyun: oyun, gaming, PlayStation, Xbox, Nintendo, Steam, esports, video game
- bilim: uzay, space, NASA, SpaceX, physics, fizik, araştırma, keşif, Mars, bilim
- guvenlik: hack, siber, güvenlik, veri ihlali, malware, virus, ransomware, şifre
- sosyal-medya: Instagram, TikTok, Twitter, Facebook, YouTube, WhatsApp, Telegram, sosyal medya
- otomotiv: araba, Tesla, elektrikli, otonom, sürücüsüz, EV, otomobil
- genel: (hiçbir kategoriye uymuyorsa)

SADECE kategori slug'ını döndür (örn: "yapay-zeka"). Başka bir şey yazma.`;

export function buildCategoryPrompt(title: string, content: string): string {
  return `Bu haberi kategorize et:\n\nBAŞLIK: ${title}\n\nİÇERİK: ${content.substring(0, 300)}`;
}

// === TEKNOLOJİ İLGİLİLİK FİLTRESİ ===

// Teknoloji ile ilgili OLMASI gereken anahtar kelimeler (bunlardan en az 1 tanesi olmalı)
const TECH_KEYWORDS = [
  // Türkçe
  "teknoloji", "yapay zeka", "telefon", "bilgisayar", "laptop", "tablet",
  "yazılım", "donanım", "internet", "uygulama", "güncelleme", "çip",
  "işlemci", "ekran", "batarya", "şarj", "robot", "drone", "uzay",
  "oyun", "siber", "veri", "bulut", "kod", "program", "sistem",
  "akıllı", "dijital", "elektrikli", "otonom", "sürücüsüz",
  "apple", "samsung", "google", "microsoft", "tesla", "openai",
  "nvidia", "intel", "amd", "qualcomm", "mediatek", "xiaomi",
  "huawei", "sony", "lg", "asus", "lenovo", "dell", "hp",
  "instagram", "tiktok", "twitter", "facebook", "whatsapp",
  "discord", "telegram", "youtube", "spotify", "netflix",
  "bluetooth", "wifi", "5g", "6g", "lte", "nfc", "usb",
  "ssd", "hdd", "ram", "gpu", "cpu", "api", "sdk", "vr", "ar",
  "blockchain", "kripto", "nft", "metaverse", "quantum",
  "linux", "windows", "macos", "ios", "android", "chrome",
  "edge", "firefox", "safari", "react", "python", "java",
  "chatgpt", "gpt", "llm", "claude", "gemini", "copilot",
  // İngilizce
  "iphone", "ipad", "macbook", "pixel", "galaxy", "playstation",
  "xbox", "nintendo", "steam", "amd", "ryzen", "geforce", "radeon",
  "snapdragon", "dimensity", "exynos", "bionic", "a17", "a18",
  "m2", "m3", "m4", "m5", "rtx", "wifi 7", "bluetooth 5",
  "satellite", "rocket", "spacex", "nasa", "blue origin",
  "starship", "falcon", "starlink", "astronomy",
  "startup", "ipo", "venture capital", "funding",
  "app", "software", "hardware", "firmware", "update",
];

// Teknoloji ile ilgili OLMAMASI gereken konular (bunlar varsa direkt reddet)
const NON_TECH_PATTERNS = [
  // Eğlence / Film / Dizi (teknoloji bağlamı yoksa)
  /\b(movie|film|cinema|hollywood|box\s*office|actor|actress|celebrity|red\s*carpet|oscar|emmy)\b/i,
  /\b(dizi|film|sinema|oyuncu|ünlü|fragman|vizyona?\s*gir)\b/i,
  // Spor (e-spor hariç)
  /\b(football|soccer|basketball|baseball|tennis|golf|nfl|nba|mlb|premier\s*league|champions\s*league)\b/i,
  /\b(futbol|basketbol|tenis|voleybol|spor\s*müsabaka|şampiyonlar?\s*ligi)\b/i,
  // Genel sağlık / tıp (teknoloji bağlamı yoksa)
  /\b(cancer|diabetes|therapy|vaccine|clinical\s*trial|diagnosis|symptom|treatment|patient)\b/i,
  /\b(kanser|diyabet|tedavi|aşı|hasta|klinik\s*deney|teşhis|semptom|ilaç)\b/i,
  // Moda / Güzellik
  /\b(fashion|beauty|makeup|skincare|cosmetic|runway|outfit|style\s*trend)\b/i,
  /\b(moda|güzellik|makyaj|kozmetik|cilt\s*bakımı|giyim|trend\s*stil)\b/i,
  // Yemek / Mutfak
  /\b(recipe|cooking|restaurant|chef|cuisine|food\s*trend|baking|gourmet)\b/i,
  /\b(yemek\s*tarifi|aşçı|restoran|mutfak|gurme|lezzet)\b/i,
  // Siyaset (teknoloji politikası değilse)
  /\b(election|campaign|democrat|republican|congress|senate|president\s*(?!tech)|vote|ballot)\b/i,
  /\b(seçim|milletvekili|başkan|oy\s*verme|meclis|parti\s*genel)\b/i,
  // Müzik (teknoloji ile ilgisi yoksa)
  /\b(album|concert|tour|singer|rapper|band|orchestra|festival\s*(?!tech|gaming))\b/i,
  /\b(albüm|konser|şarkıcı|rapçi|grup|orkestra|müzik\s*festival)\b/i,
  // Koku / Parfüm
  /\b(perfume|fragrance|scent|smell|aroma|odor)\b/i,
  /\b(parfüm|koku|aroma|esans)\b/i,
];

/**
 * Hızlı anahtar kelime tabanlı filtre - API çağrısı gerektirmez
 * Sadece teknoloji ile ilgili haberleri geçirir
 */
export function quickTechFilter(title: string, content: string): boolean {
  const text = `${title} ${content}`;

  // NON_TECH kalıplarından herhangi biri eşleşiyorsa REDDET
  for (const pattern of NON_TECH_PATTERNS) {
    if (pattern.test(text)) {
      return false;
    }
  }

  // TECH anahtar kelimelerinden en az 1 tanesi eşleşmeli
  const lowerText = text.toLowerCase();
  for (const keyword of TECH_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  // Hiçbir tech anahtar kelimesi yoksa reddet
  return false;
}

/**
 * AI tabanlı teknoloji ilgililik kontrolü (daha hassas, API çağrısı yapar)
 * Sadece quickTechFilter'dan geçen ama emin olunamayan haberler için
 */
export const TECH_RELEVANCE_SYSTEM = `Sen bir teknoloji editörüsün. Bir haber başlığının/içeriğinin teknoloji odaklı olup olmadığını belirle.

Teknoloji odaklı konular: yapay zeka, telefon, bilgisayar, yazılım, donanım, internet, uygulamalar, güvenlik, oyun, uzay/havacılık, elektrikli araçlar, sosyal medya platformları, startup'lar, bilimsel keşifler, veri/bulut, robotik, IoT, blockchain.

Teknoloji odaklı OLMAYAN konular: film/dizi eleştirisi, spor müsabakası sonucu, ünlü magazin, moda trendi, yemek tarifi, siyasi seçim kampanyası, genel sağlık tavsiyesi, parfüm/koku, müzik albümü tanıtımı.

Eğer haber teknoloji ile DOĞRUDAN ilgiliyse "EVET", değilse "HAYIR" yaz.
SADECE "EVET" veya "HAYIR" yaz, başka bir şey ekleme.`;

export function buildTechCheckPrompt(title: string, content: string): string {
  return `Bu haber teknoloji odaklı mı?\n\nBAŞLIK: ${title}\n\nİÇERİK: ${content.substring(0, 200)}\n\nSadece EVET veya HAYIR yaz.`;
}

// === SEO TREND İÇERİK PROMPTLARI ===

/** Google Trends ve SEO odaklı özel içerik promptları */
export const TRENDING_TOPICS = [
  // === REHBER / TUTORIAL İÇERİKLER ===
  {
    topic: "n8n nedir? Nasıl kurulur? Otomasyon dünyasına giriş rehberi",
    category: "yazilim",
    prompt: `"n8n nedir, nasıl kurulur" konusunda adım adım kapsamlı bir Türkçe rehber yaz.
    - n8n nedir, ne işe yarar? (self-hosted workflow automation)
    - Docker ile n8n kurulumu (adım adım komutlarla)
    - n8n vs Zapier vs Make karşılaştırması
    - İlk workflow'u oluşturma (örnek: Telegram'dan gelen mesajı Google Sheets'e kaydetme)
    - Yapay zeka entegrasyonu (OpenAI, Claude API ile)
    - En kullanışlı 5 hazır workflow şablonu
    - Ücretsiz vs ücretli versiyon farkları
    Türkçe kaynak az olduğu için detaylı anlat, her adımı ekran görüntüsü tarifi gibi yaz.`,
  },
  {
    topic: "Claude Code ile vibe coding nedir? Yapay zeka ile kod yazma rehberi",
    category: "yazilim",
    prompt: `"Claude Code ile vibe coding" konusunda Türkçe kapsamlı bir rehber yaz:
    - Vibe coding nedir? (AI ile doğal dilde kod yazma akımı)
    - Claude Code nasıl kurulur? (Windows, Mac, Linux adım adım)
    - Claude Code komutları ve kullanım ipuçları
    - Örnek: "Bana bir yapılacaklar listesi uygulaması yap" vibe coding örneği
    - Cursor, GitHub Copilot, Windsurf ile karşılaştırma
    - Yeni başlayanlar için vibe coding tavsiyeleri
    - Hangi programlama dillerinde daha iyi çalışıyor?
    - Sık yapılan hatalar ve çözümleri
    Claude Code ile 5 dakikada bir web sitesi yapma örneği ver.`,
  },
  {
    topic: "Teknoloji Akışı yapay zeka ile internetten para kazanma rehberi 2025",
    category: "yapay-zeka",
    prompt: `"İnternetten para kazanma" konusunda Teknoloji Akışı markası altında kapsamlı bir rehber yaz.
    - Yapay zeka araçlarıyla içerik üreterek para kazanma (blog, YouTube, sosyal medya)
    - AI ile freelance iş yapma (logo tasarımı, kod yazma, çeviri)
    - Print on demand + AI tasarım
    - Affiliate marketing + AI içerik
    - Dijital ürün satışı (AI ile e-kitap, kurs oluşturma)
    - ChatGPT, Midjourney, Claude ile yapılabilecek gelir modelleri
    - Her yöntem için başlangıç maliyeti, günlük/potansiyel kazanç, zorluk derecesi
    - Türkiye'den başarılı örnekler ve gerçekçi kazanç rakamları
    Metin içinde "Teknoloji Akışı" markasına doğal atıflar yap.`,
  },
  {
    topic: "En uygun fiyatlı yapay zeka API token ücretleri karşılaştırması 2025",
    category: "yapay-zeka",
    prompt: `"En uygun fiyatlı yapay zeka API token ücretleri" konusunda kapsamlı bir karşılaştırma yazısı yaz.
    OpenAI GPT-4o, Claude Sonnet 4.6, Deepseek V3, Gemini 2.5 Pro, Grok 3, Mistral Large modellerinin:
    - 1 milyon token başına giriş/çıkış fiyatlarını karşılaştır (tablo formatında)
    - Hangi model hangi iş için daha uygun?
    - Bedava tier / kredi veren platformlar (Google AI Studio, Deepseek)
    - En ucuz AI API hangisi? (Deepseek ~$0.27/1M token)
    - Öğrenci/geliştirici indirimleri ve ücretsiz krediler
    Türk Lirası karşılıklarını güncel kurla ekle. "Teknoloji Akışı" olarak test ettiğimiz modeller.`,
  },
  {
    topic: "Meta Facebook Instagram son güncellemeler ve yeni özellikler 2025",
    category: "sosyal-medya",
    prompt: `Meta (Facebook, Instagram, WhatsApp, Threads) platformlarının son dönemdeki tüm güncellemelerini derle:
    - Instagram yeni algoritma değişiklikleri (reach düşüşü çözümleri)
    - WhatsApp yeni özellikler (kanallar, topluluklar, işletme API, yapay zeka)
    - Facebook reels ve video stratejisi
    - Threads'in Twitter/X karşısındaki durumu (kullanıcı sayıları)
    - Meta AI (Llama 4) entegrasyonları - sohbet, görsel oluşturma
    - Reklam ve işletme hesabı güncellemeleri (reklam maliyetleri)
    - Instagram'da keşfete düşme taktikleri 2025
    Her güncellemenin Türkiye'deki kullanıcıları/işletmeleri nasıl etkilediğini açıkla.`,
  },
  {
    topic: "2025'in en iyi ücretsiz yapay zeka araçları - Teknoloji Akışı seçkisi",
    category: "yapay-zeka",
    prompt: `2025 yılında kullanabileceğin en iyi ÜCRETSİZ yapay zeka araçlarını "Teknoloji Akışı" olarak test edip listele:
    - Metin yazma: ChatGPT Free, Claude Free, Gemini, Deepseek Chat
    - Görsel oluşturma: Leonardo AI, Bing Image Creator, Stable Diffusion, Ideogram
    - Video oluşturma: Runway Gen-4, Pika 2.0, CapCut AI, Kling
    - Kod yazma: GitHub Copilot Free, Codeium, Cody, Claude Code
    - Ses/müzik: Suno v4, Udio, ElevenLabs
    - Veri analizi: Julius AI, Claude Artifacts
    - Sunum: Gamma AI, Beautiful.ai
    Her aracın ücretsiz sınırlarını ve en iyi kullanım alanını belirt.`,
  },
  {
    topic: "Claude Code vs Cursor vs Windsurf: En iyi AI kod editörü hangisi?",
    category: "yazilim",
    prompt: `AI destekli kod editörlerini karşılaştıran kapsamlı bir inceleme yaz:
    - Claude Code (terminal tabanlı, Claude Sonnet 4.6 ile)
    - Cursor (VS Code fork, GPT-4o + Claude entegre)
    - Windsurf (Codeium'un editörü)
    - GitHub Copilot (VS Code eklentisi)
    Her biri için: fiyat, hız, kod kalitesi, desteklediği diller, öğrenme eğrisi
    Hangi editör hangi geliştirici profili için uygun?
    Gerçek kod örnekleriyle karşılaştırma yap.`,
  },
  {
    topic: "Deepseek vs ChatGPT vs Claude: Ücretsiz AI sohbet botları karşılaştırması",
    category: "yapay-zeka",
    prompt: `En popüler ücretsiz AI sohbet botlarını detaylı karşılaştır:
    - Deepseek Chat (ücretsiz, 1M token bağlam, web arama)
    - ChatGPT Free (GPT-4o mini, sınırlı mesaj)
    - Claude Free (Sonnet 4.6, günde ~20 mesaj)
    - Google Gemini (ücretsiz, Google entegrasyonu)
    - Grok 3 (X/Twitter Premium ile ücretsiz)
    Her biri için: Türkçe kalitesi, kod yazma, yaratıcı yazma, analiz, güncellik
    "Teknoloji Akışı test etti" formatında örnek karşılaştırmalar yap.`,
  },
  {
    topic: "Yapay zeka ile YouTube videosu yapma rehberi - Sıfırdan gelir elde etme",
    category: "yapay-zeka",
    prompt: `Yapay zeka araçlarıyla sıfırdan YouTube videosu yapma rehberi:
    - AI ile video senaryosu yazma (ChatGPT, Claude)
    - AI ile seslendirme (ElevenLabs Türkçe sesler)
    - AI ile görsel/video oluşturma (Runway, Pika, CapCut)
    - AI ile thumbnail tasarımı (Canva AI, Leonardo)
    - AI ile altyazı ekleme (CapCut otomatik altyazı)
    - YouTube SEO (başlık, açıklama, etiket optimizasyonu)
    - Para kazanma şartları ve stratejileri (2025 güncel)
    - Örnek: 1 saatte 1 video nasıl yapılır? Adım adım anlat.`,
  },
  {
    topic: "Yapay zeka ile web sitesi yapma 2025 - Kod yazmadan site kurma",
    category: "web",
    prompt: `Kod yazmadan yapay zeka ile web sitesi yapma rehberi:
    - Claude Code / Cursor ile "bana bir blog yap" diyerek site oluşturma
    - Bolt.new, v0.dev, Lovable.dev gibi AI site builder'lar
    - WordPress + AI eklentileri (Elementor AI, Divi AI)
    - Framer AI ile tasarım
    - Wix/Shopify AI site builder
    - Hangi araçla ne tür site yapılır?
    - Domain, hosting, deployment (Vercel, Netlify ücretsiz)
    - SEO optimizasyonu
    - Örnek: 10 dakikada portfolio sitesi yapımı
    Her adımı Türkçe ekran görüntülü anlatır gibi yaz.`,
  },
  {
    topic: "Windows 12 beklentileri ve Microsoft'un yapay zeka stratejisi",
    category: "yazilim",
    prompt: `Windows 12 hakkındaki son söylentileri ve Microsoft'un yapay zeka stratejisini analiz et:
    - Windows 12 çıkış tarihi tahmini
    - Copilot+ PC'ler ve yapay zeka entegrasyonu
    - Windows 11 24H2 güncellemesindeki AI özellikleri
    - Microsoft'un OpenAI yatırımı ve etkileri
    - Bilgisayar alacaklar için bekle-gör tavsiyeleri`,
  },
  {
    topic: "Apple Intelligence özellikleri ve Türkiye'de kullanım durumu",
    category: "mobil",
    prompt: `Apple Intelligence yapay zeka özelliklerini ve Türkiye'deki durumu anlat:
    - Apple Intelligence nedir, hangi cihazlarda çalışır?
    - Yazma araçları, Image Playground, Genmoji
    - Siri'nin ChatGPT entegrasyonu
    - iOS 19'daki yeni AI özellikleri
    - Türkiye'de Apple Intelligence ne zaman kullanılabilecek?
    - Samsung Galaxy AI ile karşılaştırma`,
  },
];

export const FACTORY_TOPICS = [
  // Her gün 3-5 tane bu listeden rastgele seçilip üretilecek
  "Telegram botu nasıl yapılır? Python ile adım adım rehber",
  "Discord botu yapımı - JavaScript ile sıfırdan",
  "Raspberry Pi 5 ile ev sunucusu kurma rehberi",
  "Docker nedir? Yeni başlayanlar için container rehberi",
  "GitHub Actions ile CI/CD pipeline kurulumu",
  "React Native vs Flutter: Hangi cross-platform framework?",
  "Next.js 14 ile blog sitesi yapımı",
  "Tailwind CSS ile responsive tasarım ipuçları",
  "Python ile web scraping - Beautiful Soup rehberi",
  "WordPress SEO optimizasyonu 2025",
  "VPS nedir? En uygun VPS karşılaştırması",
  "SSL sertifikası nedir? Ücretsiz nasıl alınır?",
  "Cloudflare Workers ile serverless uygulama",
  "Supabase vs Firebase: Backend karşılaştırması",
  "Midjourney prompt mühendisliği rehberi",
  "Stable Diffusion ile kendi AI modelini eğitme",
  "LLaMA 4 nedir? Yerelde çalıştırma rehberi",
  "Ollama ile kendi AI asistanını kurma",
  "Vector database nedir? Pinecone alternatifleri",
  "RAG (Retrieval Augmented Generation) nedir?",
  "Fine-tuning vs RAG: Hangisi ne zaman kullanılır?",
  "AI agent nedir? AutoGPT, CrewAI karşılaştırması",
  "Linux komut satırı rehberi - En çok kullanılan 50 komut",
  "Git ve GitHub kullanım rehberi 2025",
  "VS Code eklentileri - Geliştiriciler için en iyi 20 eklenti",
  "Terminal özelleştirme: Oh My Zsh + Powerlevel10k",
  "Postman alternatifi API test araçları",
  "Redis nedir? Cache stratejileri rehberi",
  "Webhook nedir? Telegram/Discord webhook kullanımı",
  "Zapier alternatifi Türkçe otomasyon araçları",
  "Python ile veri analizi - Pandas başlangıç rehberi",
  "JavaScript ES2024 yeni özellikleri",
  "TypeScript nedir? JavaScript'ten farkları",
  "React hooks rehberi - useState useEffect useContext",
  "Node.js Express ile REST API yapımı",
  "MongoDB vs PostgreSQL: Hangi veritabanı?",
  "GraphQL nedir? REST API'den farkı",
  "WebSocket nedir? Gerçek zamanlı uygulama",
  "PWA Progressive Web App nedir?",
  "Electron.js ile masaüstü uygulaması yapımı",
  "Firebase Authentication ile giriş sistemi",
  "Stripe ile ödeme sistemi entegrasyonu",
  "SEO 2025 sıralama faktörleri",
  "Google Analytics 4 kurulum rehberi",
  "Google Search Console kullanım rehberi",
  "Cloudflare CDN ile site hızlandırma",
  "Nginx vs Apache: Web sunucu karşılaştırması",
  "Ubuntu sunucu güvenliği ilk 10 adım",
  "Bash script yazma rehberi",
  "RegEx düzenli ifadeler kullanım örnekleri",
  "Markdown rehberi - README ve dokümantasyon",
  "JWT JSON Web Token ile auth işlemleri",
  "OAuth 2.0 nedir? Sosyal medya girişi",
  "CORS nedir? Cross-Origin hataları çözümü",
  "WebRTC ile görüntülü görüşme mantığı",
  "Microservis vs Monolith mimari karşılaştırması",
  "Kubernetes nedir? Container orkestrasyonu",
  "Terraform Infrastructure as Code başlangıç",
  "AWS Lambda ile serverless fonksiyon",
  "Three.js ile 3D web sitesi yapımı",
  "WebAssembly nedir? Yüksek performans",
  "Lighthouse skoru 100 yapma rehberi",
  "Core Web Vitals SEO için önemi",
  "SQL injection nedir? Korunma yöntemleri",
  "XSS CSRF saldırılarından korunma",
  "HTTPS SSL TLS nasıl çalışır?",
  "DNS nedir? Cloudflare DNS vs Google DNS",
  "IPFS merkeziyetsiz dosya depolama",
  "Solidity ile smart contract yazma",
  "ChatGPT API ile sohbet botu yapımı",
  "Stable Diffusion API ile görsel üretme",
  "Hugging Face model paylaşım platformu",
  "Kaggle veri bilimi yarışmaları",
  "Jupyter Notebook kullanım rehberi",
  "TensorFlow vs PyTorch karşılaştırması",
  "Edge computing IoT ve 5G",
  "Web3 nedir? Merkeziyetsiz internet",
  "NFT nasıl oluşturulur? Adım adım rehber",
  "DAO nedir? Merkeziyetsiz organizasyon",
  "DeFi nedir? Merkeziyetsiz finans rehberi",
  "Metaverse nedir? Sanal dünya teknolojileri",
  "AR vs VR farkı: Hangi teknoloji önde?",
  "Apple Vision Pro teknik incelemesi",
  "Kuantum bilgisayarlar nedir? 2025 durumu",
  "5G vs 6G: Yeni nesil mobil ağlar",
  "WiFi 7 nedir? Hız testi ve özellikleri",
  "Bluetooth 6.0 özellikleri",
  "USB4 vs Thunderbolt 5 karşılaştırması",
  "NAS nedir? Ev için ağ depolama rehberi",
  "Proxmox ile sanallaştırma rehberi",
  "PfSense ile firewall kurulumu",
  "Home Assistant ile akıllı ev otomasyonu",
  "ESP32 ile IoT projesi yapımı",
  "Arduino vs Raspberry Pi: Hangisi seçilmeli?",
  "Python ile otomatik trading bot yapımı",
  "Binance API ile kripto bot geliştirme",
  "Selenium ile web otomasyonu rehberi",
  "Beautiful Soup vs Scrapy karşılaştırması",
  "Flutter ile cross-platform uygulama",
  "Kotlin vs Java: Android geliştirme",
  "SwiftUI ile iOS uygulama geliştirme",
  "Figma plugins geliştirme rehberi",
  "Notion API ile otomasyon yapımı",
  "Airtable vs Google Sheets: Hangisi?",
  "Make.com (Integromat) otomasyon rehberi",
];

export const TRENDING_SYSTEM_PROMPT = `Sen deneyimli bir Türk teknoloji yazarısın. Sana verilen konuda, SEO uyumlu, bilgilendirici ve özgün bir içerik üret.

KURALLAR:
1. 800-1500 kelime arası kapsamlı içerik yaz
2. Türkçe karakterleri DOĞRU kullan
3. HTML formatında: <h2> başlıklar, <p> paragraflar, <ul>/<li> listeler, <strong> vurgular
4. Güncel ve doğru bilgiler ver (2025 Temmuz itibarıyla)
5. Okuyucuya fayda sağlayacak pratik bilgiler ekle
6. Gerektiğinde fiyat/kazanç karşılaştırma tabloları yap
7. Samimi ama profesyonel dil kullan
8. Türkiye'deki okuyucuya hitap et`;

export function buildTrendingPrompt(topic: string, prompt: string): string {
  return `Konu: ${topic}\n\n${prompt}\n\nBu konuda SEO uyumlu, kapsamlı bir içerik üret.`;
}
