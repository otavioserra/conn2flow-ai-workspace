---
name: c2f-agent-visual-inspection
description: "MANDATORY READ before visually validating screens, CSS animations, console errors or authenticated Gestor routes in the local test environment. Eliminates the need for human intervention for visual checks."
user-invocable: false
---

# Automated Visual Inspection and Validation in Conn2Flow Local Environment

# ⚡ Mandatory Trigger
- **TRIGGER**: Validating visual rendering, computed styles (`getComputedStyle`), CSS animations (`getAnimations`), JavaScript console errors, or authenticated Gestor routes in the local test environment (Docker).
- **SKIP ONLY IF**: Purely backend CLI or migration tasks without screen rendering.
- **CONSEQUENCE OF IGNORING**: Leaving items pending as "awaiting operator visual sign-off", consuming extra context rounds and masking visual bugs (e.g. `@media (prefers-reduced-motion)` or hidden CSS classes).

---

## 🔍 1. How the Autonomous Inspection Pipeline Works

In the local development environment (`$_GESTOR['development-env'] === true`), the framework provides tools for the agent to inspect runtime completely autonomously:

### Step 1: Server-Side Session Authentication (`auth:cookie`)
For authenticated Gestor routes (e.g. `/admin/`, `/dashboard/`, `/chat-intelligence/`):
```bash
./c2f auth:cookie --user=admin --project=my-project
```
* **What it does**: Generates server-side session JWT token and writes cookie jar to `temp/agent-cookies.txt`.

### Step 2: Headless Inspection via CLI (`page:inspect`)
Execute the native inspection command:
```bash
./c2f page:inspect "http://localhost/module-route/" --selector=".my-element" --computed="display,opacity,transform" --screenshot
```
* **What it returns**: Structured JSON containing:
  - `status`: HTTP status code (e.g. 200, 302, 403).
  - `console_errors`: Array of errors captured in the browser console.
  - `computed_style`: Computed styles resolved by the browser in real runtime.
  - `animations`: State of active CSS animations (`getAnimations()`).
  - `screenshot`: Path to the generated PNG screenshot in `temp/`.

---

## ⛔ Inviolable Inspection Rules:
1. **EXCLUSIVE TO LOCAL TEST ENVIRONMENT**: NEVER run automated inspection or scraping against production URLs.
2. **SDD Registration**: Inspection evidence (JSON from `page:inspect` and screenshots) MUST be logged directly into the repository's `VALIDATION-CHECKLIST.md` rather than marking "pending operator".
3. **Environment Switching (`c2f env:set`)**:
   - `c2f env:set development`: Forces reading physical files in `resources/`.
   - `c2f env:set production`: Forces reading compiled records in the database.
