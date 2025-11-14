"""Stores configuration and environment settings."""

import os

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
# Default model set to GPT-5
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5")
# Use the standard Chat Completions API (adjust if you use a different endpoint)
OPENAI_API_URL = os.environ.get("OPENAI_API_URL", "https://api.openai.com/v1/chat/completions")

# Token and model tuning for GPT-5:
OPENAI_MAX_TOKENS = int(os.environ.get("OPENAI_MAX_TOKENS", "2000"))  # bigger by default for GPT-5
OPENAI_TEMPERATURE = float(os.environ.get("OPENAI_TEMPERATURE", "0.0"))