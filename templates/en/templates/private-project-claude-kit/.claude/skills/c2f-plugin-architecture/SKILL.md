---
name: c2f-plugin-architecture
description: "READ BEFORE creating or packaging Conn2Flow ecosystem plugins. Prevents installation failures, collisions with core tables and incomplete uninstalls."
user-invocable: false
---

# Plugin Architecture and Lifecycle (`CONN2FLOW-PLUGIN-ARCHITECTURE.md`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Create, structure or test packages in `dev-plugins/` or `gestor/plugins/`.
- **SKIP ONLY IF**: Development of Core native resources or exclusive project customizations.
- **CONSEQUENCE OF IGNORING**: Plugins incompatible with the installer's lifecycle, orphan waste left in database after uninstalling and violating plugin isolation.

---

See and apply the following conventions when working with Conn2Flow plugins:

## 1. Plugin Directory Structure

Plugins reside under `dev-plugins/plugins/`:
- **Public**: `dev-plugins/plugins/public/<plugin-id>/`
- **Private**: `dev-plugins/plugins/private/<plugin-id>/`

Typical plugin structure:
```
dev-plugins/plugins/public/<plugin-id>/
├── plugin.json                 # Manifesto do plugin
├── modulos/                    # Módulos encapsulados pelo plugin
├── scripts/                    # Scripts de install, uninstall e release
└── resources/                  # Recursos específicos do plugin
```

---

## 2. Plugin Manifest (`plugin.json`)

```json
{
  "id": "meu-plugin",
  "nome": "Meu Plugin",
  "versao": "1.0.0",
  "tipo": "public",
  "modulos": ["modulo-a", "modulo-b"],
  "dependencias": []
}
```

---

## 3. Lifecycle and Installation (`_install` / `_uninstall`)

- **Installation (`_install.php`)**: Executes migrations Phinx plugin table, register hooks and sync features.
- **Uninstallation (`_uninstall.php`)**: Remove temporary data or disable records preserving user data if configured.

---

## 4. Build and Synchronization Tasks

- Plugin feature compilation: `php ./dev-plugins/plugins/public/scripts/resources/update-data-resources-plugin.php`.
- Local sync: `bash ./dev-plugins/plugins/public/scripts/dev/synchronizes.sh checksum`.
