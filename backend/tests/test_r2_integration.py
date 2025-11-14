import os
import shutil
import pytest
from app.workers import r2_analysis

@pytest.mark.skipif(not shutil.which("r2"), reason="radare2 not installed")
def test_r2_integration(tmp_path):
    # Provide a small ELF or PE binary path that radare2 can open for testing
    # Create a tiny ELF with `echo -n` won't work — typically you must provide a real binary.
    # This test is optional and will run only if radare2 executable is present.
    # On Windows, we can test with a small system executable
    import platform
    if platform.system() == "Windows":
        # Try to find a small Windows system executable
        sample = "C:\\Windows\\System32\\cmd.exe"
        if not os.path.exists(sample):
            # Fallback to notepad if cmd.exe doesn't exist
            sample = "C:\\Windows\\System32\\notepad.exe"
    else:
        # On Unix-like systems, try common locations
        sample = "/bin/ls"
        if not os.path.exists(sample):
            sample = "/bin/sh"
    
    # Check if the sample file exists
    if os.path.exists(sample):
        out = r2_analysis.analyze_binary(sample, "integration-test")
        assert "functions" in out
    else:
        # Skip the test if we can't find a suitable binary
        pytest.skip("No suitable test binary found")