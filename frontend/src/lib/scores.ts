export type Scores = Record<string, number>;
export type Risk = "high" | "mid" | "low";

// Scores are stored as a JSON string in the reports table, but come back as a
// plain object straight from the classifier — accept either.
export function parseScores(raw: unknown): Scores {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return parseScores(JSON.parse(raw));
    } catch {
      return {};
    }
  }
  if (typeof raw === "object") {
    const out: Scores = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    }
    return out;
  }
  return {};
}

// torchxrayvision's DenseNet is calibrated so ~0.5 is the decision boundary.
export function riskOf(score: number): Risk {
  if (score >= 0.6) return "high";
  if (score >= 0.45) return "mid";
  return "low";
}

export const RISK_LABEL: Record<Risk, string> = {
  high: "Elevated",
  mid: "Borderline",
  low: "Low",
};

export function prettyLabel(label: string): string {
  return label.replace(/_/g, " ");
}

export function sortedScores(scores: Scores): [string, number][] {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

export function topFindings(scores: Scores, limit = 3): [string, number][] {
  return sortedScores(scores)
    .filter(([, v]) => riskOf(v) !== "low")
    .slice(0, limit);
}

export function pct(score: number): string {
  return `${Math.round(score * 100)}%`;
}
