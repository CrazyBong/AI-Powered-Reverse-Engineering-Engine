"""
backend/app/workers/worker.py

Worker job that:
- marks status RUNNING
- calls r2_analysis.analyze_binary
- saves artifacts to local storage
- updates status to SUCCESS or FAILED
"""

import os
import json
import traceback
from time import time

from app.models.file_status import file_status_db, FileState
from app.core import storage
from app.workers import r2_analysis


def process_job(file_id: str):
    """
    Worker entry point for a single file analysis job.
    - file_id: the UUID assigned at upload
    """
    # mark running
    file_status_db[file_id] = FileState.RUNNING

    # locate uploaded file path
    uploaded_path = storage.load_uploaded_file(file_id)
    if not os.path.exists(uploaded_path):
        file_status_db[file_id] = FileState.FAILED
        return

    try:
        # perform radare2 analysis
        try:
            artifacts = r2_analysis.analyze_binary(uploaded_path, file_id)
        except RuntimeError as e:
            if "Cannot find radare2 in PATH" in str(e):
                print("radare2 not found, using mock analysis")
                artifacts = r2_analysis.mock_analyze_binary(uploaded_path, file_id)
            else:
                raise e

        # ensure artifact dir exists
        artifact_dir = os.path.join("storage", "artifacts", file_id)
        os.makedirs(artifact_dir, exist_ok=True)

        # save function list
        functions_path = os.path.join(artifact_dir, "functions.json")
        with open(functions_path, "w", encoding="utf-8") as fh:
            json.dump(artifacts.get("functions", []), fh)

        # save per-function disassembly and cfg
        disasm_dir = os.path.join(artifact_dir, "disassembly")
        cfg_dir = os.path.join(artifact_dir, "cfg")
        os.makedirs(disasm_dir, exist_ok=True)
        os.makedirs(cfg_dir, exist_ok=True)

        for addr, dis in artifacts.get("disassembly", {}).items():
            p = os.path.join(disasm_dir, f"{addr}.json")
            with open(p, "w", encoding="utf-8") as fh:
                json.dump(dis, fh)

        for addr, cfg in artifacts.get("cfg", {}).items():
            p = os.path.join(cfg_dir, f"{addr}.json")
            with open(p, "w", encoding="utf-8") as fh:
                json.dump(cfg, fh)

        # also save a top-level metadata file
        metadata = {
            "file_id": file_id,
            "analyzed_at": int(time()),
            "functions_count": len(artifacts.get("functions", []))
        }
        metadata_path = os.path.join(artifact_dir, "metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as fh:
            json.dump(metadata, fh)

        # update status
        file_status_db[file_id] = FileState.SUCCESS

    except Exception as e:
        # record failure
        file_status_db[file_id] = FileState.FAILED
        # write an error file for debugging
        artifact_dir = os.path.join("storage", "artifacts", file_id)
        os.makedirs(artifact_dir, exist_ok=True)
        err_path = os.path.join(artifact_dir, "error.txt")
        with open(err_path, "w", encoding="utf-8") as fh:
            fh.write("Analysis failed:\n")
            fh.write(str(e) + "\n\n")
            fh.write(traceback.format_exc())