"""Configurable official documentation sources."""

import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

import yaml


@dataclass(frozen=True)
class Source:
    name: str
    url: str

    def __post_init__(self):
        if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", self.name):
            raise ValueError("Source name must be a lowercase slug")
        url = urlsplit(self.url)
        if url.scheme != "https" or not url.hostname or url.username or url.password:
            raise ValueError("Documentation sources require an HTTPS URL without credentials")


DEFAULT_SOURCES = (
    Source("gemini", "https://ai.google.dev/gemini-api/docs/changelog"),
    Source("antigravity", "https://antigravity.google/docs/changelog"),
    Source("claude-code", "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md"),
    Source("mcp-sdk", "https://github.com/modelcontextprotocol/python-sdk/releases"),
    Source("codex", "https://developers.openai.com/codex/changelog/"),
    Source("kimi", "https://raw.githubusercontent.com/MoonshotAI/kimi-cli/main/CHANGELOG.md"),
    Source("cursor", "https://cursor.com/changelog"),
)


def load(path: Path | None = None) -> tuple[Source, ...]:
    if path is None:
        return DEFAULT_SOURCES
    document = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(document, dict) or not isinstance(document.get("sources"), list):
        raise ValueError("Configuration requires a sources list")
    result = tuple(Source(**row) for row in document["sources"])
    if not result or len({s.name for s in result}) != len(result):
        raise ValueError("Sources must be nonempty and have unique names")
    return result
