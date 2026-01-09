import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export async function analyzeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(`${API_BASE}/api/analyze/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
}
