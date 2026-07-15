/** Revenue Platform — Types */

export const AD_TYPE = { ADSENSE: "adsense", SPONSORED: "sponsored", AFFILIATE: "affiliate", BANNER: "banner", NATIVE: "native" } as const;
export type AdType = (typeof AD_TYPE)[keyof typeof AD_TYPE];

export const AD_POSITION = { TOP: "top", SIDEBAR: "sidebar", IN_CONTENT: "in_content", BOTTOM: "bottom", HERO: "hero" } as const;
export type AdPosition = (typeof AD_POSITION)[keyof typeof AD_POSITION];

export interface AdSlot {
  id: string; type: AdType; position: AdPosition; name: string;
  enabled: boolean; code?: string; size?: string;
  ctr: number; rpm: number; ecpm: number; impressions: number; clicks: number; revenue: number;
}

export interface Campaign {
  id: string; name: string; type: AdType; budget: number; spent: number;
  startDate: string; endDate: string; status: "active" | "paused" | "ended";
  targeting?: { categories?: string[]; keywords?: string[] };
}

export interface RevenueReport {
  generatedAt: string; totalRevenue: number; totalImpressions: number;
  totalClicks: number; avgCtr: number; avgRpm: number;
  byPosition: Record<string, { impressions: number; clicks: number; revenue: number }>;
  byType: Record<string, { impressions: number; clicks: number; revenue: number }>;
}
