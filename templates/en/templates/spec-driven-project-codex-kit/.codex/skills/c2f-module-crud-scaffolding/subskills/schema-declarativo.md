# Module declarative schema (`<modulo-id>.json`) — full recipe

Subskill of `c2f-module-crud-scaffolding`. Read it when creating or changing a module's JSON. The critical rules (natural key, resources under `resources/`) are also in the parent skill.

## Full reference schema

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
