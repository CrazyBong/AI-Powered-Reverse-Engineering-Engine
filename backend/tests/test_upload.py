def test_upload_valid_file(client):
    file_content = b"dummy data"
    response = client.post(
        "/upload/",
        files={"file": ("test.exe", file_content, "application/octet-stream")}
    )
    assert response.status_code == 200
    assert "file_id" in response.json()
    assert response.json()["status"] == "PENDING"


def test_upload_invalid_extension(client):
    response = client.post(
        "/upload/",
        files={"file": ("test.pdf", b"dummy", "application/pdf")}
    )
    assert response.status_code == 400


def test_upload_large_file(client):
    big_data = b"x" * (51 * 1024 * 1024)
    response = client.post(
        "/upload/",
        files={"file": ("big.exe", big_data, "application/octet-stream")}
    )
    assert response.status_code == 400