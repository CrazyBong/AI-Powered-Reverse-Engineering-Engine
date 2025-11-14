import httpx
from ..core.config import OPENAI_API_KEY, OPENAI_API_URL, OPENAI_MODEL, OPENAI_MAX_TOKENS, OPENAI_TEMPERATURE


async def call_openai(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You are an expert reverse engineering assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": OPENAI_TEMPERATURE,
        "max_tokens": OPENAI_MAX_TOKENS,
        # optional: "top_p": 1.0, "n": 1
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(OPENAI_API_URL, json=payload, headers=headers)
        r.raise_for_status()
        j = r.json()
    # standard Chat Completions response shape:
    return j["choices"][0]["message"]["content"]