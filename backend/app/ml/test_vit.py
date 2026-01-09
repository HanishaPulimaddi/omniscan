import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from PIL import Image
from app.ml.embedding_engine import generate_embedding

def test_vit():
    print("Loading sample image...")
    image = Image.new("RGB", (224, 224), color=(150, 150, 150))

    print("Generating embedding...")
    embedding = generate_embedding(image)

    print("Embedding shape:", embedding.shape)
    print("Embedding sample:", embedding[:10])

if __name__ == "__main__":
    test_vit()


