from fastapi import APIRouter, UploadFile, HTTPException
import uuid
from app.core.storage import save_uploaded_file
from app.core.queue import enqueue_job
from app.models.file_status import file_status_db, FileState

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_EXT = {".exe", ".elf", ".so"}

@router.post("/")
async def upload_file(file: UploadFile):
    filename = file.filename
    ext = "." + filename.split(".")[-1]

    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="Invalid file type")

    data = await file.read()
    if len(data) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large")

    file_id = str(uuid.uuid4())
    save_uploaded_file(data, file_id)
    file_status_db[file_id] = FileState.PENDING

    enqueue_job(file_id)

    return {"file_id": file_id, "status": "PENDING"}