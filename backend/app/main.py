import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.rate_limit import limiter

# Routers
from app.routers.auth_router import router as auth_router
from app.routers.analysis_router import router as analysis_router
from app.routers.history_router import router as history_router   # ✅ NEW

load_dotenv()

app = FastAPI()

# ---------------------------
# Rate limiting
# ---------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------
# CORS
# ---------------------------
# ALLOWED_ORIGINS is a comma-separated list, e.g. "https://omniscan.app,https://www.omniscan.app"
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in _allowed_origins.split(",")],
    allow_credentials=False,  # Bearer-token auth, not cookies — credentials mode isn't needed
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Static file serving
# ---------------------------
# Serve uploaded scan images and reports via HTTP
# Files are stored in app/uploads/scans/ and accessed via /uploads/scans/<filename>
# This mount maps /uploads/* requests to the app/uploads/ directory
#
# Only relevant for local-disk storage. On Fargate the container filesystem
# is ephemeral and per-task, so scans live in S3 instead (AWS_S3_BUCKET set)
# and this mount is skipped — StaticFiles would otherwise raise at import
# time since app/uploads won't exist in the image.
if not os.getenv("AWS_S3_BUCKET"):
    os.makedirs("app/uploads/scans", exist_ok=True)
    app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

# ---------------------------
# Include routers
# ---------------------------
# All under a single /api prefix (/api/auth, /api/analyze, /api/history) so
# CloudFront only needs one cache behaviour for the API instead of one per
# router. /health stays unprefixed below — the load balancer targets it
# directly.
app.include_router(auth_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(history_router, prefix="/api")   # ✅ History API enabled

# ---------------------------
# Health check
# ---------------------------
@app.get("/")
def health():
    return {"status": "OmniScan backend running"}


# Dedicated load-balancer health check — no DB, no model, no I/O, so it stays
# fast and cheap under a 30s ECS/ALB polling interval.
@app.get("/health")
def health_check():
    return {"status": "ok"}
