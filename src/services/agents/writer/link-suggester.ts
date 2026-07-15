/**
 * Writer Agent — Link Suggester
 *
 * Haber içeriğindeki entity'ler için iç link adayları önerir.
 * Henüz makaleye yerleştirmez, sadece öneri üretir.
 */

import type { InternalLinkCandidate } from "./types";

/**
 * Entity'lere göre iç link adayları üret
 */
export function suggestInternalLinks(
  article: string,
  entities: {
    people: string[];
    companies: string[];
    products: string[];
    technologies: string[];
  }
): InternalLinkCandidate[] {
  const candidates: InternalLinkCandidate[] = [];

  // Topic mapping
  const topicMap: Record<string, string> = {
    openai: "/topic/openai",
    google: "/topic/google",
    microsoft: "/topic/microsoft",
    apple: "/topic/apple",
    meta: "/topic/meta",
    amazon: "/topic/amazon",
    tesla: "/topic/tesla",
    nvidia: "/topic/nvidia",
    samsung: "/topic/samsung",
    xiaomi: "/topic/xiaomi",
    // AI modelleri
    gpt: "/topic/gpt",
    chatgpt: "/topic/chatgpt",
    claude: "/topic/claude",
    gemini: "/topic/gemini",
    deepseek: "/topic/deepseek",
    llama: "/topic/llama",
    // Teknolojiler
    "yapay zeka": "/topic/yapay-zeka",
    "machine learning": "/topic/machine-learning",
    blockchain: "/topic/blockchain",
    kripto: "/topic/kripto",
    metaverse: "/topic/metaverse",
    "5g": "/topic/5g",
    iot: "/topic/iot",
  };

  // Şirket linkleri
  for (const company of entities.companies) {
    const lower = company.toLowerCase();
    const topic = topicMap[lower];
    if (topic) {
      // Makalede geçiyor mu kontrol et
      if (article.toLowerCase().includes(lower)) {
        candidates.push({
          anchorText: company,
          suggestedUrl: topic,
          topic: lower,
          confidence: 95,
          context: `${company} ile ilgili bölüm`,
        });
      }
    }
  }

  // Ürün linkleri
  for (const product of entities.products) {
    const lower = product.toLowerCase();
    const topic = topicMap[lower];
    if (topic && article.toLowerCase().includes(lower)) {
      candidates.push({
        anchorText: product,
        suggestedUrl: topic,
        topic: lower,
        confidence: 85,
        context: `${product} ile ilgili bölüm`,
      });
    }
  }

  // Teknoloji linkleri
  for (const tech of entities.technologies) {
    const lower = tech.toLowerCase();
    const topic = topicMap[lower];
    if (topic && article.toLowerCase().includes(lower)) {
      candidates.push({
        anchorText: tech,
        suggestedUrl: topic,
        topic: lower,
        confidence: 80,
        context: `${tech} ile ilgili bölüm`,
      });
    }
  }

  // Kişi linkleri
  for (const person of entities.people) {
    if (article.toLowerCase().includes(person.toLowerCase())) {
      const slug = person
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      candidates.push({
        anchorText: person,
        suggestedUrl: `/kisi/${slug}`,
        topic: person.toLowerCase(),
        confidence: 70,
        context: `${person} ile ilgili bölüm`,
      });
    }
  }

  // Confidence'a göre sırala
  candidates.sort((a, b) => b.confidence - a.confidence);

  return candidates.slice(0, 10);
}

/**
 * Anchor text'in makalede geçtiği ilk konumu bul
 */
export function findAnchorPosition(
  article: string,
  anchorText: string
): { found: boolean; paragraph: number; context: string } {
  const paragraphs = article.split(/\n\n+/);

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    if (paragraph.toLowerCase().includes(anchorText.toLowerCase())) {
      return {
        found: true,
        paragraph: i,
        context: paragraph.substring(0, 200),
      };
    }
  }

  return {
    found: false,
    paragraph: -1,
    context: "",
  };
}
