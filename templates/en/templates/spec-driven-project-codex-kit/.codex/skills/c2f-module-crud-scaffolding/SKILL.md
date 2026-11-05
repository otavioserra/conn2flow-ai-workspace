---
name: c2f-module-crud-scaffolding
description: "READ BEFORE creating, structuring or refactoring administrative modules and CRUDs. Follows the canonical modulos-grupos pattern, audit history and deterministic synchronization."
user-invocable: false
---

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create a new folder in `modulos/` or `gestor/modulos/` containing controller `.php`, schema `.json`, script `.js` and `resources/`.
- **SKIP ONLY IF**: Small point adjustments in legacy modules without changing structure or life cycle.
- **CONSEQUENCE OF IGNORING**: Modules incompatible with route dispatcher, absence of natural key (`strategy: "natural_key"`), history snapshot failure (`banco_select_campos_antes_iniciar`) and audit loss.

---

# CRUD Canon Module Scaffolding in Conn2Flow

See and apply this architectural guide whenever you are creating or refactoring an administrative module in Conn2Flow. The reference canonical module is `gestor/modulos/modulos-grupos/`.

---

## 1. Default Directory and File Structure

Every administrative module shall be either `gestor/modulos/<modulo-id>/` or `modulos/<modulo-id>/` with the following mandatory composition:

```
modulos/<modulo-id>/
├── <modulo-id>.php         # Controller principal e dispatcher de ciclo de vida
├── <modulo-id>.json        # Schema declarativo: bibliotecas, tabela, natural_key e recursos
├── <modulo-id>.js          # Script JavaScript carregado pelo módulo no frontend
├── cover.webp              # [Obrigatório] Capa 3D conceitual gerada via c2f-module-visual-assets
└── resources/
    ├── pt-br/
    │   ├── pages/
    │   │   ├── <modulo-id>/                     # Tela de listagem (opcao=listar)
    │   │   ├── <modulo-id>-adicionar/           # Tela de inserção (opcao=adicionar)
    │   │   ├── <modulo-id>-editar/              # Tela de edição (opcao=editar)
    │   │   └── <modulo-id>-clonar/              # Tela de clonagem (opcao=clonar)
    │   └── variables.json                       # Variáveis e labels multilíngues pt-br
    └── en/
        ├── pages/ ...
        └── variables.json                       # Variáveis e labels multilíngues en
```

### 1.1 Visual Identity and Mandatory Cover (`c2f-module-visual-assets`)

All new administrative module MUST be born with its standardized 3D conceptual cover, strictly following the guidelines of skill `c2f-module-visual-assets`:
- **Aesthetic Pattern**: 3D isometric, deep blue background midnight, cyan/violet accents, ground glass and smooth ceramic (Design System V3.0). No text, no numbers or logos.
- **Format and Resolution**: WebP 1024×1024 px (proportion 1:1), quality 90, method 6, maximum weight < 120 KB (target: 60 KB to 95 KB).
- **Canon Storage**: `gestor/assets/modulos/covers/<modulo-id>.webp` file (and optionally mirrored at the module root as `modulos/<modulo-id>/cover.webp`).
- **Mandatory Register in Manifesto**: Every new cover must be registered in `gestor/assets/modulos/covers/manifest.json` with `id`, `width`, `height`, `bytes` and hash `sha256` before the human acceptance module.

---

## 2. Declarative Schema (`<modulo-id>.json`)

The JSON file defines library dependencies, ORM/table mapping and resource metadata:

