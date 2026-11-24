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

## 📚 Subskills (read on demand)

| Subskill | Read when |
| --- | --- |
| [`subskills/schema-declarativo.md`](subskills/schema-declarativo.md) | creating or changing `<modulo-id>.json` (table, `natural_key`, pages and variables) |
| [`subskills/controller-escrita-e-historico.md`](subskills/controller-escrita-e-historico.md) | implementing `_adicionar()`, `_editar()` or `_clonar()` |

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

The JSON declares `versao`, `bibliotecas` (for example `interface`, `html`), the `tabela` mapping and the per-language `resources`. Full example: **`subskills/schema-declarativo.md`**.

- `tabela` names the control columns: `id` (slug), `id_numerico`, `status`, `versao`, `data_criacao`, `data_modificacao`.
- `tabela.config` uses `"strategy": "natural_key"` with `natural_key_columns` (`["language", "id"]`), `preserve_on_user_modified` and `insert_only`. Without the natural key, synchronization stops being deterministic.
- `resources.<lang>.pages` declares the four screens (`listar` with `root: true`, `adicionar`, `editar`, `clonar`) with `layout-administrativo-do-gestor` and `type: system`; `variables` declares the labels read by `gestor_variaveis()`.

---

## 3. PHP Controller Anatomy (`<modulo-id>.php`)

### 3.1. Initialization and Loading
```php
<?php

global $_GESTOR;

$_GESTOR['modulo-id']                      = 'meu-modulo';
$_GESTOR['modulo#'.$_GESTOR['modulo-id']] = json_decode(file_get_contents(__DIR__ . '/meu-modulo.json'), true);
```

### 3.2–3.4. Functions `_adicionar()`, `_editar()` and `_clonar()`

Full reference code: **`subskills/controller-escrita-e-historico.md`**. The mandatory minimum:

- **`_adicionar()`** (trigger `$_GESTOR['adicionar-banco']`): validates on the server with `interface_validacao_campos_obrigatorios()`, builds the slug with `banco_identificador()` filtered by `language='".$_GESTOR['linguagem-codigo']."'`, writes `id_usuarios`, `language`, status `A`, version `1` and `NOW()` dates through `banco_insert_name()`, then redirects to `editar/`. Repeats the validation on the frontend in `$_GESTOR['interface']['adicionar']['finalizar']`.
- **`_editar()`** (trigger `$_GESTOR['atualizar-banco']`): starts with `banco_select_campos_antes_iniciar()` (failure = `interface_alerta` + `gestor_redirecionar_raiz()`), compares each field with `banco_select_campos_antes()`, collects `$alteracoes`, rebuilds the slug with `id_valor` when the name changes (unless `_gestor-nao-alterar-id`), increments `versao`, writes `data_modificacao=NOW()` and calls `interface_historico_incluir(Array('alteracoes' => $alteracoes))`. Every query filters `status!='D'` and the language.
- **Rendering `_editar()`**: `banco_select_editar()`; no result means `gestor_redirecionar_raiz()`. Fills `metaDados` (dates, version, status) and the `adicionar`, `clonar`, `status` and `excluir` buttons in `$_GESTOR['interface']['editar']['finalizar']`.
- **`_clonar()`**: same logic as `_adicionar()`, loading the original record with `banco_select_editar()`.

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

The `interface` core reserves four `ajaxOpcao` values (`listar`, `verificar-campo`, `backup-campos-mudou`, `historico-mais-resultados`). Keep these values out of custom module endpoints and use module-specific actions such as `listar-itens`.
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
