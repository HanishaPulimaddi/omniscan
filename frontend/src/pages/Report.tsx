import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/apiClient";

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await apiClient.get(`/history/${id}`);
        setReport(res.data.report);
      } catch (err: any) {
        if (err.response?.status === 401) return; // apiClient already redirects to /login
        setError("Failed to load report");
      }
    };

    fetchReport();
  }, [id]);

  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "32px", maxWidth: "900px", margin: "auto" }}>
      <h2>Diagnostic Imaging Report</h2>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginTop: "16px",
        }}
      >
        {report}
      </pre>
    </div>
  );
}
