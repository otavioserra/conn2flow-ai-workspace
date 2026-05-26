---
name: gestor-module-integration
description: Use quando criar, corrigir, revisar ou refatorar módulos do gestor em projetos privados Conn2Flow. Especialmente quando houver risco de esquecer modulo-id, JSON, função *_start(), autorun no final, switch($_GESTOR["opcao"]), switch($_GESTOR["ajax-opcao"]), resources, hooks, API ou widget.
user-invocable: false
---

# Integração de módulo do gestor

Use esta skill quando a tarefa não é apenas uma regra de negócio isolada, mas um ajuste estrutural em módulo do gestor.

## Quando usar

- criar módulo novo em `gestor/modulos/`
- corrigir módulo que responde parcialmente no runtime
- refatorar módulo com risco de quebrar bootstrap, interface ou AJAX
- revisar diff de módulo que parece funcional no arquivo, mas incompleto no gestor

## Procedimento

1. Releia um módulo simples e um módulo mais rico como referência antes da primeira edição.
2. Confirme o contrato estrutural do módulo: bootstrap, JSON, resources, pages, variables, hook, API, widget e função `*_start()` quando aplicável.
3. Se a tarefa tocar hook, API ou widget, inclua essas camadas na leitura e no diff, em vez de concluir pelo PHP principal sozinho.
4. Depois da primeira edição substantiva, valide no menor escopo capaz de falsificar a integração.
5. Se ainda houver dúvida estrutural, releia o fluxo do core do Conn2Flow que inclui o módulo e fecha interface ou AJAX antes de ampliar o diff.

## Erros comuns de snippet

- não use `$_REQUEST[$post_nome]` sem `isset()` ou `empty()`
- confirme se a chamada de banco de dados é a função correta (`banco_select`, `banco_update`, etc.)
- confirme strings PHP com `;` e modelos com tags corretas
- para AJAX, confirme o envio de `ajaxOpcao` e o tratamento em `$_GESTOR['ajax-opcao']`
- ao usar helpers de modelo, verifique consistência de `modelo_var_troca`, `modelo_var_troca_tudo`, `modelo_tag_val`, `modelo_tag_troca_val`, `modelo_var_in` e `modelo_tag_del`

## O que esta skill evita

- módulo com funções de negócio, mas sem `*_start()`
- branch normal sem `interface_iniciar()` e `interface_finalizar()`
- branch AJAX sem `interface_ajax_iniciar()` e `interface_ajax_finalizar()`
- JSON, pages ou variables incoerentes com o PHP e o HTML
- hooks, API ou widget esquecidos quando o módulo depende deles