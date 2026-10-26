from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import get_db
from app.routers import auth, sermons, devotions, events, leadership, gallery, images, members

app = FastAPI(title="Chapel of Faith API")

# the whole upload arrives before our route code runs, so a very large request is
# refused here, by its size header, before the server spends time and disk on it.
# (5 MB for the image plus a little room for the form around it)
MAX_UPLOAD_REQUEST_BYTES = images.MAX_BYTES + 64 * 1024

@app.middleware("http")
async def limit_upload_size(request: Request, call_next):
    if request.method == "POST" and request.url.path == "/images":
        size = request.headers.get("content-length")
        if size and size.isdigit() and int(size) > MAX_UPLOAD_REQUEST_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Image must be 5 MB or smaller"})
    return await call_next(request)

# tells browsers to trust our Content-Type and never "guess" a file's type,
# so an uploaded file can't be treated as a web page or a script
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response

# added last so it wraps everything above: even a 413 from the size check gets the CORS
# headers, and the browser can show our message instead of a vague network error.
# Let the frontend (a different address, e.g. localhost:5173) call this API from the browser.
# Only the sites listed in CORS_ORIGINS are allowed (never "*", config.py checks that).
# allow_credentials stays off: the admin token is sent in the Authorization header, not in cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

settings.media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")

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