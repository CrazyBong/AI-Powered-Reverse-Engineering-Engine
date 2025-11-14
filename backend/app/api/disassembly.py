"""
backend/app/api/disassembly.py

Return disassembly JSON for a given file_id and function address.
Endpoint: GET /disassembly/{file_id}/{addr}
"""

import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/disassembly", tags=["disassembly"])


@router.get("/{file_id}/{addr}")
def get_disassembly(file_id: str, addr: str):
    disasm_path = os.path.join("storage", "artifacts", file_id, "disassembly", f"{addr}.json")
    if not os.path.exists(disasm_path):
        raise HTTPException(status_code=404, detail="Disassembly not found")
    with open(disasm_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return {"file_id": file_id, "addr": addr, "disassembly": data}