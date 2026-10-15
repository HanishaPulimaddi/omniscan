# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Builder — installs deps into an isolated venv and bakes in model weights
# ---------------------------------------------------------------------------
FROM python:3.11-slim AS builder

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /build

# CPU-only PyTorch wheels first, pinned to the exact versions requirements.txt
# also pins. The default PyPI wheels bundle ~2GB of CUDA that's dead weight
# on Fargate; installing the matching version here first means the later
# `pip install -r requirements.txt` sees them as already satisfied and skips
# pulling the CUDA build.
RUN pip install --no-cache-dir \
    torch==2.2.2 torchvision==0.17.2 \
    --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Bake the classifier's model weights into the image. Without this, every
# fresh Fargate task downloads them from an external host on first request.
ENV HOME=/opt/xrv
RUN mkdir -p /opt/xrv && \
    python -c "import torchxrayvision as xrv; xrv.models.DenseNet(weights='densenet121-res224-all')"


# ---------------------------------------------------------------------------
# Runtime — slim image, non-root user, no build toolchain
# ---------------------------------------------------------------------------
FROM python:3.11-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /opt/venv /opt/venv
COPY --from=builder /opt/xrv /opt/xrv

ENV PATH="/opt/venv/bin:$PATH" \
    HOME=/opt/xrv \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1

RUN useradd --uid 1000 --no-create-home --shell /usr/sbin/nologin appuser && \
    chown -R appuser:appuser /opt/xrv

WORKDIR /app
COPY --chown=appuser:appuser . .

USER appuser

EXPOSE 8000

# Exactly one worker: each worker loads its own copy of DenseNet121, and a
# second one will OOM a 2GB Fargate task. --timeout 120 (not gunicorn's 30s
# default) so a worker isn't killed mid model-load, which otherwise looks
# like a crash-restart loop.
CMD ["gunicorn", "app.main:app", \
     "--workers", "1", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "120", \
     "--graceful-timeout", "30", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
