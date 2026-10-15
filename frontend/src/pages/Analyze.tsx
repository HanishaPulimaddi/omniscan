import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, ImageUp, Printer, RotateCcw, Sparkles } from "lucide-react";
import type { AxiosError } from "axios";
import apiClient from "../services/apiClient";
import ScoreBars from "../components/ScoreBars";
import ReportText from "../components/ReportText";
import { type Scores, parseScores, pct, prettyLabel, riskOf, topFindings } from "../lib/scores";

const MAX_BYTES = 10 * 1024 * 1024; // mirrors the backend's 10MB limit

const Analyze: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scores, setScores] = useState<Scores | null>(null);
  const [report, setReport] = useState<string>("");
  const [scanId, setScanId] = useState<number | null>(null);
  const [duplicate, setDuplicate] = useState(false);

  const resetResults = () => {
    setScores(null);
    setReport("");
    setScanId(null);
    setDuplicate(false);
    setError("");
  };

  const pickFile = (file: File | null) => {
    resetResults();
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG or JPG).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is larger than 10 MB.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    pickFile(event.target.files?.[0] || null);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0] || null);
  };

  const clearFile = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedFile(null);
    setImagePreview(null);
    resetResults();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    setLoading(true);
    resetResults();

    try {
      const response = await apiClient.post("/analyze/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setScores(parseScores(response.data.scores));
      setReport(response.data.report);
      setScanId(response.data.scan_id ?? null);
      setDuplicate(Boolean(response.data.duplicate));
    } catch (err) {
      const error = err as AxiosError<{ detail?: unknown }>;
      if (error.response?.status === 401) return; // apiClient already redirects to /login

      console.error("Error analyzing image:", error);

      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (error.response) {
        setError(`Server error (${error.response.status}). Check the backend logs.`);
      } else {
        setError("Can't reach the server. Make sure the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const findings = scores ? topFindings(scores, 3) : [];

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">Analyze</p>
          <h1>Read a chest X‑ray</h1>
          <p className="lead">
            Upload a frontal chest radiograph. OmniScan scores it for 18 pathologies and drafts a structured
            report.
          </p>
        </div>
      </div>

      <div className="analyze-grid">
        {/* ================= LEFT: UPLOAD ================= */}
        <div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

          {!imagePreview ? (
            <div
              className={`dropzone${dragging ? " dragging" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="dropzone-icon">
                <ImageUp size={26} />
              </span>
              <h3>Drop an X-ray here</h3>
              <p className="muted">or click to browse · PNG or JPG, up to 10 MB</p>
            </div>
          ) : (
            <>
              <div className="preview">
                <img src={imagePreview} alt="Selected X-ray" />
                {loading && <div className="scanning" />}
              </div>
              <div className="preview-bar">
                <div className="file-meta">
                  <strong>{selectedFile?.name}</strong>
                  <span className="muted">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={clearFile} disabled={loading}>
                  <RotateCcw size={15} /> Replace
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}>
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg btn-block"
            style={{ marginTop: 16 }}
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Analyzing scan…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze image
              </>
            )}
          </button>
        </div>

        {/* ================= RIGHT: SCORES ================= */}
        <div className="card">
          {scores ? (
            <>
              <div className="card-label">Pathology likelihood</div>
              <h3 style={{ marginBottom: 6 }}>
                {findings.length > 0 ? `${findings.length} finding${findings.length > 1 ? "s" : ""} to review` : "No elevated findings"}
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 24px" }}>
                {findings.map(([label, v]) => (
                  <span key={label} className={`tag tag-${riskOf(v)}`}>
                    {prettyLabel(label)} {pct(v)}
                  </span>
                ))}
                {duplicate && <span className="tag tag-neutral">Previously analyzed</span>}
              </div>
              <ScoreBars scores={scores} />
            </>
          ) : (
            <div className="empty-results">
              <div className="card-label">Results</div>
              <h3>{loading ? "Reading the scan…" : "Results will appear here"}</h3>
              <p className="muted">
                {loading
                  ? "Running the classifier and drafting the report. This can take up to a minute."
                  : "You'll see a likelihood score for each pathology, sorted from highest to lowest, followed by the full report."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                {[78, 64, 52, 40].map((w) => (
                  <div key={w} className="skeleton" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= REPORT ================= */}
      {report && (
        <div className="card report-card">
          <div className="report-head">
            <div>
              <div className="card-label">AI-drafted report</div>
              <h2>Diagnostic imaging report</h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
                <Printer size={15} /> Print
              </button>
              {scanId && (
                <Link to={`/report/${scanId}`} className="btn btn-dark btn-sm">
                  Open report <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
          <ReportText text={report} />
        </div>
      )}
    </>
  );
};

export default Analyze;
