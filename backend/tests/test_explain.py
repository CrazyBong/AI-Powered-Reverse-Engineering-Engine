import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock
import os
import json
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

client = TestClient(app)


def test_explain_function():
    """Test the explain function endpoint with mock data."""
    # Create test data
    test_artifact_dir = os.path.join("backend", "storage", "artifacts", "testfile")
    disasm_dir = os.path.join(test_artifact_dir, "disassembly")
    os.makedirs(disasm_dir, exist_ok=True)
    
    # Create a minimal disassembly file
    disasm_data = {
        "ops": [
            {"offset": 4096, "disasm": "mov eax, ebx"},
            {"offset": 4098, "disasm": "add eax, 1"},
            {"offset": 4101, "disasm": "ret"}
        ]
    }
    
    with open(os.path.join(disasm_dir, "4096.json"), "w") as f:
        json.dump(disasm_data, f)
    
    # Mock the openai_client.call_openai function
    with patch("app.api.explain.call_openai", new=AsyncMock(return_value="mock explanation")):
        # Call the endpoint
        response = client.get("/explain/testfile/4096")
        
        # Assert HTTP 200
        assert response.status_code == 200
        
        # Assert the response contains the mock explanation
        json_response = response.json()
        assert json_response["explanation"] == "mock explanation"
        assert json_response["file_id"] == "testfile"
        assert json_response["addr"] == "4096"
    
    # Clean up test files
    import shutil
    if os.path.exists(test_artifact_dir):
        shutil.rmtree(test_artifact_dir)


def test_explain_function_not_found():
    """Test the explain function endpoint when disassembly is not found."""
    # Call the endpoint with non-existent file
    response = client.get("/explain/nonexistent/1234")
    
    # Assert HTTP 404
    assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__])