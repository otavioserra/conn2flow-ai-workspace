# Leituras mínimas antes de editar módulo do gestor

## Sempre releia

- PHP principal do módulo alvo
- JSON principal do módulo alvo
- pages e variables do resources que a tela realmente consome

## Releia referências internas antes de copiar padrão

- um módulo simples do mesmo tipo
- um módulo mais rico com AJAX, callback, hooks ou API

Boas referências recorrentes neste repositório:

- um módulo simples do próprio projeto
- um módulo mais rico do próprio projeto
- se necessário, um módulo maduro no repositório base `conn2flow` ou em outro privado do ecossistema

## Se a tarefa for estrutural

- confirme como o core do Conn2Flow inclui o módulo e fecha o ciclo de interface/AJAX
- confira se existe dependência de hook, API, widget ou resource que não aparece no PHP principal

## Regra prática

Não copie só o miolo de negócio de outro módulo. Copie o ciclo estrutural que o gestor espera e adapte apenas o que for realmente específico do módulo alvo.