```json
{
    "versao": "1.0.0",
    "bibliotecas": [
        "interface",
        "html"
    ],
    "tabela": {
        "nome": "meu_modulo_tabela",
        "id": "id",
        "id_numerico": "id_meu_modulo_tabela",
        "status": "status",
        "versao": "versao",
        "data_criacao": "data_criacao",
        "data_modificacao": "data_modificacao",
        "config": {
            "strategy": "natural_key",
            "natural_key_columns": [
                "language",
                "id"
            ],
            "preserve_on_user_modified": [],
            "insert_only": false
        },
        "deletar": []
    },
    "resources": {
        "pt-br": {
            "layouts": [],
            "pages": [
                {
                    "name": "Meu Módulo",
                    "id": "meu-modulo",
                    "layout": "layout-administrativo-do-gestor",
                    "path": "meu-modulo/",
                    "type": "system",
                    "option": "listar",
                    "root": true
                },
                {
                    "name": "Meu Módulo - Adicionar",
                    "id": "meu-modulo-adicionar",
                    "layout": "layout-administrativo-do-gestor",
                    "path": "meu-modulo/adicionar/",
                    "type": "system",
                    "option": "adicionar"
                },
                {
                    "name": "Meu Módulo - Editar",
                    "id": "meu-modulo-editar",
                    "layout": "layout-administrativo-do-gestor",
                    "path": "meu-modulo/editar/",
                    "type": "system",
                    "option": "editar"
                },
                {
                    "name": "Meu Módulo - Clonar",
                    "id": "meu-modulo-clonar",
                    "layout": "layout-administrativo-do-gestor",
                    "path": "meu-modulo/clonar/",
                    "type": "system",
                    "option": "clonar"
                }
            ],
            "components": [],
            "variables": [
                {
                    "id": "form-name-label",
                    "value": "Nome",
                    "type": "string"
                }
            ]
        }
    }
}
```

---

## 3. PHP Controller Anatomy (`<modulo-id>.php`)

### 3.1. Initialization and Loading
```php
<?php

global $_GESTOR;

$_GESTOR['modulo-id']                      = 'meu-modulo';
$_GESTOR['modulo#'.$_GESTOR['modulo-id']] = json_decode(file_get_contents(__DIR__ . '/meu-modulo.json'), true);
```

### 3.2. Function `_adicionar()`
```php
function meu_modulo_adicionar(){
    global $_GESTOR;
    
    $modulo = $_GESTOR['modulo#'.$_GESTOR['modulo-id']];
    
    // 1. Gravar registro no Banco
    if(isset($_GESTOR['adicionar-banco'])){
        $usuario = gestor_usuario();
        
        // Validação obrigatória
        interface_validacao_campos_obrigatorios(Array(
            'campos' => Array(
                Array(
                    'regra' => 'texto-obrigatorio',
                    'campo' => 'nome',
                    'label' => gestor_variaveis(Array('modulo' => $_GESTOR['modulo-id'], 'id' => 'form-name-label')),
                )
            )
        ));
        
        // Geração da Chave Natural
        $id = banco_identificador(Array(
            'id' => banco_escape_field($_REQUEST["nome"]),
            'tabela' => Array(
                'nome' => $modulo['tabela']['nome'],
                'campo' => $modulo['tabela']['id'],
                'id_nome' => $modulo['tabela']['id_numerico'],
                'where' => "language='".$_GESTOR['linguagem-codigo']."'",
            ),
        ));
        
        // Montagem dos Campos
        $campos = null;
        $campo_sem_aspas_simples = false;
        
        $campos[] = Array("id_usuarios", $usuario['id_usuarios'], $campo_sem_aspas_simples);
        $campos[] = Array("nome", banco_escape_field($_REQUEST["nome"]), $campo_sem_aspas_simples);
        $campos[] = Array("id", $id, $campo_sem_aspas_simples);
        
        // Campos de Controle Padrão
        $campos[] = Array('language', $_GESTOR['linguagem-codigo'], $campo_sem_aspas_simples);
        $campos[] = Array($modulo['tabela']['status'], 'A', $campo_sem_aspas_simples);
        $campos[] = Array($modulo['tabela']['versao'], '1', $campo_sem_aspas_simples);
        $campos[] = Array($modulo['tabela']['data_criacao'], 'NOW()', true);
        $campos[] = Array($modulo['tabela']['data_modificacao'], 'NOW()', true);
        
        banco_insert_name($campos, $modulo['tabela']['nome']);
        
        gestor_redirecionar($_GESTOR['modulo-id'].'/editar/?'.$modulo['tabela']['id'].'='.$id);
    }
    
    // 2. Inclusão de JS e Validações no Frontend
    gestor_pagina_javascript_incluir();
    
    $_GESTOR['interface']['adicionar']['finalizar'] = Array(
        'formulario' => Array(
            'validacao' => Array(
                Array(
                    'regra' => 'texto-obrigatorio',
                    'campo' => 'nome',
                    'label' => gestor_variaveis(Array('modulo' => $_GESTOR['modulo-id'], 'id' => 'form-name-label')),
                )
            )
        )
    );
}
```

