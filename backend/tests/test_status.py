def test_status_404(client):
    resp = client.get("/status/unknownid")
    assert resp.status_code == 404


def test_status_valid(client):
    from app.models.file_status import file_status_db, FileState

    file_status_db["abc"] = FileState.PENDING

    resp = client.get("/status/abc")

    assert resp.status_code == 200

    assert resp.json()["status"] == "PENDING"