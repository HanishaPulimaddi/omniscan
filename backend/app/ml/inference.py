import base64
import json
from openai import OpenAI

client = OpenAI()

def run_inference(image_bytes):
    """
    Sends image to OpenAI Vision and guarantees a strict JSON output.
    """

    # Convert image to base64
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # Call OpenAI Vision (correct 2025 chat format)
    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior radiologist. ALWAYS respond in pure JSON only. "
                    "Format MUST be exactly:\n\n"
                    "{\n"
                    "  \"scores\": {\n"
                    "    \"pneumonia\": <float>,\n"
                    "    \"opacity\": <float>,\n"
                    "    \"nodule\": <float>\n"
                    "  },\n"
                    "  \"report\": \"<professional detailed radiology report>\"\n"
                    "}\n\n"
                    "No additional text. No explanations. Only JSON."
                )
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyse this chest X-ray and provide probabilities + full radiology report."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}"
                        }
                    }
                ]
            }
        ],
        max_tokens=700
    )

    # Extract AI text
    raw_text = response.choices[0].message.content

    # Parse text into JSON
    try:
        parsed = json.loads(raw_text)
    except Exception:
        raise ValueError("OpenAI returned invalid JSON:\n" + raw_text)

    return parsed
