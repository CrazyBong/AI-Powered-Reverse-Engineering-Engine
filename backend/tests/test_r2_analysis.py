"""
Unit tests for r2_analysis module.
These tests mock r2pipe to avoid requiring radare2 installation.
"""

import pytest
import json
from unittest.mock import patch, MagicMock

# Test for when r2pipe is available
@patch('app.workers.r2_analysis.r2pipe')
def test_analyze_binary_success(mock_r2pipe):
    """Test successful binary analysis with mocked r2pipe"""
    # Setup mock r2pipe
    mock_r2 = MagicMock()
    mock_r2pipe.open.return_value = mock_r2
    
    # Mock the r2 commands
    mock_r2.cmdj.side_effect = [
        [  # aflj result - function list
            {
                "offset": 0x1000,
                "name": "main",
                "size": 50
            },
            {
                "offset": 0x1040,
                "name": "func1",
                "size": 30
            }
        ],
        {  # pdfj result - disassembly for main
            "addr": 0x1000,
            "ops": [
                {"offset": 0x1000, "type": "push", "opcode": "push rbp"},
                {"offset": 0x1001, "type": "mov", "opcode": "mov rbp, rsp"}
            ]
        },
        {  # agfj result - CFG for main
            "addr": 0x1000,
            "nodes": [
                {"offset": 0x1000, "type": "entry"},
                {"offset": 0x1005, "type": "body"}
            ]
        },
        {  # pdfj result - disassembly for func1
            "addr": 0x1040,
            "ops": [
                {"offset": 0x1040, "type": "mov", "opcode": "mov eax, 0"}
            ]
        },
        {  # agfj result - CFG for func1
            "addr": 0x1040,
            "nodes": [
                {"offset": 0x1040, "type": "entry"}
            ]
        }
    ]
    
    # Import and call the function
    from app.workers.r2_analysis import analyze_binary
    result = analyze_binary("/fake/path/binary", "test_file_id")
    
    # Assertions
    assert "functions" in result
    assert len(result["functions"]) == 2
    assert result["functions"][0]["name"] == "main"
    assert result["functions"][1]["name"] == "func1"
    
    assert "disassembly" in result
    assert "4096" in result["disassembly"]  # 0x1000 in decimal
    assert "4160" in result["disassembly"]  # 0x1040 in decimal
    
    assert "cfg" in result
    assert "4096" in result["cfg"]
    assert "4160" in result["cfg"]
    
    # Verify r2pipe calls
    mock_r2pipe.open.assert_called_once_with("/fake/path/binary", flags=['-2'])
    mock_r2.cmd.assert_called_once_with('aa')
    assert mock_r2.cmdj.call_count == 5  # aflj + 2*pdfj + 2*agfj
    mock_r2.quit.assert_called_once()


@patch('app.workers.r2_analysis.r2pipe', None)
def test_analyze_binary_no_r2pipe():
    """Test analysis when r2pipe is not available"""
    from app.workers.r2_analysis import analyze_binary
    
    with pytest.raises(RuntimeError) as exc_info:
        analyze_binary("/fake/path/binary", "test_file_id")
    
    assert "r2pipe is not installed" in str(exc_info.value)


@patch('app.workers.r2_analysis.r2pipe')
def test_analyze_binary_r2_exception(mock_r2pipe):
    """Test analysis when r2pipe raises an exception"""
    # Setup mock to raise exception
    mock_r2pipe.open.side_effect = Exception("Radare2 error")
    
    from app.workers.r2_analysis import analyze_binary
    
    with pytest.raises(RuntimeError) as exc_info:
        analyze_binary("/fake/path/binary", "test_file_id")
    
    assert "radare2 analysis failed" in str(exc_info.value)