---
name: c2f-tailwind-css-architecture
description: "MANDATORY READING before creating, changing, or migrating any screen, layout, page, or component that uses Tailwind CSS v4. Prevents cascade conflicts, database css_compiled masking, runtime style purging, and broken builds."
user-invocable: false
---

# Tailwind CSS v4 Governance and Architecture in Conn2Flow and Projects

# ⚡ Mandatory Trigger
- **TRIGGER**: Create, change, migrate, or debug any layout, page, component, or template with Tailwind CSS v4 classes.
- **SKIP ONLY IF**: The task is purely backend PHP or API work with no visual rendering.
- **CONSEQUENCE OF IGNORING**: Broken CSS cascade (sidebar hidden on desktop), code masked by the database cache (`css_compiled`), and runtime styles being purged.

---

## ⛔ Inviolable Rules
1. **NEVER run manual Tailwind CLI commands** (`npx tailwindcss`, etc.). Always use `./c2f resources:sync` (or `php atualizacao-dados-recursos.php`).
2. **All visual HTML/CSS must live in the Resources System**: `resources/<language>/<type>/<id>/<id>.html` and `<id>.json`.
3. **JSON Metadata**: Every Tailwind resource MUST declare `"framework_css": "tailwindcss"` in its `<id>.json` metadata file.
4. **Dynamic Runtime Templates (Finding F2)**: Declare dynamic template dependencies in the parent resource JSON array `"tailwind_dependencies": ["id-1", "id-2"]`.
5. **Mandatory Database Cache Clearing (`css_compiled`)**: When editing physical files on disk, set `paginas.css_compiled = NULL` in the database so the `.precompiled.css` file takes effect without being masked.
6. **Cascade and Media Queries**: Never use an isolated `.hidden` in child pages when it conflicts with `lg:flex` or `md:block` from the parent layout; always use explicit breakpoint prefixes (for example, `hidden lg:flex`).
