# BATCH-071 — Implementação das Aplicações em Python: MDD Client CLI & Daemon (ARCH-010) e MDD Hub & Documentation Watcher (ARCH-011)

- **Projeto**: `conn2flow-ai-workspace`
- **Raiz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Requisição**: [REQ-069](../human-requests/req-069.md)
- **Status**: `ready-for-review`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [x] **1. Estruturação do Ambiente Python**:
  - [x] 1.1 Criar diretórios modulares `tools/mdd-client/` e `tools/mdd-hub/`
  - [x] 1.2 Configurar `pyproject.toml` para cada pacote com dependências declaradas (Typer, Rich, FastAPI, Uvicorn, PyYAML, httpx, pytest)
- [x] **2. Implementação do MDD Client CLI & Daemon (`tools/mdd-client/`)**:
  - [x] 2.1 Implementar comando `mdd init` (injeção completa de `memory/` com Tríade 00, 01, 02 e `index.md` hierárquico)
  - [x] 2.2 Implementar comando `mdd sync` (sincronização determinística das 44 skills)
  - [x] 2.3 Implementar comando `mdd compact` (aplicação da Regra dos 10 e teto de 50 KB, dual archive)
  - [x] 2.4 Implementar comando `mdd status` (dashboard Rich de saúde da memória)
  - [x] 2.5 Implementar comando `mdd report` (coleta e exportação estruturada em `memory/reports/`)
  - [x] 2.6 Implementar comando `mdd daemon` / `mdd watch` (loop assíncrono leve de vigilância)
- [x] **3. Implementação do MDD Hub & Documentation Watcher (`tools/mdd-hub/`)**:
  - [x] 3.1 Implementar servidor FastAPI com endpoints `/api/v1/reports` e `/api/v1/status`
  - [x] 3.2 Implementar Documentation Watcher (scrapers assíncronos para Gemini, Claude, Codex, Kimi, Cursor)
  - [x] 3.3 Implementar os 3 modos de autonomia (`headless`, `monitored`, `reviewer`)
  - [x] 3.4 Implementar módulo de despacho Git para automações seguras em branches
- [x] **4. Testes Automatizados & Qualidade**:
  - [x] 4.1 Criar suíte de testes `pytest` para o MDD Client (init, compact, sync, status)
  - [x] 4.2 Criar suíte de testes `pytest` para o MDD Hub (endpoints API, watchers, modos de autonomia)
  - [x] 4.3 Executar `pytest` e assegurar 100% de cobertura nos fluxos críticos
- [x] **5. Documentação & Handoff para Extensão VS Code (ARCH-014)**:
  - [x] 5.1 Redigir documentação de uso e CLI em `tools/README.md`
  - [x] 5.2 Emitir relatório de implementação e evidências de execução

---

## 🛡️ Regras Invioláveis de Execução

1. **Python 3.11+ e Clean Architecture**: Código modular, tipado (`type hints`), assíncrono onde apropriado.
2. **Proibição de `git add .`**: Listar exclusivamente os arquivos adicionados ou alterados no commit.
3. **Isolamento de Diretórios**: A injeção de memória do `mdd init` deve ser puramente local e não alterar arquivos fora do diretório alvo.


## Implementação e evidências do Executor — 2026-10-09

- Código: commit `d052f32` na branch `feat/req-069`; stage feito com lista explícita de arquivos. Entrega técnica pronta para revisão independente; não constitui homologação.
- Pacotes 0.1.0 independentes, Python >=3.11, instalados editavelmente em `.venv-mdd` com Python 3.12.4. Client Typer/Rich; Hub FastAPI/Uvicorn/httpx/PyYAML. Node é usado somente pelo adaptador de sincronização oficial; Git é usado na evolução headless.
- Client: tríade e árvore completa idempotente, kits opcionais, sincronização das 44 skills em cinco kits, regras canônicas e preservação local. `--target` no sincronizador restringe a escrita ao cliente, sem disparar propagação para satélites/templates. Sem cópia para pastas de teste do Gestor.
- Compactação: preview por padrão, `--apply` explícito, janela dos dez por pasta e em históricos agregados, 50 KiB/30 KiB, proteção de Chefia/CURRENT, SHA-256, original byte a byte, extrato estrutural e divisão íntegra. JSON grande é arquivado como JSON; links inline, referências e file URIs internas são reparados. Não foi aplicada poda ao memory/ real desta matriz.
- Report: saúde e contadores de logs explícitos, sem logs brutos ou caminho absoluto do projeto; envio opcional com timeout e relatório local preservado em falha. Daemon/watch assíncronos com mudança de estado, intervalo, ciclo único e parada por Ctrl+C.
- Hub: UUID/schema/data/limites validados; ingestão 201, retry 200, conflito 409, inválido 422, excesso 413 e token 401. Persistência atômica, índices de clientes e consolidação de lições/atritos. Bind loopback; bind externo da CLI exige token.
- Watcher: sete fontes oficiais HTTPS, três coletas simultâneas, limite de 2 MiB, retries transitórios, extração estruturada limitada e checkpoints após sucesso. Primeira coleta apenas cria baseline. Reviewer enfileira; monitored atualiza referências e gera relatório; headless cria worktree/branch, commit atômico e manifesto de PR. Publicação opcional da branch; não há merge nem PR hospedada automática.

