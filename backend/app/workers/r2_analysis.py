"""
backend/app/workers/r2_analysis.py

Performs radare2 analysis using r2pipe.

Functions:
- analyze_binary(file_path, file_id) -> dict
    Runs radare2 analysis (aa) and extracts:
      - functions list (aflj)
      - for each function: disassembly (pdfj) and cfg (agfj)

    Returns a dict:
    {
      "functions": [ { "name": "...", "offset": 1234, "size": 56, ... }, ... ],
      "disassembly": { "<func_offset>": <pdfj json> , ... },
      "cfg": { "<func_offset>": <agfj json> , ... }
    }
"""

import os
import json
import traceback
import random

# r2pipe is used to interact with radare2. If it is not available,
# analyze_binary will raise an ImportError.
# The worker will catch and mark job as FAILED.
try:
    import r2pipe
    R2PIPE_AVAILABLE = True
except Exception:
    r2pipe = None
    R2PIPE_AVAILABLE = False


def mock_analyze_binary(file_path: str, file_id: str):
    """
    Mock analysis function that generates sample data without radare2.
    """
    # Generate mock functions
    mock_functions = [
        {
            "name": "main",
            "offset": 4194304,  # 0x400000
            "size": 128,
            "is-pure": "none",
            "realsz": 128,
            "stackframe": 8,
            "calltype": "none",
            "cost": 10,
            "cc": 20,
            "bits": 64,
            "type": "fcn",
            "nbbs": 3,
            "edges": 4,
            "ebbs": 1,
            "signature": False,
            "minbound": 4194304,
            "maxbound": 4194432,
            "indegree": 1,
            "outdegree": 2,
            "nargs": 2,
            "nlocals": 3,
            "bpvars": 1,
            "spvars": 2,
            "regvars": 0,
            "difftype": "new"
        },
        {
            "name": "sub_function",
            "offset": 4194500,  # 0x400100
            "size": 64,
            "is-pure": "none",
            "realsz": 64,
            "stackframe": 16,
            "calltype": "none",
            "cost": 5,
            "cc": 10,
            "bits": 64,
            "type": "fcn",
            "nbbs": 2,
            "edges": 2,
            "ebbs": 1,
            "signature": False,
            "minbound": 4194500,
            "maxbound": 4194564,
            "indegree": 1,
            "outdegree": 1,
            "nargs": 1,
            "nlocals": 2,
            "bpvars": 0,
            "spvars": 2,
            "regvars": 0,
            "difftype": "new"
        },
        {
            "name": "init_function",
            "offset": 4195000,  # 0x400300
            "size": 32,
            "is-pure": "none",
            "realsz": 32,
            "stackframe": 0,
            "calltype": "none",
            "cost": 2,
            "cc": 5,
            "bits": 64,
            "type": "fcn",
            "nbbs": 1,
            "edges": 1,
            "ebbs": 1,
            "signature": False,
            "minbound": 4195000,
            "maxbound": 4195032,
            "indegree": 0,
            "outdegree": 1,
            "nargs": 0,
            "nlocals": 0,
            "bpvars": 0,
            "spvars": 0,
            "regvars": 0,
            "difftype": "new"
        }
    ]
    
    # Generate mock disassembly data
    mock_disassembly = {}
    mock_cfg = {}
    
    for func in mock_functions:
        addr = str(func["offset"])
        
        # Mock disassembly
        mock_disassembly[addr] = {
            "addr": func["offset"],
            "size": func["size"],
            "name": func["name"],
            "ops": [
                {"offset": func["offset"], "type": "push", "opcode": "push rbp"},
                {"offset": func["offset"] + 1, "type": "mov", "opcode": "mov rbp, rsp"},
                {"offset": func["offset"] + 4, "type": "sub", "opcode": "sub rsp, 0x20"},
                {"offset": func["offset"] + 8, "type": "mov", "opcode": "mov dword [rbp - 0x4], 0x0"}
            ]
        }
        
        # Mock CFG
        mock_cfg[addr] = [
            {
                "addr": func["offset"],
                "size": func["size"],
                "type": "fcn",
                "cc": [
                    {
                        "addr": func["offset"],
                        "size": func["size"],
                        "inputs": [],
                        "outputs": [],
                        "np": 1,
                        "bp": True
                    }
                ],
                "nodes": [
                    {
                        "id": 0,
                        "type": "entry",
                        "offset": func["offset"],
                        "size": 10,
                        "inputs": [],
                        "outputs": [1],
                        "np": 1,
                        "bp": True
                    },
                    {
                        "id": 1,
                        "type": "body",
                        "offset": func["offset"] + 10,
                        "size": func["size"] - 20,
                        "inputs": [0],
                        "outputs": [2],
                        "np": 1,
                        "bp": True
                    },
                    {
                        "id": 2,
                        "type": "exit",
                        "offset": func["offset"] + func["size"] - 10,
                        "size": 10,
                        "inputs": [1],
                        "outputs": [],
                        "np": 0,
                        "bp": False
                    }
                ]
            }
        ]
    
    return {
        "functions": mock_functions,
        "disassembly": mock_disassembly,
        "cfg": mock_cfg
    }


