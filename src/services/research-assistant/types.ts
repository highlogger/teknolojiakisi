/** AI Research Assistant — Types */
export interface ResearchReport {
  topic: string; generatedAt: string;
  executiveSummary: string; timeline: TimelineEntry[];
  entities: { companies: string[]; people: string[]; products: string[]; technologies: string[] };
  officialSources: string[]; relatedArticles: string[];
  faqs: { question: string; answer: string }[];
  contentIdeas: string[]; risks: string[];
  factCheckNotes: string[];
}
export interface TimelineEntry { date: string; event: string; source?: string }
