import os
import json

BASE_UPLOAD_PATH = os.path.join("storage", "uploaded_files")
BASE_ARTIFACT_PATH = os.path.join("storage", "artifacts")


def save_uploaded_file(file_bytes, file_id):
    os.makedirs(BASE_UPLOAD_PATH, exist_ok=True)
    path = os.path.join(BASE_UPLOAD_PATH, file_id)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path


def load_uploaded_file(file_id):
    return os.path.join(BASE_UPLOAD_PATH, file_id)


def save_artifacts(file_id, data):
    os.makedirs(BASE_ARTIFACT_PATH, exist_ok=True)
    path = os.path.join(BASE_ARTIFACT_PATH, f"{file_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        f.write(json.dumps(data))
    return path


def load_artifacts(file_id):
    # top-level artifact folder for this file
    path = os.path.join(BASE_ARTIFACT_PATH, file_id)
    return path