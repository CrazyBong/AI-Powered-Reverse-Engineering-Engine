"""
Unit tests for r2_analysis.analyze_binary using monkeypatch to mock r2pipe.
This test does NOT require radare2 to be installed.
"""

import json
import os
import types
from app.workers import r2_analysis

class DummyR2:
    def __init__(self, path=None, flags=None):
        self.path = path

    def cmd(self, c):
        return ""

    def cmdj(self, c):
        # emulate aflj
        if c.strip().startswith('aflj'):
            return [
                {"name": "sym.func1", "offset": 4096, "size": 32},
                {"name": "sym.func2", "offset": 8192, "size": 64}
            ]
        if c.strip().startswith('pdfj'):
            # return a minimal pdfj-like structure
            return {"ops": [{"offset": 4096, "mnemonic": "push"}, {"offset": 4097, "mnemonic": "mov"}]}
        if c.strip().startswith('agfj'):
            # return a minimal agfj-like structure
            return [{"blocks": [{"addr": 4096, "size": 10}], "edges": []}]
        return None

    def quit(self):
        pass

def test_analyze_binary_monkeypatch(monkeypatch, tmp_path):
    # Create a dummy r2pipe module
    dummy_r2pipe = types.ModuleType('r2pipe')
    setattr(dummy_r2pipe, 'open', lambda path, flags=None: DummyR2(path))
    
    # monkeypatch sys.modules to include our dummy r2pipe
    import sys
    monkeypatch.setitem(sys.modules, 'r2pipe', dummy_r2pipe)
    
    # Force reload the r2_analysis module to pick up our mocked r2pipe
    import importlib
    importlib.reload(r2_analysis)
    
    # call analyze_binary
    sample_file = tmp_path / "fakebin"
    sample_file.write_bytes(b"\x7fELF")
    out = r2_analysis.analyze_binary(str(sample_file), "testfile")
    assert "functions" in out
    assert isinstance(out["functions"], list)
    assert len(out["functions"]) == 2
    assert "disassembly" in out
    assert "cfg" in out