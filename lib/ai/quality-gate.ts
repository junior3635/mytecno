export interface QualityCheck {
  name: string;
  threshold: number;
  weight: number;
  evaluate: (article: ParsedArticle) => { score: number; passed: boolean; note?: string };
}

export interface ParsedArticle {
  title: string;
  content: string;
  category: string;
  wordCount: number;
  headingCount: number;
}

export interface QualityResult {
  overallScore: number;
  passed: boolean;
  checks: { name: string; score: number; passed: boolean; note?: string }[];
  flags: string[];
}

export const QUALITY_CHECKS: QualityCheck[] = [
  {
    name: 'min_words',
    threshold: 800,
    weight: 1,
    evaluate: (a) => {
      const score = Math.min(a.wordCount / a.threshold, 1);
      return { score, passed: a.wordCount >= a.threshold, note: `${a.wordCount} words` };
    },
  },
  {
    name: 'heading_structure',
    threshold: 3,
    weight: 1,
    evaluate: (a) => ({
      score: Math.min(a.headingCount / a.threshold, 1),
      passed: a.headingCount >= a.threshold,
      note: `${a.headingCount} headings`,
    }),
  },
  {
    name: 'title_length',
    threshold: 60,
    weight: 2,
    evaluate: (a) => {
      const t = a.title.length;
      const score = t > 0 && t <= a.threshold ? 1 : 0.4;
      return { score, passed: t > 0 && t <= a.threshold, note: `${t} chars` };
    },
  },
  {
    name: 'category_voice',
    threshold: 1,
    weight: 2,
    evaluate: (a) => ({ score: 1, passed: a.category.length > 0 }),
  },
];

export function runQualityGate(article: ParsedArticle): QualityResult {
  const results = QUALITY_CHECKS.map((check) => {
    const { score, passed, note } = check.evaluate(article);
    return { name: check.name, score, passed, note };
  });

  const maxWeight = QUALITY_CHECKS.reduce((sum, c) => sum + c.weight, 0);
  const weighted = results.reduce((sum, r, i) => sum + r.score * QUALITY_CHECKS[i].weight, 0);
  const overallScore = Math.round((weighted / maxWeight) * 100的全部;

  return {
    overallScore,
    passed: overallScore >= 70,
    checks: results,
    flags: results.filter((r) => !r.passed).map((r) => r.name),
  };
}
