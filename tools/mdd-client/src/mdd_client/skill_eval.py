"""Skill regression evals (ARCH-018 Phase 4): ``mdd eval``.

A scenario is a JSON file in ``tools/mdd-client/evals/skills/`` that pins one critical
Conn2Flow trap to the canonical skill text (``.gemini/skills/<skill>/SKILL.md`` plus its
``subskills/``) and, optionally, to every registered translation copy in
``templates/<lang>/templates/*/*/skills/<skill>/``.

Providers are pluggable. ``deterministic`` (default) is offline, needs no API key and is
fully reproducible in pytest/CI: it checks required terms/regexes and forbidden
anti-patterns. A future LLM provider only has to implement :class:`Provider`.
"""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path
from typing import Protocol

SCENARIOS = Path("tools/mdd-client/evals/skills")
SKILLS = Path(".gemini/skills")
TEMPLATES = Path("templates")
# Keep in sync with scripts/skills/generate-skills-index.cjs (Skill Budget).
BUDGET = {"persona": 200, "core": 300, "governance": 200}
GOVERNANCE_C2F = {"c2f-mdd-indexing-and-handoffs", "c2f-multilingual-skills-governance"}
ASSERTIONS = ("must_include", "must_match", "must_not_include", "must_not_match")
FIELDS = {"id", "title", "skill", "trap", "subskills", "translations", "max_lines"}
ID = re.compile(r"^EVAL-\d{3}-[a-z0-9-]+$")


def category(skill: str) -> str:
    if skill.startswith("c2f-persona-"):
        return "persona"
    return "core" if skill.startswith("c2f-") and skill not in GOVERNANCE_C2F else "governance"


def _text(path: Path) -> str:
    return path.read_bytes().decode("utf-8-sig").replace("\r\n", "\n")


def _lines(content: str) -> int:
    return content.count("\n") + (0 if content.endswith("\n") or not content else 1)


@dataclass
class Scenario:
    id: str
    title: str
    skill: str
    trap: str
    path: str
    assertions: dict[str, list[str]]
    subskills: list[str] = field(default_factory=list)
    translations: dict[str, dict[str, list[str]]] = field(default_factory=dict)
    max_lines: int | None = None


@dataclass
class Corpus:
    """What a provider may read for one skill: canonical text, subskills and translation copies."""

    skill: str
    text: str
    lines: int
    subskills: dict[str, str]
    translations: dict[str, dict[str, str]]

    @property
    def combined(self) -> str:
        return "\n".join([self.text, *self.subskills.values()])


class Provider(Protocol):
    name: str

    def evaluate(self, scenario: Scenario, corpus: Corpus) -> list[str]:
        """Return the failure messages for one scenario (empty list means PASS)."""


def _check(content: str, assertions: dict[str, list[str]], where: str) -> list[str]:
    failures = []
    for term in assertions.get("must_include", []):
        if term not in content:
            failures.append(f"{where}: missing required term {term!r}")
    for pattern in assertions.get("must_match", []):
        if not re.search(pattern, content, re.M):
            failures.append(f"{where}: no match for required pattern {pattern!r}")
    for term in assertions.get("must_not_include", []):
        if term in content:
            failures.append(f"{where}: forbidden anti-pattern present {term!r}")
    for pattern in assertions.get("must_not_match", []):
        if match := re.search(pattern, content, re.M):
            failures.append(f"{where}: forbidden pattern {pattern!r} matched {match[0]!r}")
    return failures


class DeterministicProvider:
    """Offline provider: literal/regex assertions over the skill corpus. No network, no model."""

    name = "deterministic"

    def evaluate(self, scenario: Scenario, corpus: Corpus) -> list[str]:
        failures = _check(corpus.combined, scenario.assertions, f"{scenario.skill} (pt-br)")
        for rel in scenario.subskills:
            if rel not in corpus.subskills:
                failures.append(f"{scenario.skill}: required subskill missing {rel}")
        if scenario.max_lines is not None and corpus.lines > scenario.max_lines:
            failures.append(f"{scenario.skill}: {corpus.lines} lines exceeds scenario max_lines {scenario.max_lines}")
        for language, assertions in sorted(scenario.translations.items()):
            copies = corpus.translations.get(language, {})
            if not copies:
                failures.append(f"{scenario.skill} ({language}): no translation copy found in templates/")
            for where, content in sorted(copies.items()):
                failures += _check(content, assertions, f"{where} ({language})")
        return failures


PROVIDERS: dict[str, Callable[[], Provider]] = {"deterministic": DeterministicProvider}


def register_provider(name: str, factory: Callable[[], Provider]) -> None:
    """Plug a provider (e.g. an LLM judge) without touching the runner."""
    if not re.fullmatch(r"[a-z][a-z0-9_-]{1,39}", name):
        raise ValueError(f"Invalid provider name: {name}")
    PROVIDERS[name] = factory


def _strings(value, label: str) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(item, str) and item for item in value):
        raise ValueError(f"{label} must be a list of non-empty strings")
    return value


def _assertions(raw: dict, label: str) -> dict[str, list[str]]:
    unknown = set(raw) - set(ASSERTIONS)
    if unknown:
        raise ValueError(f"{label}: unknown assertion keys {sorted(unknown)}")
    result = {key: _strings(raw[key], f"{label}.{key}") for key in ASSERTIONS if key in raw}
    for pattern in result.get("must_match", []) + result.get("must_not_match", []):
        re.compile(pattern)
    return result