### 3.3. Function `_editar()`
```php
function meu_modulo_editar(){
    global $_GESTOR;
    
    $modulo = $_GESTOR['modulo#'.$_GESTOR['modulo-id']];
    $id = $_GESTOR['modulo-registro-id'];
    
    $camposBanco = Array('nome');
    $camposBancoPadrao = Array(
        $modulo['tabela']['status'],
        $modulo['tabela']['versao'],
        $modulo['tabela']['data_criacao'],
        $modulo['tabela']['data_modificacao'],
    );
    $camposBancoEditar = array_merge($camposBanco, $camposBancoPadrao);
    $camposBancoAntes = $camposBanco;
    
    // 1. Gravar Atualizações no Banco
    if(isset($_GESTOR['atualizar-banco'])){
        // Snapshot de dados anteriores
        if(!banco_select_campos_antes_iniciar(
            banco_campos_virgulas($camposBancoAntes),
            $modulo['tabela']['nome'],
            "WHERE ".$modulo['tabela']['id']."='".$id."' AND ".$modulo['tabela']['status']."!='D'"
        )){
            interface_alerta(Array(
                'redirect' => true,
                'msg' => gestor_variaveis(Array('modulo' => 'interface', 'id' => 'alert-database-field-before-error'))
            ));
            gestor_redirecionar_raiz();
        }
        
        // Validação obrigatória
        interface_validacao_campos_obrigatorios(Array(
            'campos' => Array(
                Array(
                    'regra' => 'texto-obrigatorio',
                    'campo' => 'nome',
                    'label' => gestor_variaveis(Array('modulo' => $_GESTOR['modulo-id'], 'id' => 'form-name-label')),
                )
            )
        ));
        
        $editar = Array(
            'tabela' => $modulo['tabela']['nome'],
            'extra' => "WHERE ".$modulo['tabela']['id']."='".$id."' AND ".$modulo['tabela']['status']."!='D' AND language='".$_GESTOR['linguagem-codigo']."'",
        );
        $alteracoes = [];
        
        // Comparação e Atualização de Campos
        if(banco_select_campos_antes('nome') != (isset($_REQUEST['nome']) ? $_REQUEST['nome'] : NULL)){
            $editar['dados'][] = "nome='" . banco_escape_field($_REQUEST['nome']) . "'";
            if(!isset($_REQUEST['_gestor-nao-alterar-id'])){ $alterar_id = true; }
            $alteracoes[] = Array('campo' => 'form-name-label', 'valor_antes' => banco_select_campos_antes('nome'), 'valor_depois' => banco_escape_field($_REQUEST['nome']));
        }
        
        // Se mudou o nome, atualizar slug identificador natural
        if(isset($alterar_id)){
            $id_novo = banco_identificador(Array(
                'id' => banco_escape_field($_REQUEST["nome"]),
                'tabela' => Array(
                    'nome' => $modulo['tabela']['nome'],
                    'campo' => $modulo['tabela']['id'],
                    'id_nome' => $modulo['tabela']['id_numerico'],
                    'id_valor' => interface_modulo_variavel_valor(Array('variavel' => $modulo['tabela']['id_numerico'])),
                    'where' => "language='".$_GESTOR['linguagem-codigo']."'",
                ),
            ));
            $alteracoes[] = Array('campo' => 'field-id', 'valor_antes' => $id, 'valor_depois' => $id_novo);
            $editar['dados'][] = $modulo['tabela']['id']."='" . $id_novo . "'";
            $_GESTOR['modulo-registro-id'] = $id_novo;
        }
        
        // Executar Update e Salvar Histórico
        if(isset($editar['dados'])){
            $editar['dados'][] = $modulo['tabela']['versao']." = ".$modulo['tabela']['versao']." + 1";
            $editar['dados'][] = $modulo['tabela']['data_modificacao']."=NOW()";
            
            banco_update(banco_campos_virgulas($editar['dados']), $editar['tabela'], $editar['extra']);
            interface_historico_incluir(Array('alteracoes' => $alteracoes));
        }
        
        gestor_redirecionar($_GESTOR['modulo-id'].'/editar/?'.$modulo['tabela']['id'].'='.(isset($id_novo) ? $id_novo : $id));
    }
    
    // 2. Renderização da Interface
    gestor_pagina_javascript_incluir();
    
    $retorno_bd = banco_select_editar(
        banco_campos_virgulas($camposBancoEditar),
        $modulo['tabela']['nome'],
        "WHERE ".$modulo['tabela']['id']."='".$id."' AND ".$modulo['tabela']['status']."!='D' AND language='".$_GESTOR['linguagem-codigo']."'"
    );
    
    if($_GESTOR['banco-resultado']){
        $nome = (isset($retorno_bd['nome']) ? $retorno_bd['nome'] : '');
        $_GESTOR['pagina'] = modelo_var_troca_tudo($_GESTOR['pagina'], '#nome#', $nome);
        
        // Metadados Laterais
        $status_atual = $retorno_bd[$modulo['tabela']['status']];
        if(isset($retorno_bd[$modulo['tabela']['data_criacao']])){ $metaDados[] = Array('titulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-date-start')),'dado' => interface_formatar_dado(Array('dado' => $retorno_bd[$modulo['tabela']['data_criacao']], 'formato' => 'dataHora'))); }
        if(isset($retorno_bd[$modulo['tabela']['data_modificacao']])){ $metaDados[] = Array('titulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-date-modification')),'dado' => interface_formatar_dado(Array('dado' => $retorno_bd[$modulo['tabela']['data_modificacao']], 'formato' => 'dataHora'))); }
        if(isset($retorno_bd[$modulo['tabela']['versao']])){ $metaDados[] = Array('titulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-version')),'dado' => $retorno_bd[$modulo['tabela']['versao']]); }
        if(isset($retorno_bd[$modulo['tabela']['status']])){ $metaDados[] = Array('titulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-status')),'dado' => ($status_atual == 'A' ? '<div class="ui center aligned green message"><b>'.gestor_variaveis(Array('modulo' => 'interface','id' => 'field-status-active')).'</b></div>' : '<div class="ui center aligned brown message"><b>'.gestor_variaveis(Array('modulo' => 'interface','id' => 'field-status-inactive')).'</b></div>')); }
    } else {
        gestor_redirecionar_raiz();
    }
    
    // Finalizar Interface Editar
    $_GESTOR['interface']['editar']['finalizar'] = Array(
        'id' => $id,
        'metaDados' => $metaDados,
        'banco' => Array(
            'nome' => $modulo['tabela']['nome'],
            'id' => $modulo['tabela']['id'],
            'status' => $modulo['tabela']['status'],
        ),
        'botoes' => Array(
            'adicionar' => Array('url' => $_GESTOR['url-raiz'].$_GESTOR['modulo-id'].'/adicionar/', 'rotulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-insert')), 'icon' => 'plus circle', 'cor' => 'blue'),
            'clonar' => Array('url' => $_GESTOR['url-raiz'].$_GESTOR['modulo-id'].'/clonar/?'.$modulo['tabela']['id'].'='.$id, 'rotulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-clone')), 'icon' => 'clone', 'cor' => 'teal'),
            'status' => Array('url' => $_GESTOR['url-raiz'].$_GESTOR['modulo-id'].'/?opcao=status&'.$modulo['tabela']['status'].'='.($status_atual == 'A' ? 'I' : 'A').'&'.$modulo['tabela']['id'].'='.$id.'&redirect='.urlencode($_GESTOR['modulo-id'].'/editar/?'.$modulo['tabela']['id'].'='.$id), 'rotulo' => ($status_atual == 'A' ? gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-desactive')) : gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-active'))), 'icon' => ($status_atual == 'A' ? 'eye' : 'eye slash'), 'cor' => ($status_atual == 'A' ? 'green' : 'brown')),
            'excluir' => Array('url' => $_GESTOR['url-raiz'].$_GESTOR['modulo-id'].'/?opcao=excluir&'.$modulo['tabela']['id'].'='.$id, 'rotulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-delete')), 'icon' => 'trash alternate', 'cor' => 'red'),
        ),
        'formulario' => Array(
            'validacao' => Array(
                Array('regra' => 'texto-obrigatorio', 'campo' => 'nome', 'label' => gestor_variaveis(Array('modulo' => $_GESTOR['modulo-id'],'id' => 'form-name-label'))),
            )
        )
    );
}
```

