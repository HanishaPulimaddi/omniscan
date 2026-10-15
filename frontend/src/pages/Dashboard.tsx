import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileClock, FileText, ScanSearch, Sparkles, Stethoscope, Wind } from "lucide-react";
import apiClient from "../services/apiClient";
import { getUsername } from "../lib/auth";
import { parseScores, pct, prettyLabel, riskOf, topFindings } from "../lib/scores";

type HistoryItem = {
  scan_id: number;
  file_name?: string;
  uploaded_at: string | null;
  report: string;
  scores: unknown;
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const username = getUsername();
  const [recent, setRecent] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/history/", { params: { page: 1, page_size: 4 } })
      .then((res) => {
        setRecent(res.data.items ?? []);
        setTotal(res.data.total_items ?? 0);
      })
      .catch(() => setTotal(null))
      .finally(() => setLoading(false));
  }, []);

  const latest = recent[0];
  const latestScores = latest ? parseScores(latest.scores) : {};
  const latestFindings = topFindings(latestScores, 3);

  return (
    <>
      {/* ================= HERO ================= */}
      <section className="hero">
        <div>
          <p className="eyebrow">
            {greeting()}
            {username ? `, ${username}` : ""}
          </p>
          <h1>Every chest X‑ray, read with a second look</h1>
          <p className="lead">
            Upload a radiograph and OmniScan screens it for 18 thoracic pathologies, then drafts a structured
            report you can review, refine and keep on file.
          </p>
          <div className="hero-actions">
            <Link to="/analyze" className="btn btn-dark btn-lg">
              Analyze a scan <ArrowRight size={17} />
            </Link>
            <Link to="/history" className="btn btn-ghost btn-lg">
              <FileClock size={18} /> View history
            </Link>
          </div>
        </div>

        <div className="gradient-panel">
          <div className="pill-row">
            <span className="pill"><Wind size={16} /> Lungs & pleura</span>
            <span className="pill"><Stethoscope size={16} /> Cardiac silhouette</span>
            <span className="pill"><Sparkles size={16} /> AI impression</span>
          </div>

          <div className="float-card">
            <div className="card-label">{latest ? "Latest analysis" : "Report preview"}</div>
            {latest ? (
              <>
                <div className="template-title">
                  {latest.uploaded_at
                    ? new Date(latest.uploaded_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })
                    : `Scan #${latest.scan_id}`}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                  {latestFindings.length > 0 ? (
                    latestFindings.map(([label, v]) => (
                      <span key={label} className={`tag tag-${riskOf(v)}`}>
                        {prettyLabel(label)} {pct(v)}
                      </span>
                    ))
                  ) : (
                    <span className="tag tag-low">No elevated findings</span>
                  )}
                </div>
                <Link to={`/report/${latest.scan_id}`} className="btn btn-primary btn-sm">
                  Open report <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <div className="template-title">Chest X-ray, PA view</div>
                <div className="template-lines">
                  <div><b>Findings</b> [Lungs, mediastinum, bones]</div>
                  <div><b>AI scores</b> [Likelihood per pathology]</div>
                  <div><b>Impression</b> [One to two line summary]</div>
                  <div><b>Plan</b> [Recommended follow-up]</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="section stats">
        <div className="stat">
          <div className="card-label">Scans analyzed</div>
          <div className="stat-value">{loading ? "–" : total ?? "–"}</div>
          <div className="stat-note">Across your account</div>
        </div>
        <div className="stat">
          <div className="card-label">Pathologies screened</div>
          <div className="stat-value">18</div>
          <div className="stat-note">Per chest radiograph</div>
        </div>
        <div className="stat">
          <div className="card-label">Classifier</div>
          <div className="stat-value">DenseNet‑121</div>
          <div className="stat-note">Trained on NIH, CheXpert, MIMIC‑CXR, PadChest</div>
        </div>
      </section>

      {/* ================= RECENT ================= */}
      <section className="section">
        <div className="section-head">
          <h2>Recent analyses</h2>
          {recent.length > 0 && (
            <Link to="/history" className="btn btn-ghost btn-sm">
              See all <ArrowRight size={15} />
            </Link>
          )}
        </div>

        <div className="list">
          {loading ? (
            <div className="loading-block">
              <span className="spinner" /> Loading recent scans…
            </div>
          ) : recent.length === 0 ? (
            <div className="empty">
              <h3>No scans yet</h3>
              <p style={{ marginBottom: 20 }}>Your analyses will appear here once you upload your first X-ray.</p>
              <Link to="/analyze" className="btn btn-primary">
                <ScanSearch size={17} /> Analyze your first scan
              </Link>
            </div>
          ) : (
            recent.map((item) => {
              const findings = topFindings(parseScores(item.scores), 2);
              return (
                <div className="list-row" key={item.scan_id}>
                  <div className="row-icon">
                    <FileText size={22} />
                  </div>
                  <div className="row-main">
                    <div className="row-title">
                      {item.file_name || `Scan #${item.scan_id}`}
                      {findings.map(([label, v]) => (
                        <span key={label} className={`tag tag-${riskOf(v)}`}>
                          {prettyLabel(label)}
                        </span>
                      ))}
                    </div>
                    <div className="row-summary">
                      {item.uploaded_at ? new Date(item.uploaded_at).toLocaleString() : ""}
                    </div>
                  </div>
                  <div className="row-actions">
                    <Link to={`/report/${item.scan_id}`} className="btn btn-outline btn-sm">
                      Report
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="cta-band">
        <h2>Better reads start with a clearer first look.</h2>
        <Link to="/analyze" className="btn btn-dark btn-lg">
          Upload a chest X‑ray
        </Link>
      </section>
    </>
  );
}
