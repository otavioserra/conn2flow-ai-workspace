# Casos de uso operacionais do workflow

## Mapa mental rápido

- Prompt inicia um fluxo reutilizável.
- Agent define a postura da execução.
- Skill carrega um runbook recorrente.
- Hook injeta um lembrete pequeno e determinístico.
- Handoff troca de etapa com aprovação humana no meio.
- Subagente serve para delegação curta e focada.

Se você misturar essas peças sem um critério simples, o resultado vira contexto espalhado. O objetivo do kit é justamente evitar isso.

## Quando usar cada entrada

### 1. Nova demanda no projeto privado

Use /private-project-kickoff quando você tiver uma demanda nova ou quando ainda não estiver claro se a mudança pertence ao privado, ao core ou aos dois.

Informe, sempre que possível:

- comportamento atual
- comportamento esperado
- arquivo, módulo, rota, tela ou erro mais concreto que existir
- se você suspeita que é override privado ou regra genérica

Exemplo:

```md
/private-project-kickoff
Corrigir o fluxo de callback do módulo social-connections. Hoje a autorização volta para a tela errada. Suspeito que a mudança fique só no privado. Releia primeiro o módulo e o hook correspondente.
```

### 2. Retomada depois de pausa

Use /continue-private-work quando a tarefa já estava em andamento e você quer recuperar o contexto sem recomeçar a investigação inteira.

O dado mais importante aqui não é repetir a tarefa inteira. O dado mais importante é dizer o que mudou desde a última rodada.

Exemplo:

```md
/continue-private-work
Eu alterei manualmente o PHP principal e o JSON do módulo. Releia esses arquivos antes de continuar. Agora preciso fechar a parte de callback e revalidar.
```

### 3. Review antes de fechar a tarefa

Use /review-private-work quando a implementação já existe e o que você quer agora é um review findings-first, com foco em bug, regressão, validação faltante e escopo errado.

Exemplo:

```md
/review-private-work
Revise as mudanças atuais no módulo de gateways. Quero foco em regressão, falta de integração com interface do gestor e validação ausente.
```

### 4. Mudança pequena e já ancorada

Se você já sabe exatamente o arquivo e o comportamento, não precisa transformar tudo em cerimônia. Pode pedir a mudança de forma direta, desde que forneça a âncora certa.

Exemplo:

```md
Ajuste o módulo de gateways para não permitir marcar mais de um gateway como padrão. Valide no menor escopo possível.
```

### 5. Decisão entre privado e core

Quando a sua dúvida principal for de escopo, o fluxo certo ainda é o kickoff. O coordenador foi desenhado para chamar a skill de contexto privado e decidir se a mudança deve ficar só no privado, subir para o core, ou ser dividida.

Não vale a pena pedir implementação primeiro quando a divisão entre privado e core ainda está nebulosa. Isso costuma gerar diff no lugar errado.

### 6. Validação local, Docker, logs, JWT, Phinx

Quando a etapa dominante da tarefa for ambiente ou validação operacional, peça explicitamente uso da skill local-validation.

Exemplo:

```md
Use a skill local-validation para validar este ajuste no ambiente local. Quero token JWT, migração Phinx e leitura dos logs se algo falhar.
```

### 7. Pesquisa curta dentro da mesma tarefa

Use subagente quando quiser delegar uma busca curta, um mapeamento de arquivos ou uma revisão localizada sem trocar o fluxo principal.

Casos tipicos:

- levantar arquivos prováveis antes da implementação
- procurar padrões equivalentes em módulos semelhantes
- revisar riscos de regressão em uma área pequena

### 8. Repositório SDD em vez de projeto privado

Quando a tarefa estiver em um repositório com fluxo Spec-Driven Development, não use este kit privado como fluxo principal. Lá a unidade de trabalho é batch, ancorado em spec e validação incremental.

Regra pratica:

- projeto privado: comece pelo escopo entre privado e core
- projeto SDD: comece pelo spec, batch atual e checklist de validação

### 9. Escopo SDD dentro de projeto privado

Algumas frentes deste repositório podem operar com artefatos locais de SDD dentro de `project/`, como `00-START-HERE.md`, `01-WORKFLOW.md`, `implementation/BATCH-INDEX.md` e `validation/VALIDATION-CHECKLIST.md`.

Nesses casos:

