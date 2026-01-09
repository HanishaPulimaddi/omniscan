#!/bin/bash

echo "Starting OmniScan FastAPI application..."

gunicorn app.main:app \
  --workers 1 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 600 \
  --log-level info