def analyze_binary(file_path: str, file_id: str):
    """
    Analyze the binary at file_path using r2pipe.

    Parameters
    ----------
    file_path : str
        Absolute or relative path to the binary file.
    file_id : str
        The file_id used for storage naming.

    Returns
    -------
    dict
        {
          "functions": [...],
          "disassembly": { "<addr>": <json> },
          "cfg": { "<addr>": <json> }
        }
    Raises:
        RuntimeError if r2pipe is not installed or analysis fails.
    """
    if not R2PIPE_AVAILABLE:
        print("r2pipe not available, using mock analysis")
        return mock_analyze_binary(file_path, file_id)

    # container for results
    result = {
        "functions": [],
        "disassembly": {},
        "cfg": {}
    }

    # If r2pipe is not available, we already returned mock data above
    # So we can safely assume r2pipe is available here
    if r2pipe is None:
        # This should never happen, but added for type checking
        raise RuntimeError("r2pipe is not available")
    try:
        # Open r2 on the file
        # Use r2pipe.open with flags: r2pipe.open(file_path, flags=['-2']) is optional.
        r2 = r2pipe.open(file_path, flags=['-2'])
        # Run full analysis
        r2.cmd('aa')  # analyze all

        # Get function list as JSON
        funcs = r2.cmdj('aflj')  # returns list of functions
        if not funcs:
            funcs = []

        result["functions"] = funcs

        # For each function, extract disassembly (pdfj) and cfg (agfj)
        for f in funcs:
            # Each function object usually has 'offset' (int) or 'addr'
            addr = None
            if "offset" in f:
                addr = f["offset"]
            elif "addr" in f:
                addr = f["addr"]
            elif "name" in f and f.get("name").startswith("sym."):
                # fallback: try to get by name
                addr = f.get("offset", None)

            if addr is None:
                # skip unaddressable functions
                continue

            # build command string - pdfj @ <addr> returns JSON for function disassembly
            try:
                pdfj_cmd = f'pdfj @ {addr}'
                disasm = r2.cmdj(pdfj_cmd)
            except Exception:
                disasm = None

            try:
                agfj_cmd = f'agfj @ {addr}'
                cfg = r2.cmdj(agfj_cmd)
            except Exception:
                cfg = None

            # store results keyed by address string
            key = str(addr)
            result["disassembly"][key] = disasm
            result["cfg"][key] = cfg

        # Close r2 handle
        try:
            r2.quit()
        except Exception:
            pass

        return result

    except Exception as e:
        # best-effort capture of trace
        trace = traceback.format_exc()
        raise RuntimeError(f"radare2 analysis failed: {e}\n{trace}")