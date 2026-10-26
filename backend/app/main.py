from fastapi import Depends, FastAPI 
from sqlalchemy import text 
from sqlalchemy.orm import Session
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_db
from app.routers import auth, sermons, devotions, events, leadership, gallery, images, members

app = FastAPI(title="Chapel of Faith API")

# let the frontend (a different address, e.g. localhost:5173) call this API from the browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_methods=["*"],
    allow_headers=["*"],
)
Path("media").mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(auth.router)
app.include_router(sermons.router)
app.include_router(devotions.router)
app.include_router(events.router)
app.include_router(leadership.router)
app.include_router(gallery.router)
app.include_router(images.router)
app.include_router(members.router)


@app.get("/health")
def health_check(db: Session = Depends(get_db)):

    db.execute(text("SELECT 1"))
    
    return {"status": "ok", "database": "connected"}