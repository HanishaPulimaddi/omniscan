import numpy as np
import torch
from app.ml.vit_model import get_vit_components

processor, model = get_vit_components()

def generate_embedding(image):
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    # CLS token embedding → 768 dimension vector
    embedding = outputs.last_hidden_state[:, 0, :].numpy().flatten()
    return embedding
