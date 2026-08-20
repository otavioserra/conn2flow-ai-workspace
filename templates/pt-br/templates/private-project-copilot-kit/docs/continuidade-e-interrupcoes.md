# Continuidade e interrupções

## O que informar quando você alterar arquivos no meio do processo

Use uma mensagem curta e objetiva, por exemplo:

- Eu alterei manualmente `gestor/modulos/x/y.php`; releia esse arquivo e continue.
- Eu mudei a regra de negócio: agora isso precisa ficar apenas no privado.
- Eu já corrigi o HTML; agora ajuste só o JS e revalide.

## O que o agente costuma perceber bem

- O histórico da conversa atual.
- Arquivos explicitamente citados, anexados ou abertos na tarefa.
- Instructions, prompts, agents e skills carregados automaticamente.

## O que não convém assumir

- Que todo arquivo alterado manualmente será relido sem você mencionar.
- Que uma mudança de escopo implícita será inferida corretamente.
- Que o agente vai distinguir sozinho o que é private override e o que deve subir para o core, sem contexto suficiente.

## Regra de ouro

Se você mudou arquivos ou premissas, diga isso explicitamente e aponte o menor conjunto de arquivos que precisa ser relido.