### 3.4. Function `_clonar()`
It follows the same logic as `_adicionar()`, recovering the values of the original record via `banco_select_editar()` and populating the fields in the form.

### 3.5. Function `_interfaces_padroes()` (List Configuration)
```php
function meu_modulo_interfaces_padroes(){
    global $_GESTOR;
    
    $modulo = $_GESTOR['modulo#'.$_GESTOR['modulo-id']];
    
    switch($_GESTOR['opcao']){
        case 'listar':
            $_GESTOR['interface'][$_GESTOR['opcao']]['finalizar'] = Array(
                'banco' => Array(
                    'nome' => $modulo['tabela']['nome'],
                    'campos' => Array('nome', $modulo['tabela']['data_criacao'], $modulo['tabela']['data_modificacao']),
                    'id' => $modulo['tabela']['id'],
                    'status' => $modulo['tabela']['status'],
                    'where' => 'language="'.$_GESTOR['linguagem-codigo'].'"',
                ),
                'tabela' => Array(
                    'rodape' => true,
                    'colunas' => Array(
                        Array('id' => 'nome', 'nome' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-name')), 'ordenar' => 'asc'),
                        Array('id' => $modulo['tabela']['data_criacao'], 'nome' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-date-start')), 'formatar' => 'dataHora', 'nao_procurar' => true),
                        Array('id' => $modulo['tabela']['data_modificacao'], 'nome' => gestor_variaveis(Array('modulo' => 'interface','id' => 'field-date-modification')), 'formatar' => 'dataHora', 'nao_procurar' => true),
                    ),
                ),
                'opcoes' => Array(
                    'editar' => Array('url' => 'editar/', 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-edit')), 'icon' => 'edit', 'cor' => 'basic blue'),
                    'clonar' => Array('url' => 'clonar/', 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-clone')), 'icon' => 'clone', 'cor' => 'basic teal'),
                    'ativar' => Array('opcao' => 'status', 'status_atual' => 'I', 'status_mudar' => 'A', 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-active')), 'icon' => 'eye slash', 'cor' => 'basic brown'),
                    'desativar' => Array('opcao' => 'status', 'status_atual' => 'A', 'status_mudar' => 'I', 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-desactive')), 'icon' => 'eye', 'cor' => 'basic green'),
                    'excluir' => Array('opcao' => 'excluir', 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-delete')), 'icon' => 'trash alternate', 'cor' => 'basic red'),
                ),
                'botoes' => Array(
                    'adicionar' => Array('url' => 'adicionar/', 'rotulo' => gestor_variaveis(Array('modulo' => 'interface','id' => 'label-button-insert')), 'tooltip' => gestor_variaveis(Array('modulo' => 'interface','id' => 'tooltip-button-insert')), 'icon' => 'plus circle', 'cor' => 'blue'),
                ),
            );
        break;
    }
}
```

