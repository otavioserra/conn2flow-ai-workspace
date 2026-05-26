# Integração prática de módulos do gestor

## O erro clássico

O módulo pode parecer pronto no diff e ainda assim continuar desconectado do runtime do gestor. Isso acontece quando a regra de negócio existe, mas o contrato estrutural do módulo não fecha o ciclo completo.

## Checklist mínimo

- pasta, PHP principal e JSON usam o mesmo id lógico do módulo
- o PHP define `$_GESTOR['modulo-id']` e carrega o JSON correspondente
- existe função `*_start()` e ela é chamada no fim do arquivo
- o fluxo normal chama `interface_iniciar()` e `interface_finalizar()`
- o fluxo AJAX chama `interface_ajax_iniciar()` e `interface_ajax_finalizar()`
- `switch($_GESTOR['opcao'])` cobre a navegação real do módulo
- `switch($_GESTOR['ajax-opcao'])` cobre as entradas AJAX reais do frontend
- `pages`, `variables` e outros resources do JSON cobrem as telas necessárias
- hook, API ou widget foram declarados quando o módulo depende deles

## Regra prática

Quando for criar ou ajustar um módulo, não peça apenas para copiar um módulo parecido. Peça a integração completa do módulo: bootstrap, JSON, `*_start()`, dispatch, resources, hook, API, widget e validação mínima logo após a primeira edição estrutural.