"""Represents extracted artifacts (functions, disassembly, CFG)."""
import os
import json
from typing import Optional, Dict, Any


class Artifacts:
    """Model for handling analysis artifacts."""
    
    def __init__(self, file_id: str):
        self.file_id = file_id
        self.base_path = os.path.join("backend", "storage", "artifacts", file_id)
        
    def load_functions(self) -> list:
        """Load functions list from artifacts."""
        functions_path = os.path.join(self.base_path, "functions.json")
        if os.path.exists(functions_path):
            with open(functions_path, "r") as f:
                return json.load(f)
        return []
        
    def load_disassembly(self, addr: str) -> dict:
        """Load disassembly for a specific function."""
        disasm_path = os.path.join(self.base_path, "disassembly", f"{addr}.json")
        if os.path.exists(disasm_path):
            with open(disasm_path, "r") as f:
                return json.load(f)
        return {}
        
    def load_explanation(self, addr: str) -> Optional[str]:
        """Load cached explanation for a function."""
        explanation_path = os.path.join(self.base_path, "explanations", f"{addr}.txt")
        if os.path.exists(explanation_path):
            with open(explanation_path, "r") as f:
                return f.read()
        return None
        
    def save_explanation(self, addr: str, explanation: str) -> None:
        """Save explanation for a function."""
        explanations_dir = os.path.join(self.base_path, "explanations")
        os.makedirs(explanations_dir, exist_ok=True)
        explanation_path = os.path.join(explanations_dir, f"{addr}.txt")
        with open(explanation_path, "w") as f:
            f.write(explanation)