import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type Scores, RISK_LABEL, pct, prettyLabel, riskOf, sortedScores } from "../lib/scores";

type ScoreBarsProps = {
  scores: Scores;
  initial?: number;
};

export default function ScoreBars({ scores, initial = 8 }: ScoreBarsProps) {
  const [expanded, setExpanded] = useState(false);
  const rows = sortedScores(scores);
  const visible = expanded ? rows : rows.slice(0, initial);

  if (rows.length === 0) {
    return <p className="muted">No pathology scores were returned for this scan.</p>;
  }

  return (
    <div>
      <div className="scores">
        {visible.map(([label, value]) => {
          const risk = riskOf(value);
          return (
            <div className="score-row" key={label} title={`${prettyLabel(label)}: ${RISK_LABEL[risk]}`}>
              <span className="score-name">{prettyLabel(label)}</span>
              <div className="score-track">
                <div className={`score-fill ${risk}`} style={{ width: pct(value) }} />
              </div>
              <span className="score-pct">{pct(value)}</span>
            </div>
          );
        })}
      </div>

      <div className="legend">
        <span className="tag tag-high">≥ 60% {RISK_LABEL.high}</span>
        <span className="tag tag-mid">45–59% {RISK_LABEL.mid}</span>
        <span className="tag tag-low">&lt; 45% {RISK_LABEL.low}</span>
        {rows.length > initial && (
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => setExpanded(!expanded)}>
            {expanded ? "Show fewer" : `Show all ${rows.length}`}
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
