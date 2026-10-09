"""Versioned ingestion schema compatible with mdd-client reports."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Health(BaseModel):
    model_config = ConfigDict(extra="forbid")
    project: str = Field(min_length=1, max_length=200)
    active_files: int = Field(ge=0)
    active_bytes: int = Field(ge=0)
    windows: dict[str, int]
    oversized: list[dict] = Field(max_length=1000)
    near_limit: list[str] = Field(max_length=1000)
    missing: list[str] = Field(max_length=100)
    healthy: bool
    history_violations: dict[str, str] = Field(default_factory=dict)


class Friction(BaseModel):
    model_config = ConfigDict(extra="forbid")
    errors: int = Field(default=0, ge=0)
    warnings: int = Field(default=0, ge=0)
    timeouts: int = Field(default=0, ge=0)


class Report(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: Literal[1] = 1
    report_id: UUID
    project: str = Field(min_length=1, max_length=200, pattern=r"^[\w .-]+$")
    created_at: datetime
    health: Health
    friction: Friction
    lessons: list[str] = Field(default_factory=list, max_length=100)

    @field_validator("created_at")
    @classmethod
    def aware(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            raise ValueError("created_at requires a timezone")
        return value

    @field_validator("lessons")
    @classmethod
    def bounded_lessons(cls, value: list[str]) -> list[str]:
        if any(len(item) > 2000 for item in value):
            raise ValueError("Each lesson must contain at most 2000 characters")
        return value
