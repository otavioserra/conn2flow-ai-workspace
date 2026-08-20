---
name: 'Conn2Flow PHP Gestor'
description: 'Use ao editar arquivos PHP do gestor em projetos privados Conn2Flow, especialmente módulos em gestor/modulos com contrato estrutural próprio.'
applyTo: 'gestor/**/*.php'
---

- Preserve naming, helpers de banco, convenções de template e o estilo já existente no Conn2Flow.
- Prefira edições focadas perto do controlador, módulo ou arquivo que realmente decide o comportamento.
- Ao criar ou refatorar módulo em `gestor/modulos/**`, não entregue só funções de negócio; confirme bootstrap, JSON, despacho e fechamento de interface/AJAX.
- Ao trabalhar em módulo novo ou refactor estrutural de módulo, use a skill [gestor-module-integration](../skills/gestor-module-integration/SKILL.md).
- Evite copiar exemplos de snippets sem conferir sintaxe, `isset($_REQUEST[...])`, terminadores `;` e correspondência entre `ajaxOpcao` e `$_GESTOR['ajax-opcao']`.
- Se um override privado resolver, mantenha a mudança no repositório privado em vez de empurrar para `conn2flow`.
- Depois da primeira edição substantiva, rode a menor validação capaz de falsificar a mudança antes de ampliar escopo.