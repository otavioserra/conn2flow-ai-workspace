# Integração prática de módulos do gestor

## O erro clássico

Um módulo pode estar tecnicamente "feito" e ainda assim continuar desconectado do gestor. Isso acontece quando o agente entrega funções de negócio, mas não fecha o ciclo de integração que faz o gestor realmente carregar, rotear, renderizar e responder AJAX para esse módulo.

Em outras palavras: copiar o CRUD de outro módulo não basta se o bootstrap, o despacho e os contratos declarativos não vierem juntos.

## O ciclo completo de integração

### 1. Contrato declarativo do módulo

O módulo precisa de um JSON coerente com o nome da pasta e do arquivo principal. É nesse contrato que ficam pelo menos:

- bibliotecas necessárias
- tabela e chaves principais
- resources de pages, variables, layouts e componentes
- hooks opcionais
- metadados específicos do módulo

Se o JSON estiver incompleto ou incoerente, o PHP pode até rodar, mas o módulo continua sem parte da infraestrutura que o gestor espera.

### 2. Resources e páginas

O gestor resolve HTML, CSS e outros recursos a partir dos dados de páginas e do resources do módulo. Quando você cria ou altera páginas do módulo, precisa tratar isso como parte da integração, não como detalhe cosmético.

Na prática, isso significa:

- manter pages e resources alinhados
- manter variables do módulo coerentes com o que o HTML e o PHP consomem
- sincronizar os dados de resources quando a arquitetura do módulo mudar

### 3. Bootstrap no arquivo principal do módulo

No topo do arquivo principal, o módulo precisa se apresentar ao gestor. O mínimo estrutural costuma ser:

- definir $_GESTOR['modulo-id']
- carregar o JSON em $_GESTOR['modulo#'.$id]
- garantir que nomes de pasta, arquivo PHP, arquivo JSON, ids públicos e paths conversem entre si

Se esse bootstrap estiver errado, o resto do arquivo pode até existir, mas passa a operar em cima de um contexto quebrado.

### 4. Função start no final do módulo

Esse é o ponto que mais costuma faltar quando alguém pede "crie igual ao módulo X" e o agente entrega só as funções centrais.

A função start normalmente precisa fechar dois fluxos:

- fluxo AJAX
- fluxo de interface normal

O esqueleto mental é este:

```php
function modulo_start(){
    if($_GESTOR['ajax']){
        interface_ajax_iniciar();
        // switch de ajax-opcao
        interface_ajax_finalizar();
    } else {
        // traduções, js vars, interfaces padrões
        interface_iniciar();
        // switch de opcao
        interface_finalizar();
    }
}

modulo_start();
```

Se o módulo não chamar a função start no final, ou se o switch não despachar para as funções certas, a sensação para o usuário é exatamente esta: "o arquivo está lá, mas o gestor não integra".

### 5. Roteamento de interface

Para a interface normal, o módulo precisa despachar opções como listar, adicionar, editar, clonar, status, excluir ou callback, conforme o caso.

Também precisa preparar a interface que o core espera, por exemplo:

- interfaces padrões para listar
- definição de formulário em adicionar ou editar
- uso correto de interface_iniciar e interface_finalizar
- uso de $_GESTOR['modulo-registro-id'] quando a operação depende de um registro

Criar a função adicionar ou editar sem registrar esse despacho não integra o módulo. Só cria código morto ou incompleto.

### 6. Roteamento AJAX

Se o módulo tiver endpoints AJAX, eles também precisam entrar no ciclo completo:

- interface_ajax_iniciar
- switch($_GESTOR['ajax-opcao'])
- escrita de $_GESTOR['ajax-json'] ou resposta equivalente
- interface_ajax_finalizar

O erro recorrente aqui é criar funções AJAX válidas, mas nunca conectadas ao switch de ajax-opcao.

### 7. Hooks, API e widget são camadas extras

Dependendo do módulo, a integração pode exigir ainda:

- arquivo .hooks.php e declaracao correspondente no JSON
- hook de API para /_api/{modulo}/{action}
- arquivo .widget.php para renderização em páginas
- assets do módulo

Essas camadas são opcionais, mas quando o módulo depende delas, também fazem parte da integração estrutural.

## Checklist de módulo realmente integrado

- pasta, PHP principal e JSON usam o mesmo id lógico do módulo
- o PHP define $_GESTOR['modulo-id'] e carrega $_GESTOR['modulo#...']
- existe função start e ela é chamada no fim do arquivo
- o fluxo normal chama interface_iniciar e interface_finalizar
- o fluxo AJAX chama interface_ajax_iniciar e interface_ajax_finalizar
- o switch($_GESTOR['opcao']) contém todas as entradas que a navegação do módulo precisa
- o switch($_GESTOR['ajax-opcao']) contem todas as entradas AJAX reais do frontend
- pages, variables e outros resources do JSON cobrem as telas necessárias
- hooks, API ou widget foram declarados quando o módulo depende deles
- houve sincronização de resources e validação após a integração

## Sinais de que o módulo está desconectado

- existe função adicionar, editar ou callback, mas ninguém a chama
- existe AJAX no frontend, mas não existe caso correspondente em ajax-opcao
- o módulo depende de variáveis ou resources que não estão no JSON
- a tela abre, mas a interface não renderiza como módulo do gestor
- o agente criou a regra de negócio, mas esqueceu start, interfaces padrões ou resources
- o módulo responde em parte da navegação, mas não fecha o ciclo de listagem, formulário e callback

## Como pedir isso para o Copilot do jeito certo

Quando for criar ou ajustar um módulo, não peça apenas "copie o módulo X". Peça a integração completa como requisito explícito.

Exemplo de prompt melhor:

```md
Quero criar o módulo Y do gestor seguindo o padrão do módulo X.

Não copie só as funções de negócio. Entregue a integração completa do módulo:

- bootstrap com modulo-id e JSON
- função start no final do arquivo
- switch de $_GESTOR['opcao']
- switch de $_GESTOR['ajax-opcao'] se houver AJAX
- interfaces padrões e ciclo interface_iniciar/interface_finalizar
- resources e variables necessários no JSON
- hooks, API ou widget se o módulo depender disso

Antes de editar, releia um módulo simples e um módulo mais rico de referência.
Depois da primeira edição substantiva, valide no menor escopo possível.
```

Esse pedido muda completamente o tipo de entrega. Ele obriga o agente a tratar o módulo como módulo do gestor, não como arquivo PHP isolado.

## Quando isso vira skill

Sim, esse problema é um bom candidato a skill quando começa a se repetir.

Transforme em skill quando:

- você cria ou refatora módulos do gestor com frequência
- o mesmo erro estrutural volta em vários módulos
- o agente acerta a regra de negócio, mas erra o bootstrap do gestor

O que uma skill dessas deve obrigar:

- ler um módulo simples de referência
- ler um módulo rico com AJAX, callback ou hooks
- reler o JSON do módulo
- reler o trecho do core que inclui o módulo e fecha interface/AJAX
- usar um checklist de integração antes de concluir

## Regra final

No gestor, módulo funcional não é só "arquivo com funções". Módulo funcional é contrato declarativo, bootstrap, despacho, interface, AJAX e resources fechando o mesmo ciclo. Se uma dessas camadas ficar de fora, o módulo parece pronto no diff, mas continua incompleto em runtime.