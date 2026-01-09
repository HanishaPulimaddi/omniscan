from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Routers
from app.routers.auth_router import router as auth_router
from app.routers.analysis_router import router as analysis_router
from app.routers.upload_router import router as upload_router
from app.routers.history_router import router as history_router   # ✅ NEW




app = FastAPI()

# ---------------------------
# CORS
# ---------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Static file serving
# ---------------------------
# Serve uploaded scan images and reports via HTTP
# Files are stored in app/uploads/scans/ and accessed via /uploads/scans/<filename>
# This mount maps /uploads/* requests to the app/uploads/ directory
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

# ---------------------------
# Include routers
# ---------------------------
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(upload_router)
app.include_router(history_router)   # ✅ History API enabled

# ---------------------------
# Health check
# ---------------------------
@app.get("/")
def health():
    return {"status": "OmniScan backend running"}