- continue entrando pelo `/private-project-kickoff`
- peça releitura explícita dos artefatos locais
- trate `human-requests/` apenas como intake humano não normativo
- se a entrada vier só como pasta `human-requests/`, use `CURRENT.md`, depois `README.md`, depois o `.md` mais recente
- trate `antigo/` apenas como histórico
- mantenha spec, batches, reviews e validation coerentes

O objetivo aqui não é converter o repositório inteiro para SDD. O objetivo é respeitar o fluxo onde ele já existe.

## Como pensar em prompt, agent, skill e hook

### Prompt

Use quando você quer uma porta de entrada reutilizável para humanos.

Sinal de que deve virar prompt:

- você repete o mesmo tipo de abertura de tarefa
- a qualidade melhora quando a ordem das informações é sempre parecida

### Agent

Use quando a diferença principal está no comportamento esperado do agente, não no texto inicial.

Sinal de que deve virar agent:

- uma tarefa precisa sempre coordenar, outra sempre implementar, outra sempre revisar
- você quer handoffs claros entre etapas

### Skill

Use quando existe um runbook recorrente que o agente precisa carregar no momento certo.

Sinal de que deve virar skill:

- a tarefa exige uma checklist técnica repetível
- sem esse runbook o agente esquece uma etapa estrutural
- o mesmo erro volta em várias demandas parecidas

### Hook

Use quando o comportamento desejado é pequeno, automático e previsível.

Boa função para hook:

- lembrar de validar ao tocar certo path
- lembrar de reler arquivos sensíveis no início da sessão

Má função para hook:

- decidir arquitetura
- investigar regra de negócio
- substituir prompt, skill ou agent

## Casos praticos frequentes

### Bug privado em módulo existente

Entrada recomendada: /private-project-kickoff.

Objetivo: decidir escopo e implementar com validação curta.

### Ajuste genérico que provavelmente sobe para o core

Entrada recomendada: /private-project-kickoff, dizendo explicitamente que existe chance de mover parte para o core.

Objetivo: separar o que é reaproveitável do que é específico do projeto.

### Você mudou arquivo manualmente no meio da execução

Entrada recomendada: /continue-private-work.

Objetivo: obrigar releitura do diff humano antes de continuar.

### Você quer só um review técnico

Entrada recomendada: /review-private-work.

Objetivo: findings primeiro, resumo depois.

### Você quer criar módulo novo no gestor

Entrada recomendada: /private-project-kickoff ou pedido direto ancorado em um módulo de referência.

Objetivo: evitar que o agente entregue apenas funções isoladas e esqueça o bootstrap do módulo.

Se a mudança for estrutural, peça explicitamente uso da skill `gestor-module-integration`.

### Você quer transformar um erro recorrente em infraestrutura

Entrada recomendada: pedido direto para criar skill, instruction, prompt ou doc operacional.

Regra pratica:

- erro recorrente de processo -> skill ou instruction
- entrada humana recorrente -> prompt
- lembrete pequeno de sessão -> hook

## O que pedir para o agente em cada fase

### Para iniciar bem

```md
Leia primeiro o arquivo âncora e o equivalente mais próximo já funcional. Quero decidir o menor diff possível antes de editar.
```

### Para continuar sem perder o fio

```md
Releia estes arquivos antes de continuar. Eu alterei manualmente a regra de negócio e não quero que você parta do estado anterior.
```

### Para revisar bem

```md
Faça review findings-first. Priorize bug, regressão, risco de integração e validação faltante. Só depois resuma.
```

### Para forçar validação curta

```md
Depois da primeira edição substantiva, valide no menor escopo possível antes de continuar.
```

## Anti-padrões

- Pedir para copiar um módulo inteiro sem dizer qual parte é estrutural e qual parte é só regra de negócio.
- Pedir uma mudança no privado sem dizer que existe chance de tocar o core.
- Alterar arquivos manualmente e não avisar que eles precisam ser relidos.
- Usar hook para substituir raciocínio.
- Pedir review quando o que você quer na verdade é implementação adicional.

## Regra final

O kit não serve para aumentar cerimônia. Ele serve para reduzir ambiguidade. Se a tarefa é pequena, ancore bem e vá direto. Se a tarefa mistura escopo, implementação e review, use prompts, agents e skills para separar as etapas.