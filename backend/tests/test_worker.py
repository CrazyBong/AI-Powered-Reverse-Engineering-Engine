"""
Unit tests for worker module.
"""

import pytest
import os
import json
from unittest.mock import patch, MagicMock

def test_process_job_success(tmp_path):
    """Test successful job processing"""
    # Create a temporary file for testing
    test_file = tmp_path / "test_binary"
    test_file.write_bytes(b"fake binary content")
    
    # Mock the r2_analysis to return fake data
    fake_artifacts = {
        "functions": [
            {"offset": 0x1000, "name": "main", "size": 50},
            {"offset": 0x1040, "name": "func1", "size": 30}
        ],
        "disassembly": {
            "4096": {"addr": 0x1000, "ops": []},  # 0x1000 in decimal
            "4160": {"addr": 0x1040, "ops": []}   # 0x1040 in decimal
        },
        "cfg": {
            "4096": {"addr": 0x1000, "nodes": []},
            "4160": {"addr": 0x1040, "nodes": []}
        }
    }
    
    with patch('app.workers.worker.r2_analysis.analyze_binary', return_value=fake_artifacts), \
         patch('app.workers.worker.storage.load_uploaded_file', return_value=str(test_file)), \
         patch('app.workers.worker.file_status_db', {}) as mock_status_db, \
         patch('app.workers.worker.FileState') as mock_file_state:
        
        from app.workers.worker import process_job, FileState
        
        # Mock the FileState enum values
        mock_file_state.RUNNING = "RUNNING"
        mock_file_state.SUCCESS = "SUCCESS"
        mock_file_state.FAILED = "FAILED"
        
        # Call the function
        process_job("test_file_id")
        
        # Verify status updates
        assert mock_status_db["test_file_id"] == "SUCCESS"


def test_process_job_file_not_found():
    """Test job processing when file is not found"""
    with patch('app.workers.worker.storage.load_uploaded_file', return_value="/nonexistent/file"), \
         patch('app.workers.worker.file_status_db', {}) as mock_status_db, \
         patch('app.workers.worker.FileState') as mock_file_state:
        
        from app.workers.worker import process_job, FileState
        
        # Mock the FileState enum values
        mock_file_state.RUNNING = "RUNNING"
        mock_file_state.SUCCESS = "SUCCESS"
        mock_file_state.FAILED = "FAILED"
        
        # Call the function
        process_job("test_file_id")
        
        # Verify status is set to FAILED
        assert mock_status_db["test_file_id"] == "FAILED"


def test_process_job_analysis_failure(tmp_path):
    """Test job processing when analysis fails"""
    # Create a temporary file for testing
    test_file = tmp_path / "test_binary"
    test_file.write_bytes(b"fake binary content")
    
    with patch('app.workers.worker.r2_analysis.analyze_binary', side_effect=Exception("Analysis failed")), \
         patch('app.workers.worker.storage.load_uploaded_file', return_value=str(test_file)), \
         patch('app.workers.worker.file_status_db', {}) as mock_status_db, \
         patch('app.workers.worker.FileState') as mock_file_state:
        
        from app.workers.worker import process_job, FileState
        
        # Mock the FileState enum values
        mock_file_state.RUNNING = "RUNNING"
        mock_file_state.SUCCESS = "SUCCESS"
        mock_file_state.FAILED = "FAILED"
        
        # Call the function
        process_job("test_file_id")
        
        # Verify status is set to FAILED
        assert mock_status_db["test_file_id"] == "FAILED"