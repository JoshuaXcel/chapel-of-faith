from fastapi import Depends, FastAPI 
from sqlalchemy import text 
from sqlalchemy.orm import Session
from pathlib import Path
from fastapi.staticfiles import StaticFiles

from app.database import get_db
from app.routers import auth, sermons, devotions, events, leadership, gallery, images

app = FastAPI(title="Chapel of Faith API")
Path("media").mkdir(exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

app.include_router(auth.router)
app.include_router(sermons.router)
app.include_router(devotions.router)
app.include_router(events.router)
app.include_router(leadership.router)
app.include_router(gallery.router)
app.include_router(images.router)


@app.get("/health")
def health_check(db: Session = Depends(get_db)):

    db.execute(text("SELECT 1"))
    
    return {"status": "ok", "database": "connected"}