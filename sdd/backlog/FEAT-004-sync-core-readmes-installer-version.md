# FEAT-004 — Sincronização de Versão nos READMEs do Core para Liberação de Release

* **Status**: `ICEBOX`
* **Tipo**: Documentação / Release Gate
* **Autor**: Macro-Arquiteto (a partir do Achado no BATCH-047)
* **Data de Criação**: 2026-09-01
* **Repositório Alvo**: `conn2flow` (Core)

---

## 🎯 Contexto e Motivação

Durante a homologação do BATCH-047 (REQ-045), a resolução canônica da versão do instalador através de `InstallerGuard::VERSION` reativou o gate documental `inspectReleaseDocumentContents()`.

A inspeção revelou que a tag `instalador-v2.1.0` já existe no repositório Core, porém os links de download em `README.md` (linhas 155, 159, 163) e `README-PT-BR.md` (linhas 160, 164, 168) continuam apontando para `instalador-v2.0.0`.

Consequentemente, o gate documental do `releaseManager.ts` bloqueia a execução da release (`canExecute: false` com `documentation-outdated`).

---

## 📋 Escopo Proposto

1. No repositório `conn2flow` (Core):
   - Atualizar `README.md` e `README-PT-BR.md` substituindo as referências e URLs de download de `instalador-v2.0.0` por `instalador-v2.1.0`.
2. Validar que o gate `inspectReleaseDocumentContents()` e `diagnose()` no `releaseManager.ts` passam a retornar `documentation.ready = true` e `canExecute = true`.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.
