"""Loads stable prompt text shared by the browser and API runtimes."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


@lru_cache(maxsize=1)
def load_prompt_catalog() -> dict[str, Any]:
    candidates = (
        Path.cwd() / "config" / "ai-prompts.json",
        Path(__file__).resolve().parents[3] / "config" / "ai-prompts.json",
    )
    catalog_path = next((path for path in candidates if path.is_file()), None)
    if catalog_path is None:
        raise FileNotFoundError("config/ai-prompts.json was not found")
    return json.loads(catalog_path.read_text(encoding="utf-8"))


def chat_system_instruction() -> str:
    return str(load_prompt_catalog()["chat"]["system_instruction"])


def summary_system_instruction() -> str:
    return str(load_prompt_catalog()["chat"]["summary_instruction"])


def flow_generation_prompt_data() -> dict[str, Any]:
    return dict(load_prompt_catalog()["flow_generation"])


def flow_generation_system_instruction() -> str:
    lines = flow_generation_prompt_data()["system_instruction_lines"]
    return "\n".join(str(line) for line in lines) + "\n"
