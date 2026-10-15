import numpy as np
import torch
import torchvision
import torchxrayvision as xrv

# Torch otherwise reads the host's full CPU count rather than the container's
# CPU quota, oversubscribing threads on a fractional-vCPU Fargate task.
torch.set_num_threads(1)

# Pretrained DenseNet121, trained on NIH/CheXpert/MIMIC-CXR/PadChest/Kaggle
# chest X-ray datasets. Outputs real, calibrated pathology probabilities
# instead of comparing against random vectors.
_model = xrv.models.DenseNet(weights="densenet121-res224-all")
_model.eval()

_transform = torchvision.transforms.Compose([
    xrv.datasets.XRayCenterCrop(),
    xrv.datasets.XRayResizer(224),
])


def classify_image(image):
    gray = np.array(image.convert("L")).astype(np.float32)
    gray = xrv.datasets.normalize(gray, 255)
    gray = gray[None, ...]
    gray = _transform(gray)

    tensor = torch.from_numpy(gray)[None, ...]

    with torch.no_grad():
        outputs = _model(tensor)

    scores = {}
    for label, value in zip(_model.pathologies, outputs[0].numpy().tolist()):
        if label and not np.isnan(value):
            scores[label] = float(value)

    return scores
