from fastapi import APIRouter, HTTPException
import os
import json
from ..core import storage
from ..utils.ai_prompt import build_explanation_prompt
from ..utils.openai_client import call_openai

router = APIRouter(prefix="/explain", tags=["explain"])

# In-memory cache for explanations (key: "{file_id}:{addr}", value: explanation)
explanation_cache = {}

@router.get("/{file_id}/{addr}")
async def explain_function(file_id: str, addr: str):
    """
    Get AI explanation for a function's disassembly.
    
    Args:
        file_id: The ID of the file
        addr: The address of the function
        
    Returns:
        dict: Explanation of the function
    """
    # 1. Define artifact folder path
    artifact_folder = os.path.join("storage", "artifacts", file_id)
    
    # 2. Define disassembly path
    disasm_path = os.path.join(artifact_folder, "disassembly", f"{addr}.json")
    
    # 3. Check if disassembly file exists
    if not os.path.exists(disasm_path):
        raise HTTPException(status_code=404, detail="Disassembly not found")
    
    # 4. Load disassembly JSON
    try:
        with open(disasm_path, "r") as f:
            disassembly_json = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load disassembly: {str(e)}")
    
    # 5. Check cache first
    cache_key = f"{file_id}:{addr}"
    if cache_key in explanation_cache:
        return {
            "file_id": file_id,
            "addr": addr,
            "explanation": explanation_cache[cache_key]
        }
    
    # Check if explanation file exists
    explanations_dir = os.path.join(artifact_folder, "explanations")
    explanation_path = os.path.join(explanations_dir, f"{addr}.txt")
    
    if os.path.exists(explanation_path):
        try:
            with open(explanation_path, "r") as f:
                explanation = f.read()
            # Cache it
            explanation_cache[cache_key] = explanation
            return {
                "file_id": file_id,
                "addr": addr,
                "explanation": explanation
            }
        except Exception as e:
            pass  # If file read fails, continue to generate new explanation
    
    # 6. Build prompt
    prompt = build_explanation_prompt(file_id, addr, disassembly_json)
    
    # 7. Call OpenAI
    try:
        explanation = await call_openai(prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get explanation from AI: {str(e)}")
    
    # 8. Save explanation to file
    try:
        os.makedirs(explanations_dir, exist_ok=True)
        with open(explanation_path, "w") as f:
            f.write(explanation)
        # Cache it
        explanation_cache[cache_key] = explanation
    except Exception as e:
        pass  # If save fails, we still return the explanation
    
    # 9. Return JSON
    return {
        "file_id": file_id,
        "addr": addr,
        "explanation": explanation
    }