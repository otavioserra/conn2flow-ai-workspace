# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-053.md](req-053.md)
* **Status**: `HOMOLOGATED`
* **Lote Relacionado**: `BATCH-055`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Homologação**: 2026-09-08
* **Lote Anterior Concluído**: [req-052.md](req-052.md) (`BATCH-054`)

## 🎯 Objetivo Operacional do Lote BATCH-055

Corrigir a execução remota de logs e compilação na VM:
1. Adicionar `sudo` no comando de leitura de logs (`tail -n 100`) em `vmDiagnosticsPolicy.ts` para eliminar o erro de permissão negada.
2. Sincronizar launcher `c2f` e diretório `cli/` para destinos SSH via rsync.
3. Atualizar `CssRebuildCommand::regenerarViaSsh()` para suporte a modo duplo (CLI nativo + fallback PHP) com suporte a `NODE_PATH` em `lab.conn2flow.local`.
4. Adicionar fallback para o binário `tailwindcss` global no `tailwind-recursos.php` quando não houver pasta `node_modules` local.
5. Corrigir portabilidade das asserções de escape de comando SSH no `ProjectSshPublicPathReq050Test.php` para o runner Linux/Ubuntu do GitHub Actions.
