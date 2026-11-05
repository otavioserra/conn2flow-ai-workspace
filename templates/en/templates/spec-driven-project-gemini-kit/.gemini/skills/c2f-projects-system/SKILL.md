---
name: c2f-projects-system
description: "READ BEFORE synchronizing, compiling or deploying projects such as conn2flow-site or lumix. Prevents incorrect Core overrides, mixed tenant data and deployment failures."
user-invocable: false
---

# Projects and Deploy System (`CONN2FLOW-SISTEMA-PROJETOS.md`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Run projects synchronization commands (`deploy-project-v2.sh`, `sync-project-to-core`, etc.) or configure `environment.json`.
- **SKIP ONLY IF**: Isolated development in Conn2Flow Core without associated projects.
- **CONSEQUENCE OF IGNORING**: Accidental overwriting of Core code by project files, inconsistency of paths in `environment.json` and deploy errors in production.

---

See and apply the following conventions when managing the projects architecture and the deploy pipeline in Conn2Flow:

## 1. Deploy System Architecture

- **API Endpoint**: `/api/project/update` (Receive ZIP packages via `multipart/form-data`).
- **Authentication**: OAuth 2.0 with automatic token renewal via `refresh_token`.
- **Safe Inline Run**: Deploy extracts the files directly from the root (`$_GESTOR['ROOT_PATH']`) and executes `atualizacoes-banco-de-dados.php` by direct `include` (avoiding `shell_exec` disabled in production).
- **Audit Logs**: Registered in `/logs/atualizacoes/YYYYMMDD.log` and table `atualizacoes_execucoes`.

---

## 2. Credential Configuration (`environment.json`)

project root credentials and environment file:
```json
{
  "api_url": "https://api.conn2flow.com",
  "oauth": {
    "client_id": "SEU_CLIENT_ID",
    "client_secret": "SEU_CLIENT_SECRET",
    "access_token": "SEU_ACCESS_TOKEN",
    "refresh_token": "SEU_REFRESH_TOKEN"
  },
  "project": {
    "id": "conn2flow-gestor",
    "version": "1.0.0"
  }
}
```

---

## 3. Key Projects Automation Scripts

* **`compactar-projeto.sh`**: Compact project into ZIP and upload to the server API. If you receive HTTP 401, renew the token automatically and resend.
* **`renovar-token.sh`**: Validate `access_token` and renew via OAuth using `refresh_token`, updating `environment.json`.
* **`teste-integracao.sh`**: Run the suite of 6 integration tests (configuration, structure, feature update, compression, OAuth and API connectivity).

---

## 4. Operation Pipeline

1. **Local Resource Update**: Run the local resource build before packing.
2. **Deploy execution**:
   ```bash
   cd /caminho/do/projeto
   ./ai-workspace/scripts/projects/compactar-projeto.sh
   ```
3. **Server Automatic Flow**:
   - Validate OAuth → Extract ZIP into the root → Run the database upsert inline → Clean temporary files → Write the log.

---

## 5. Sitemap Indexation Rules (`sitemap.php`)

The `sitemap.php` generator automatically includes all active pages with `sem_permissao = 1` (`without_permission: true`) filtered by the `sitemap_caminho_nao_indexavel()` function.

### 5.1 Auto Deleted Routes from Sitemap

The following are **excluded** from the sitemap:
- **Transactional outcomes**: `success`, `error`, `cancel`, `cancelled`, `confirmation`
- **Transactional step suffixes**: `.../payment`, `.../checkout`, `.../download`
- **Purchase flow routes**: `cart`, `checkout`, `*-checkout`
- **Seed pages**: Template pages that originate daughter dynamic routes (must have `without_permission` unmarked in the seed)

### 5.2 Normative Guideline for Index Control

1. **Sitemap Public Page Removal**:
   - Uncheck the `sem_permissao` option in the registration of the page in Gestor, OR
   - Apply one of the standard non-indexable suffixes or paths.
2. **Post-Deploy Mandatory Validation**:
   - Always audit the public exit of the sitemap to make sure that checkout, error or confirmation routes are not displayed for indexing:
   ```bash
   curl -s https://<dominio>/sitemap.xml | grep -E 'checkout|success|cancel|error'
   ```
   *(The output should be empty). *

> [!WARNING]
> Index checkout pages or transactional outcomes exposes error screens or incomplete forms to search robots (SEO), generating ghost traffic and potential 400/500 errors in monitoring.

