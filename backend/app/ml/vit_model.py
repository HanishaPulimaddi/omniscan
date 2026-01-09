from transformers import ViTModel, ViTImageProcessor
import torch

# Load Vision Transformer (CPU-friendly)
processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTModel.from_pretrained("google/vit-base-patch16-224")

model.eval()  # inference mode

def get_vit_components():
    return processor, model
