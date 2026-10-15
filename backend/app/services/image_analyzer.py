import io
from PIL import Image
from app.ml.classifier import classify_image
from app.ml.llm_report import generate_medical_report


async def analyze_image(file_bytes: bytes):
    # Load image
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    except Exception:
        return {"scores": {}, "report": "Unable to read image."}

    # Classify
    try:
        scores = classify_image(image)
        if not scores:
            return {"scores": {}, "report": "Failed to classify image."}
    except Exception:
        return {"scores": {}, "report": "Classifier error."}

    # Generate report
    try:
        report_text = generate_medical_report(scores)
        if not report_text:
            report_text = "No meaningful findings detected."
    except Exception:
        # None (not a placeholder string) so the caller doesn't persist this
        # as if it were a real report — a retry on the same image should
        # actually retry generation, not replay a cached failure forever.
        report_text = None

    return {
        "scores": scores,
        "report": report_text
    }
