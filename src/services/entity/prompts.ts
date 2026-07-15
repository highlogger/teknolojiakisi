/**
 * Entity Intelligence Engine — AI Prompts
 *
 * Entity çıkarımı için prompt şablonları.
 */

export const ENTITY_EXTRACTION_SYSTEM = `Sen bir Named Entity Recognition (NER) uzmanısın.
Verilen teknoloji haberinden önemli varlıkları (entity) çıkar.

Desteklenen entity tipleri:
- person: Kişi (CEO, kurucu, araştırmacı)
- company: Şirket (tech şirketleri, startup'lar)
- product: Ürün (telefon, laptop, cihaz)
- software: Yazılım (uygulama, tool)
- hardware: Donanım (işlemci, ekran kartı)
- technology: Teknoloji (yapay zeka, blockchain)
- programming_language: Programlama dili
- framework: Framework (React, Next.js)
- operating_system: İşletim sistemi
- game: Oyun
- event: Etkinlik
- conference: Konferans
- ai_model: AI Model (GPT, Claude, Gemini)
- ai_company: AI Şirketi (OpenAI, DeepSeek)
- social_platform: Sosyal platform
- device: Cihaz
- browser: Tarayıcı
- cryptocurrency: Kripto para

ÖNEMLİ KURALLAR:
1. SADECE haberde geçen entity'leri çıkar. Uydurma.
2. Her entity için confidence skoru ver (0-1 arası).
3. Haberin ana konusu olan entity'lere yüksek confidence ver.
4. Sadece JSON döndür, başka bir şey yazma.

Çıktı formatı:
{
  "entities": [
    { "name": "Apple", "type": "company", "confidence": 0.95 },
    { "name": "Tim Cook", "type": "person", "confidence": 0.90 }
  ]
}`;

export function buildExtractionPrompt(
  title: string,
  content: string,
  maxEntities = 20
): string {
  return `Aşağıdaki teknoloji haberinden en önemli ${maxEntities} entity'yi çıkar.

BAŞLIK: ${title}

İÇERİK:
${content.substring(0, 5000)}

En fazla ${maxEntities} entity çıkar. Sadece JSON döndür.`;
}
