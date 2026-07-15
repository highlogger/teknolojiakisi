/**
 * Verification Agent — Entity Checker
 *
 * Entity doğrulaması yapar:
 * - Şirket isimleri doğru mu?
 * - Ürün isimleri doğru mu?
 * - Kişi isimleri doğru mu?
 * - Versiyon numaraları doğru mu?
 * - Model isimleri doğru mu?
 */

import type { EntityCheckResult, ResearchInput } from "./types";
import { KNOWN_TECHNICAL_TERMS } from "./constants";

/**
 * Entity'leri bilinen referans listeleriyle karşılaştırarak doğrula
 */
export function checkEntities(research: ResearchInput): EntityCheckResult {
  const checkedEntities: EntityCheckResult["checkedEntities"] = [];
  const corrections: string[] = [];
  const warnings: string[] = [];

  if (!research.entities) {
    return {
      allEntitiesValid: true,
      checkedEntities: [],
      corrections: [],
    };
  }

  const allKnownTerms = new Map<string, string>(); // lowercase → correct casing
  for (const [, terms] of Object.entries(KNOWN_TECHNICAL_TERMS)) {
    for (const term of terms) {
      allKnownTerms.set(term.toLowerCase(), term);
    }
  }

  // Tüm entity'leri topla
  const entityList: Array<{ name: string; type: string }> = [];

  for (const person of research.entities.people || []) {
    entityList.push({ name: person, type: "person" });
  }
  for (const company of research.entities.companies || []) {
    entityList.push({ name: company, type: "company" });
  }
  for (const product of research.entities.products || []) {
    entityList.push({ name: product, type: "product" });
  }
  for (const tech of research.entities.technologies || []) {
    entityList.push({ name: tech, type: "technology" });
  }

  // Her entity'yi kontrol et
  for (const entity of entityList) {
    const lowerName = entity.name.toLowerCase().trim();
    const knownExact = allKnownTerms.get(lowerName);

    if (knownExact && knownExact !== entity.name) {
      // Bilinen bir terim ama yazımı farklı
      checkedEntities.push({
        name: entity.name,
        type: entity.type,
        suggestedName: knownExact,
        isCorrect: false,
        confidence: 90,
        issue: `Yazım düzeltmesi: "${entity.name}" → "${knownExact}"`,
      });
      corrections.push(`"${entity.name}" → "${knownExact}"`);
    } else if (knownExact) {
      // Tam eşleşme
      checkedEntities.push({
        name: entity.name,
        type: entity.type,
        suggestedName: null,
        isCorrect: true,
        confidence: 95,
      });
    } else {
      // Bilinmeyen entity — potansiyel sorun
      const fuzzyMatch = findFuzzyMatch(entity.name, allKnownTerms);
      if (fuzzyMatch) {
        checkedEntities.push({
          name: entity.name,
          type: entity.type,
          suggestedName: fuzzyMatch,
          isCorrect: false,
          confidence: 60,
          issue: `Bilinmeyen isim, "${fuzzyMatch}" olabilir mi?`,
        });
        corrections.push(`"${entity.name}" → "${fuzzyMatch}" (düşük güven)`);
      } else {
        checkedEntities.push({
          name: entity.name,
          type: entity.type,
          suggestedName: null,
          isCorrect: true, // Bilinmeyen ama hata da diyemeyiz
          confidence: 50,
          issue: "Referans listesinde bulunamadı, doğrulanamadı.",
        });
      }
    }
  }

  const allValid = corrections.length === 0;
  const invalidCount = checkedEntities.filter((e) => !e.isCorrect).length;

  let score = 100;
  if (invalidCount > 0) {
    score = Math.max(0, 100 - invalidCount * 15);
  }

  return {
    allEntitiesValid: allValid,
    checkedEntities,
    corrections,
  };
}

/**
 * Basit fuzzy matching (Levenshtein mesafesi mantığı)
 */
function findFuzzyMatch(
  name: string,
  knownTerms: Map<string, string>
): string | null {
  const lower = name.toLowerCase().trim();

  // Prefix match
  for (const [key, value] of knownTerms) {
    if (key.startsWith(lower.substring(0, 5)) || lower.startsWith(key.substring(0, 5))) {
      if (Math.abs(key.length - lower.length) <= 3) {
        return value;
      }
    }
  }

  return null;
}
