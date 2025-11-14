def build_explanation_prompt(file_id, function_addr, disassembly_json):
    """
    Build a prompt for AI explanation of a function's disassembly.
    
    Args:
        file_id: The ID of the file being analyzed
        function_addr: The address of the function
        disassembly_json: The disassembly JSON data
        
    Returns:
        str: The formatted prompt for the AI
    """
    # Extract ops from disassembly_json["ops"]
    ops = disassembly_json.get("ops", [])
    
    # Produce plain text assembly lines
    asm_lines = []
    for op in ops:
        offset = op.get("offset", 0)
        disasm = op.get("disasm", "")
        asm_lines.append(f"0x{offset:x}: {disasm}")
    
    asm_text = "\n".join(asm_lines)
    
    # Compose the user prompt
    prompt = f"""You are an expert reverse engineer with deep knowledge of x86/16-bit/32-bit/64-bit assembly. 
Explain what this function does in clear, concise language for a software engineer.

Provide four sections:
1) High-level summary (1-3 sentences).
2) Step-by-step explanation of the important instructions and control flow.
3) Clean pseudocode reconstruction (Python-style).
4) Any suspicious or noteworthy behavior (I/O, self-modifying, packing, obfuscation).

Disassembly (file_id: {file_id}, addr: {function_addr}):
{asm_text}"""
    
    return prompt