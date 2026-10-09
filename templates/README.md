# 📦 Templates & AI Toolkits Hub — Conn2Flow AI Workspace

Este diretório armazena os moldes canônicos de kits de inteligência artificial e os boilerplates do framework **Spec-Driven Development (SDD)**, organizados por idioma.

---

## 🗂️ Estrutura de Diretórios

```text
templates/
├── pt-br/                                      <-- 🇧🇷 Moldes e Boilerplates em Português
│   ├── sdd-boilerplate/sdd/                    <-- Estrutura inicial do SDD para novos projetos
│   └── templates/
│       ├── spec-driven-project-claude-kit/     <-- Kit Claude Code (CLAUDE.md, 33 Skills, regras)
│       ├── spec-driven-project-cursor-kit/     <-- Kit Cursor IDE (.cursorrules, .cursor/rules, skills)
│       ├── spec-driven-project-copilot-kit/    <-- Kit GitHub Copilot (copilot-instructions, skills)
│       ├── spec-driven-project-gemini-kit/     <-- Kit Gemini Antigravity (GEMINI.md, skills)
│       ├── private-project-claude-kit/         <-- Kit Claude para projetos privados
│       └── private-project-copilot-kit/        <-- Kit Copilot para projetos privados
└── en/                                         <-- 🇺🇸 English Templates & Boilerplates
    ├── sdd-boilerplate/sdd/                    <-- Standard initial SDD scaffold
    └── templates/
        ├── spec-driven-project-claude-kit/
        ├── spec-driven-project-cursor-kit/
        ├── spec-driven-project-copilot-kit/
        ├── spec-driven-project-gemini-kit/
        ├── private-project-claude-kit/
        └── private-project-copilot-kit/
```

---

## 🚀 Como Injetar os Templates nos Projetos:
Use os scripts automatizados na pasta `scripts/`:
```powershell
# Exemplo para injetar o kit Claude em um projeto:
.\scripts\install-spec-driven-claude-kit.ps1 -TargetRepoPath "C:\caminho\meu-projeto" -Language "pt-br" -Force
```

## Canonical MDD scaffolds (REQ-071)

Both languages provide `mdd-boilerplate/memory/` with the five root documents 00–04, hierarchical indexes, backlog, decisions, human-requests, implementation, reports, validation and raw/active plus raw/archive. The existing `sdd-boilerplate/sdd/` remains the installer compatibility scaffold and receives the same numbered filenames and folders. `mdd init` creates the five documents directly without overwriting existing content.
