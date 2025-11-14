from fastapi import APIRouter, HTTPException
from app.models.file_status import file_status_db

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/{file_id}")
def get_status(file_id: str):
    if file_id not in file_status_db:
        raise HTTPException(status_code=404, detail="File not found")
    return {"file_id": file_id, "status": file_status_db[file_id]}