def load_scenarios(directory: Path) -> list[Scenario]:
    if not directory.is_dir():
        raise ValueError(f"Scenario directory not found: {directory}")
    scenarios, seen = [], set()
    for path in sorted(directory.glob("*.json")):
        raw = json.loads(path.read_text(encoding="utf-8"))
        label = path.name
        for key in ("id", "title", "skill", "trap"):
            if not isinstance(raw.get(key), str) or not raw[key].strip():
                raise ValueError(f"{label}: field {key!r} is required")
        if not ID.match(raw["id"]) or raw["id"] in seen:
            raise ValueError(f"{label}: invalid or duplicated id {raw['id']!r}")
        seen.add(raw["id"])
        unknown = set(raw) - FIELDS - set(ASSERTIONS)
        if unknown:  # A typo (e.g. must_have) must never silently weaken a scenario.
            raise ValueError(f"{label}: unknown assertion keys {sorted(unknown)}")
        if raw.get("max_lines") is not None and (not isinstance(raw["max_lines"], int) or raw["max_lines"] < 1):
            raise ValueError(f"{label}: max_lines must be a positive integer")
        assertions = _assertions({k: raw[k] for k in ASSERTIONS if k in raw}, label)
        if not any(assertions.values()):
            raise ValueError(f"{label}: at least one assertion is required")
        translations = {lang: _assertions(value, f"{label}.translations.{lang}")
                        for lang, value in (raw.get("translations") or {}).items()}
        scenarios.append(Scenario(id=raw["id"], title=raw["title"], skill=raw["skill"], trap=raw["trap"],
                                  path=path.as_posix(), assertions=assertions,
                                  subskills=_strings(raw["subskills"], f"{label}.subskills") if raw.get("subskills") else [],
                                  translations=translations, max_lines=raw.get("max_lines")))
    return scenarios


def load_corpus(matrix: Path, skill: str, languages: set[str]) -> Corpus:
    base = matrix / SKILLS / skill
    source = base / "SKILL.md"
    if not source.is_file():
        raise ValueError(f"Canonical skill not found: {skill}")
    text = _text(source)
    subskills = {}
    if (base / "subskills").is_dir():
        for path in sorted((base / "subskills").rglob("*")):
            if path.is_symlink():
                raise ValueError(f"Refusing linked subskill: {path}")
            if path.is_file():
                subskills[path.relative_to(base).as_posix()] = _text(path)
    translations: dict[str, dict[str, str]] = {}
    for language in sorted(languages):
        root = matrix / TEMPLATES / language / "templates"
        copies = {}
        for path in sorted(root.glob(f"*/*/skills/{skill}/SKILL.md")):
            extra = path.parent / "subskills"
            parts = [_text(path)]
            if extra.is_dir():
                parts += [_text(p) for p in sorted(extra.rglob("*")) if p.is_file() and not p.is_symlink()]
            copies[path.relative_to(matrix).as_posix()] = "\n".join(parts)
        translations[language] = copies
    return Corpus(skill=skill, text=text, lines=_lines(text), subskills=subskills, translations=translations)


def run(matrix: Path, *, skill: str | None = None, provider: str = "deterministic",
        scenarios_dir: Path | None = None) -> dict:
    """Run every scenario (optionally only one skill) and return a stable JSON-able report."""
    matrix = matrix.resolve()
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider: {provider} (available: {'|'.join(sorted(PROVIDERS))})")
    engine = PROVIDERS[provider]()
    directory = scenarios_dir.resolve() if scenarios_dir else matrix / SCENARIOS
    scenarios = load_scenarios(directory)
    if skill:
        scenarios = [s for s in scenarios if s.skill == skill]
        if not scenarios:
            raise ValueError(f"No eval scenario covers skill: {skill}")
    if not scenarios:
        raise ValueError(f"No eval scenarios in {directory}")
    corpora: dict[str, Corpus] = {}
    results = []
    for scenario in scenarios:
        languages = set(scenario.translations)
        key = scenario.skill + "|" + ",".join(sorted(languages))
        corpus = corpora.get(key) or corpora.setdefault(key, load_corpus(matrix, scenario.skill, languages))
        failures = engine.evaluate(scenario, corpus)
        kind = category(scenario.skill)
        budget = BUDGET[kind]
        state = "OVER" if corpus.lines > budget else "NEAR" if corpus.lines >= -(-budget * 8 // 10) else "OK"
        results.append({"id": scenario.id, "title": scenario.title, "skill": scenario.skill, "trap": scenario.trap,
                        "status": "PASS" if not failures else "FAIL", "failures": failures,
                        "metrics": {"lines": corpus.lines, "budget": budget, "budget_state": state,
                                    "subskills": len(corpus.subskills),
                                    "translation_copies": {k: len(v) for k, v in sorted(corpus.translations.items())}}})
    failed = [r for r in results if r["status"] == "FAIL"]
    return {"status": "EVAL-FAIL" if failed else "EVAL-PASS", "provider": provider,
            "scenarios": len(results), "passed": len(results) - len(failed), "failed": len(failed),
            "skills": sorted({r["skill"] for r in results}),
            "budget_attention": [{"skill": name, "state": state} for name, state in
                                 sorted({(r["skill"], r["metrics"]["budget_state"]) for r in results
                                         if r["metrics"]["budget_state"] != "OK"})],
            "results": results}
