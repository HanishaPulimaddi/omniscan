import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# List of medical concepts we want to score
MEDICAL_LABELS = [
    "normal",
    "opacity",
    "pneumonia",
    "tumor",
    "fracture",
    "inflammation",
    "pleural effusion",
    "hemorrhage",
    "lesion"
]

# Random vectors (placeholder) until we integrate real medical text embeddings
label_vectors = {
    label: np.random.rand(768)
    for label in MEDICAL_LABELS
}

def classify_embedding(embedding):
    scores = {}
    for label, vector in label_vectors.items():
        sim = cosine_similarity([embedding], [vector])[0][0]
        scores[label] = float(sim)
    return scores
