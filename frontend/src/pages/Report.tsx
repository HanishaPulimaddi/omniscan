import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, ImageIcon, Printer } from "lucide-react";
import type { AxiosError } from "axios";
import apiClient, { API_BASE } from "../services/apiClient";
import ReportText from "../components/ReportText";
import ScoreBars from "../components/ScoreBars";
import { type Scores, parseScores, pct, prettyLabel, riskOf, topFindings } from "../lib/scores";

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState("");
  const [scores, setScores] = useState<Scores>({});
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiClient.get(`/history/${id}`);
        setReport(res.data.report);
        setScores(parseScores(res.data.scores));
        setUploadedAt(res.data.uploaded_at ?? null);
        setFileName(res.data.file_name ?? null);
      } catch (e) {
        const err = e as AxiosError;
        if (err.response?.status === 401) return; // apiClient already redirects to /login
        setError(err.response?.status === 404 ? "This report doesn't exist or isn't yours." : "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  // Same flow as History: resolve the (possibly presigned) URL, then open it.
  const handleViewScan = async () => {
    try {
      const res = await apiClient.get(`/history/${id}/image-url`);
      const url = res.data.url as string;
      window.open(url.startsWith("http") ? url : `${API_BASE}${url}`, "_blank", "noreferrer");
    } catch (e) {
      if ((e as AxiosError).response?.status === 401) return;
      setError("Failed to load scan image.");
    }
  };

  if (loading) {
    return (
      <div className="loading-block">
        <span className="spinner" /> Loading report…
      </div>
    );
  }

  const findings = topFindings(scores, 3);

  return (
    <>
      <div className="no-print" style={{ marginBottom: 20 }}>
        <Link to="/history" className="btn btn-ghost btn-sm">
          <ArrowLeft size={15} /> Back to history
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {report && (
        <div className="report-grid">
          <article className="card">
            <div className="report-head">
              <div>
                <div className="card-label">
                  {fileName || `Scan #${id}`}
                  {uploadedAt && ` · ${new Date(uploadedAt).toLocaleString()}`}
                </div>
                <h2>Diagnostic imaging report</h2>
              </div>
              <div className="no-print" style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-outline btn-sm" onClick={handleViewScan}>
                  <ImageIcon size={15} /> View scan
                </button>
                <button className="btn btn-dark btn-sm" onClick={() => window.print()}>
                  <Printer size={15} /> Print
                </button>
              </div>
            </div>
            <ReportText text={report} />
          </article>

          <aside className="card">
            <div className="card-label">Pathology likelihood</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "4px 0 22px" }}>
              {findings.length > 0 ? (
                findings.map(([label, v]) => (
                  <span key={label} className={`tag tag-${riskOf(v)}`}>
                    {prettyLabel(label)} {pct(v)}
                  </span>
                ))
              ) : (
                <span className="tag tag-low">No elevated findings</span>
              )}
            </div>
            <ScoreBars scores={scores} initial={10} />
          </aside>
        </div>
      )}

      <p className="footer-note">
        AI-generated draft. Findings must be confirmed by a qualified radiologist before clinical use.
      </p>
    </>
  );
}
