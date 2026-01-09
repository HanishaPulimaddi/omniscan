import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://127.0.0.1:8000/history/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        setError("Failed to load report");
        return;
      }

      const data = await res.json();
      setReport(data.report);
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