### 3.6. Dispatcher Central `_start()`
```php
function meu_modulo_start(){
    global $_GESTOR;
    
    gestor_incluir_bibliotecas();
    
    if($_GESTOR['ajax']){
        interface_ajax_iniciar();
        
        switch($_GESTOR['ajax-opcao']){
            // case 'minha-acao': meu_modulo_ajax_acao(); break;
        }
        
        interface_ajax_finalizar();
    } else {
        meu_modulo_interfaces_padroes();
        
        interface_iniciar();
        
        switch($_GESTOR['opcao']){
            case 'adicionar': meu_modulo_adicionar(); break;
            case 'editar': meu_modulo_editar(); break;
            case 'clonar': meu_modulo_clonar(); break;
        }
        
        interface_finalizar();
    }
}

meu_modulo_start();
```

---

## 4. Engineering Mandatory Rules

1. **Forbidden Hardcode of Texts**: Any label, title, tooltip or alert message must come from `gestor_variaveis(...)` (see `c2f-variables-system`).
2. **No loose HTML**: All screens must reside in the `resources/<lang>/pages/` resource system (see `c2f-resources-system`).
3. **Always Use Natural Key**: Generate slugs and IDs with `banco_identificador()` ensuring uniqueness by language (`language = $_GESTOR['linguagem-codigo']`).
4. **Always Use Edit Snapshot**: All Edit Recording MUST start with `banco_select_campos_antes_iniciar()` and log in with `interface_historico_incluir()`.
