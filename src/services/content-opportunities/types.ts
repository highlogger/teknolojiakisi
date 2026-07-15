/** Content Opportunity Engine — Types */

export const OPPORTUNITY_TYPE = {
  TRENDING_TOPIC: "trending_topic", BREAKING_NEWS: "breaking_news",
  MISSING_GUIDE: "missing_guide", MISSING_REVIEW: "missing_review",
  MISSING_COMPARISON: "missing_comparison", MISSING_FAQ: "missing_faq",
  EVERGREEN: "evergreen", UPDATE_EXISTING: "update_existing",
  SEASONAL: "seasonal", EVENT: "event",
} as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPE)[keyof typeof OPPORTUNITY_TYPE];

export interface ContentOpportunity {
  id: string; type: OpportunityType; title: string;
  description: string; topicSlug?: string; categorySlug?: string;
  score: OpportunityScore; generatedAt: string;
}
export interface OpportunityScore {
  trend: number; searchPotential: number; competition: number;
  freshness: number; authority: number; contentGap: number;
  priority: number; overall: number;
}
export interface GapAnalysis {
  topic: string; hasContent: boolean; contentAge: number | null;
  needsUpdate: boolean; categoryWeak: boolean; topicHubMissing: boolean;
  entityPageMissing: boolean; score: number;
}
