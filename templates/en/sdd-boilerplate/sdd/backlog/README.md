# SDD Backlog — Idea Incubator

This directory holds long-term ideas, discussions, and research that are **not authorized for implementation**.

## Item types

- `Feature`: isolated product capability.
- `Epic`: broad initiative to be split into requirements and batches.
- `Spike/Research`: technical investigation without an implementation commitment.
- `Architecture`: proposed structural change or future decision.

## Lifecycle

- `ICEBOX`: long-term idea with no active refinement.
- `IN-DISCUSSION`: under active analysis with the AI Architect.
- `READY`: mature enough for promotion, but still not authorized for code.

## Mandatory Intake Gate

The backlog is a draft area managed by the User and AI Architect. Executors may read it for context, but must never implement, create an execution batch, or change code directly from an item stored here.

A `READY` item becomes authorized work only after the User explicitly promotes it to `sdd/human-requests/req-XXX.md`, updates `CURRENT.md`, and associates an executable batch.

Move promoted or closed items to `archive/` and keep their reference in `BACKLOG-INDEX.md`.
