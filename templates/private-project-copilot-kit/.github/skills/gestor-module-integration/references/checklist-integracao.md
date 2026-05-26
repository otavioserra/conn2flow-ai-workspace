# Checklist de integração do módulo

Use esta lista antes de concluir qualquer módulo novo ou refactor estrutural.

## Contrato mínimo

- pasta, PHP principal e JSON usam o mesmo id lógico
- `$_GESTOR['modulo-id']` está definido no topo
- `$_GESTOR['modulo#'.$id]` carrega o JSON correto
- pages, variables, layouts e components necessários existem no resources

## Fechamento do ciclo

- existe função `*_start()`
- a função `*_start()` é chamada no fim do arquivo
- a branch normal chama `interface_iniciar()` e `interface_finalizar()`
- a branch AJAX chama `interface_ajax_iniciar()` e `interface_ajax_finalizar()` quando houver endpoints AJAX

## Despacho

- `switch($_GESTOR['opcao'])` cobre a navegação real do módulo
- `switch($_GESTOR['ajax-opcao'])` cobre as chamadas AJAX reais do frontend
- a implementação não deixou funções relevantes sem nenhum ponto de entrada

## Camadas extras

- hooks declarados no JSON e implementados no arquivo correspondente
- API declarada e conectada quando o módulo expor endpoints
- widget declarado e implementado quando o módulo renderizar em páginas

## Sinais de módulo desconectado

- a tela abre, mas o módulo não fecha o ciclo de listagem ou formulário
- existe callback ou AJAX no frontend sem caso correspondente no switch
- o HTML depende de variables ou resources ausentes no JSON
- o diff parece grande, mas o runtime continua com comportamento parcial