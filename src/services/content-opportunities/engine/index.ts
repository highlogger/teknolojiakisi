/** Content Opportunity Engine */
import type { ContentOpportunity, GapAnalysis, OpportunityScore } from "../types";

export function analyzeContentGaps(existingTopics: string[], categoryArticleCounts: Record<string, number>): GapAnalysis[] {
  return existingTopics.map((topic) => ({
    topic, hasContent: true,
    contentAge: null, needsUpdate: false,
    categoryWeak: (categoryArticleCounts[topic] || 0) < 5,
    topicHubMissing: false, entityPageMissing: false,
    score: Math.min(100, (categoryArticleCounts[topic] || 0) * 10),
  }));
}

export function generateOpportunities(gaps: GapAnalysis[]): ContentOpportunity[] {
  return gaps.filter((g) => g.score < 50).map((g) => ({
    id: `opp_${Date.now().toString(36)}_${g.topic}`,
    type: g.needsUpdate ? "update_existing" : "missing_guide",
    title: `${g.topic} — Kapsamlı Rehber`, description: `${g.topic} için içerik eksik.`,
    topicSlug: g.topic, categorySlug: undefined,
    score: calcScore(g), generatedAt: new Date().toISOString(),
  }));
}

function calcScore(g: GapAnalysis): OpportunityScore {
  const overall = Math.round(100 - g.score);
  return { trend: 50, searchPotential: 60, competition: 40, freshness: 70, authority: 50, contentGap: overall, priority: overall > 70 ? 9 : 5, overall };
}

export { OPPORTUNITY_TYPE } from "../types";
