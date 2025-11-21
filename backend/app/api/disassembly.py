"""
backend/app/api/disassembly.py

Return disassembly JSON for a given file_id and function address.
Endpoint: GET /disassembly/{file_id}/{addr}
"""

from fastapi import APIRouter, HTTPException
import os, json
from app.core.storage import load_artifacts

router = APIRouter(prefix="/disassembly", tags=["disassembly"])


@router.get("/{file_id}/{addr}")
def get_disassembly(file_id: str, addr: str):
    disasm_path = os.path.join("storage", "artifacts", file_id, "disassembly", f"{addr}.json")
    if not os.path.exists(disasm_path):
        raise HTTPException(status_code=404, detail="Disassembly not found")
    with open(disasm_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return {"file_id": file_id, "addr": addr, "disassembly": data}

# Add a second router in this file for CFG without creating new files
cfg_router = APIRouter(prefix="/cfg", tags=["cfg"])

@cfg_router.get("/{file_id}/{address}")
def get_cfg(file_id: str, address: str):
    base_dir = load_artifacts(file_id)  # artifacts/<file_id>
    cfg_dir = os.path.join(base_dir, "cfg")
    try:
        addr_int = int(address, 16) if address.lower().startswith("0x") else int(address)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid address")

    cfg_path = os.path.join(cfg_dir, f"{addr_int}.json")
    if not os.path.exists(cfg_path):
        raise HTTPException(status_code=404, detail="CFG not found")

    with open(cfg_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Accept both { "blocks": [...] } and [ ... ] file shapes
    if isinstance(data, list):
        raw_blocks = data
    elif isinstance(data, dict):
        raw_blocks = data.get("blocks") or data.get("nodes") or data.get("basic_blocks") or []
    else:
        raw_blocks = []

    # Normalize to always expose "instructions" (fallback to "ops")
    blocks = []
    for b in raw_blocks or []:
        if not isinstance(b, dict):
            continue
        instr = b.get("instructions")
        if instr is None:
            instr = b.get("ops") or []
        blocks.append({**b, "instructions": instr})

    return {"file_id": file_id, "address": address, "blocks": blocks}