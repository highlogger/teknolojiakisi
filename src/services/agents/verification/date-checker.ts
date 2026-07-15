/**
 * Verification Agent — Date Checker
 *
 * Tarih doğrulaması yapar:
 * - Yayın tarihi doğru mu?
 * - Eski haber tekrar dolaşıma mı girmiş?
 * - Release tarihi doğru mu?
 * - Saat farkı problemi var mı?
 */

import type { DateCheckResult, ResearchInput } from "./types";
import { DATE_THRESHOLDS } from "./constants";

/**
 * Araştırma bulgularındaki tarihleri kontrol et
 */
export function checkDates(research: ResearchInput): DateCheckResult {
  const now = new Date();
  const warnings: string[] = [];
  let isRecent = true;
  let isStale = false;
  let isRehashed = false;
  let timezoneIssue = false;
  let publishedDate: string | null = null;
  let detectedDate: string | null = null;
  let hoursSincePublication: number | null = null;

  // Timeline'dan en eski ve en yeni tarihi bul
  if (research.timeline && research.timeline.length > 0) {
    const dates = research.timeline
      .map((t) => {
        try {
          return new Date(t.date);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Date[];

    if (dates.length > 0) {
      const newest = new Date(Math.max(...dates.map((d) => d.getTime())));
      const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));

      publishedDate = newest.toISOString();
      detectedDate = newest.toISOString();
      hoursSincePublication = Math.round(
        (now.getTime() - newest.getTime()) / (1000 * 60 * 60)
      );

      // Güncellik kontrolü
      if (hoursSincePublication > DATE_THRESHOLDS.maxHoursForRecent) {
        isRecent = false;
        warnings.push(
          `Haber ${hoursSincePublication} saat önce yayınlanmış — ${DATE_THRESHOLDS.maxHoursForRecent} saat eşiğini aşıyor.`
        );
      }

      // Eskilik kontrolü
      const daysSincePublication =
        hoursSincePublication / 24;
      if (daysSincePublication > DATE_THRESHOLDS.staleAfterDays) {
        isStale = true;
        warnings.push(
          `Haber ${Math.round(daysSincePublication)} gün önce yayınlanmış — ${DATE_THRESHOLDS.staleAfterDays} gün eşiğini aşıyor, eski haber.`
        );
      }

      // Eski haber tekrar kontrolü
      if (daysSincePublication > DATE_THRESHOLDS.rehashedWarningDays) {
        isRehashed = true;
        warnings.push(
          `Bu haber ${Math.round(daysSincePublication)} gün önceki bir olaya ait — eski haber tekrar dolaşıma girmiş olabilir.`
        );
      }

      // Saat farkı kontrolü (future date?)
      if (newest.getTime() > now.getTime() + 60 * 60 * 1000) {
        timezoneIssue = true;
        warnings.push(
          "Haber tarihi gelecekte — saat dilimi farkı veya yanlış tarih olabilir."
        );
      }
    }
  } else {
    warnings.push("Araştırmada zaman çizelgesi (timeline) bulunamadı.");
    isRecent = false;
  }

  // Skor hesapla
  let score = 100;
  if (!isRecent) score -= 30;
  if (isStale) score -= 40;
  if (isRehashed) score -= 25;
  if (timezoneIssue) score -= 15;
  if (!research.timeline || research.timeline.length === 0) score = 0;

  const passed = score >= 70 && isRecent && !isRehashed;

  return {
    isRecent,
    isStale,
    isRehashed,
    publishedDate,
    detectedDate,
    hoursSincePublication,
    timezoneIssue,
    details: passed
      ? `Tarih kontrolü geçti.${hoursSincePublication !== null ? ` ${hoursSincePublication} saat önce yayınlanmış.` : ""}`
      : `Tarih kontrolü başarısız. ${warnings.join(" ")}`,
  };
}
