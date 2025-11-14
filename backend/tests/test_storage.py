def test_save_uploaded_file():
    from app.core.storage import save_uploaded_file

    path = save_uploaded_file(b"hello", "file123")

    assert path.endswith("file123")


def test_save_artifacts():
    from app.core.storage import save_artifacts

    path = save_artifacts("file123", '{"ok": true}')

    assert path.endswith("file123.json")