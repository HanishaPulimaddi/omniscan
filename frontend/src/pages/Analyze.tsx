import React, { useState } from "react";
import apiClient from "../services/apiClient";

const Analyze: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [scores, setScores] = useState<any>(null);
  const [report, setReport] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return alert("Please upload an image.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await apiClient.post("/analyze/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setScores(response.data.scores);
      setReport(response.data.report);

    } catch (error: any) {
      if (error.response?.status === 401) return; // apiClient already redirects to /login

      console.error("Error analyzing image:", error);

      if (error.response?.data) {
        alert("Server error: " + JSON.stringify(error.response.data));
      } else {
        alert("Connection error: Check backend logs.");
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>OmniScan – AI Medical Image Analysis</h1>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {imagePreview && (
        <div style={{ marginTop: 20 }}>
          <h3>Uploaded Image:</h3>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: 300, borderRadius: 10 }}
          />
        </div>
      )}

      <button
        onClick={handleAnalyze}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Analyze Image
      </button>

      {scores && (
        <div style={{ marginTop: 30 }}>
          <h2>Abnormality Scores</h2>
          <pre>{JSON.stringify(scores, null, 2)}</pre>
        </div>
      )}

      {report && (
        <div
          style={{
            marginTop: 30,
            padding: 20,
            background: "#f9f9f9",
            borderRadius: 10,
          }}
        >
          <h2>AI Medical Report</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 16 }}>
            {report}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Analyze;
