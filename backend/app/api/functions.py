"""
backend/app/api/functions.py

Return function list for a file_id. Reads from storage/artifacts/<file_id>/functions.json
"""

import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/functions", tags=["functions"])


@router.get("/{file_id}")
def get_functions(file_id: str):
    artifact_dir = os.path.join("storage", "artifacts", file_id)
    functions_path = os.path.join(artifact_dir, "functions.json")
    if not os.path.exists(functions_path):
        raise HTTPException(status_code=404, detail="Functions not found or analysis not completed")
    with open(functions_path, "r", encoding="utf-8") as fh:
        funcs = json.load(fh)
    return {"file_id": file_id, "functions": funcs}