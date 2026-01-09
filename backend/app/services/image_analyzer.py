import io
from PIL import Image
import numpy as np
from app.ml.embedding_engine import generate_embedding
from app.ml.classifier import classify_embedding
from app.ml.llm_report import generate_medical_report


async def analyze_image(file_bytes: bytes):
    # Load image
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return {"scores": {}, "report": "Unable to read image."}

    # Generate embedding
    try:
        embedding = generate_embedding(image)
        if embedding is None:
            return {"scores": {}, "report": "Failed to generate embedding."}

        if isinstance(embedding, np.ndarray):
            embedding = embedding.tolist()

    except Exception:
        return {"scores": {}, "report": "Embedding engine error."}

    # Classify
    try:
        scores = classify_embedding(embedding)
        safe_scores = {str(k): float(v) for k, v in scores.items()}
    except Exception:
        return {"scores": {}, "report": "Classifier error."}

    # Generate report
    try:
        report_text = generate_medical_report(safe_scores)
        if not report_text:
            report_text = "No meaningful findings detected."
    except Exception:
        report_text = "Report generation failed."

    return {
        "scores": safe_scores,
        "report": report_text
    }