### Validação executada

1. `python -m pytest tools/mdd-client/tests tools/mdd-hub/tests tools/tests -q --cov=mdd_client --cov=mdd_hub --cov-fail-under=95`: **61 aprovados, zero falhas/erros/skips**, **97,23% de cobertura global** (901 statements, 25 não cobertos). Todos os cenários críticos de aceite possuem testes; isso não equivale a 100% de cobertura de linhas. [JUnit](../../completions/BATCH-071-pytest.xml) / [resumo](../../completions/BATCH-071-test-summary.json).
2. Git real: branch e stage humanos preservados no modo headless, retry idempotente, publicação para remote bare local, rejeição de branch incompleta e falha de commit conservando worktree. API real: Uvicorn em porta loopback temporária, Client envia relatório autenticado, retry deduplicado e acesso sem token rejeitado; processo encerrado no finally.
3. `python tools/verify_mdd.py --output completions/BATCH-071-smoke.json --live-docs`: **11 checks de CLI**, **44 skills × 5 kits**, segunda sincronização sem escrita, dois excedentes arquivados e **sete fontes reais coletadas sem erro**, com digest e tamanho registrados. [Smoke](../../completions/BATCH-071-smoke.json). Conteúdo externo não foi copiado para evidência permanente.
4. `ruff check tools`, `pip check`, `node --check scripts/skills/sync-skills.cjs` e `git diff --check`: PASS. Sintaxe dos 15 módulos de aplicação analisada com gramática Python 3.11. Workflow CI preparado para Python 3.11/3.12 em Windows/Linux; execução remota não foi conferida neste lote.
5. Manual [tools/README](../../tools/README.md) e guias [PT-BR](../../docs/pt-br/GUIA-ECOSSISTEMA-PYTHON-MDD.md) / [EN](../../docs/en/MDD-PYTHON-ECOSYSTEM-GUIDE.md) conferidos contra código `d052f32`. `node scripts/docs/validate-public-docs.cjs`: PASS em 23 documentos, 11 pares, 254 links relativos e 84 fontes; zero falhas. [Auditoria](../../completions/BATCH-071-docs-audit.json).

### Defeitos encontrados e corrigidos

- Particionamento cortava links Markdown: divisão respeita limites dos links, preserva texto completo e mantém fragments de headings no router.
- JSON grande poderia receber um router Markdown inválido: agora é arquivado inteiro, em JSON válido.
- Consolidação poderia ser contada como relatório cliente: arquivo de infraestrutura excluído da enumeração.
- Retry headless poderia confundir branch criada com commit concluído: conteúdo do commit é conferido; falha conserva worktree para recuperação.
- IDs automáticos de um teste com resposta de 2 MiB ultrapassavam caminhos do Windows: IDs curtos explícitos; duas falhas de setup corrigidas, execução final verde.

### O que não foi exercitado e limites conhecidos

- Execução local foi em Python 3.12.4/Windows; Python 3.11 e Linux têm CI configurada e sintaxe conferida, sem alegação de execução remota concluída.
- Um aviso de depreciação de Starlette/AnyIO permanece visível. Dependências passam em `pip check`.
- Extração do watcher é heurística; snapshots reais foram coletados, mudanças entre versões foram validadas por fixtures. Nenhuma regra normativa ou skill existente é reescrita automaticamente a partir do scraper.
- Sínteses de compactação são extratos estruturais explícitos; originais e partes mantêm conteúdo completo. Sintaxe de links aninhados e anchors HTML personalizados exigem revisão. Routers excessivamente grandes falham antes de alterar o ativo.
- Armazenamento do Hub usa um worker e locks de arquivo, não banco distribuído. Daemon roda em foreground para hospedagem por gerenciador de serviços; serviço persistente do sistema não foi instalado.
- PR é preparada em manifesto; publicação remota da aplicação só envia branch se solicitada. Publicação do próprio lote ocorre na branch de trabalho; nenhuma PR hospedada, merge, deploy de produção, PyPI ou integração ARCH-014 foi executada.
- Revisão independente e homologação permanecem sob responsabilidade da Tríade. MCP Hub não disponibilizou ferramentas de CLI/recibo nesta sessão; comandos locais e recibo versionado são as evidências.
