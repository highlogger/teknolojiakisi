/**
 * GEO Engine — Validator
 *
 * GEO uyumluluğunu kontrol eder.
 */

import type { GEOAnalysis, GEOValidation, GEOIssue } from "../types";
import { GEO_THRESHOLDS } from "../config";

export function validateGEO(analysis: GEOAnalysis): GEOValidation {
  const issues: GEOIssue[] = [];
  const warnings: GEOIssue[] = [];
  const passed: string[] = [];

  const check = (
    field: string,
    value: number,
    min: number,
    message: string,
    suggestion?: string
  ) => {
    if (value < GEO_THRESHOLDS.low) {
      issues.push({ field, message: `${message} (${Math.round(value * 100)}%)`, severity: "error", suggestion });
    } else if (value < GEO_THRESHOLDS.high) {
      warnings.push({ field, message: `${message} (${Math.round(value * 100)}%)`, severity: "warning", suggestion });
    } else {
      passed.push(field);
    }
  };

  check("contentClarity", analysis.contentClarity, 0.5, "İçerik netliği düşük", "Daha kısa cümleler kullanın");
  check("entityCoverage", analysis.entityCoverage, 0.3, "Entity kapsamı yetersiz", "Daha fazla entity referansı ekleyin");
  check("authoritySignals", analysis.authoritySignals.total, 0.3, "Otorite sinyalleri zayıf", "Kaynak ve yazar bilgisi ekleyin");
  check("structure", analysis.structure, 0.5, "Yapısal skor düşük", "H2/H3 başlıkları ve listeler kullanın");
  check("readability", analysis.readability, 0.5, "Okunabilirlik düşük", "İçeriği kısaltın veya bölün");

  const score = [analysis.contentClarity, analysis.entityCoverage, analysis.authoritySignals.total, analysis.structure, analysis.readability].reduce((a, b) => a + b, 0) / 5;

  return {
    valid: issues.length === 0,
    score: Math.round(score * 100) / 100,
    issues,
    warnings,
    passed,
  };
}
