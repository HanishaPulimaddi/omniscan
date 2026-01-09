from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_medical_report(scores):
    abnormalities = "\n".join([
        f"{k}: {v:.4f}" for k, v in scores.items()
    ])

    prompt = f"""
You are an expert board-certified radiologist.
Generate a formal diagnostic imaging report in strict radiology format.

Use the following abnormality likelihood scores:

{abnormalities}

Create the report with these sections:

1. Clinical Indication
2. Technique
3. Findings 
   - Lungs & Pleura
   - Mediastinum & Cardiac Silhouette
   - Bones & Soft Tissue
4. AI Abnormality Scores (formatted clearly)
5. Impression (1–2 lines, radiologist style)
6. Recommendations

Style:
- Professional
- Clear
- No unnecessary wording
- Written like reports in Apollo, Fortis, NHS, Mayo Clinic

Do NOT mention AI limitations. Produce a clean, final radiology report.
"""


    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content
