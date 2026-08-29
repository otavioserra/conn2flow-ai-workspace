import * as vscode from 'vscode';
import { ModesManager } from './modesManager';
import { ProjectsManager } from './projectsManager';
import { CustomActionsManager } from './customActionsManager';
import { LogFollowManager } from './logFollowManager';
import { AgentBridgeManager } from './agentBridgeManager';
import { TerminalModeManager } from './terminalModeManager';
import { SddViewModeManager } from './sddViewModeManager';
import { SddScopeManager } from './sddScopeManager';
import { GardeningManager } from './gardeningManager';

export class Conn2FlowTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly commandId?: string,
    public readonly iconName?: string | vscode.ThemeIcon,
    public readonly tooltipText?: string,
    public readonly children?: Conn2FlowTreeItem[],
    public readonly commandArgs?: any[],
    public readonly itemDescription?: string,
    public readonly itemId?: string
  ) {
    super(label, collapsibleState);

    this.tooltip = tooltipText || label;

    if (itemDescription) {
      this.description = itemDescription;
    }

    if (itemId) {
      this.id = itemId;
    }

    if (iconName) {
      if (typeof iconName === 'string') {
        this.iconPath = new vscode.ThemeIcon(iconName);
      } else {
        this.iconPath = iconName;
      }
    }

    if (commandId) {
      this.command = {
        command: commandId,
        title: label,
        arguments: commandArgs || []
      };
    }
  }
}

export class Conn2FlowTreeProvider implements vscode.TreeDataProvider<Conn2FlowTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<Conn2FlowTreeItem | undefined | null | void> =
    new vscode.EventEmitter<Conn2FlowTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Conn2FlowTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  private defaultCollapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Expanded;
  private stateVersion: number = 0;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  expandAll(): void {
    this.defaultCollapsibleState = vscode.TreeItemCollapsibleState.Expanded;
    this.stateVersion++;
    this.refresh();
  }

  collapseAll(): void {
    this.defaultCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    this.stateVersion++;
    this.refresh();
  }

  getTreeItem(element: Conn2FlowTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Conn2FlowTreeItem): Thenable<Conn2FlowTreeItem[]> {
    if (!element) {
      return Promise.resolve(this.getRootCategories());
    }
    if (element.children) {
      return Promise.resolve(element.children);
    }
    return Promise.resolve([]);
  }

  private getRootCategories(): Conn2FlowTreeItem[] {
    const modes = ModesManager.getCurrentModes();
    const isTriade = modes.topology === 'triade';
    const auto = modes.autonomy;

    const targetProject = ProjectsManager.getTargetProject();
    const customManifest = CustomActionsManager.getActionsManifest();
    const ver = this.stateVersion;

    const activeIcon = new vscode.ThemeIcon('pass-filled', new vscode.ThemeColor('testing.iconPassed'));
    const inactiveIcon = new vscode.ThemeIcon('circle-outline');

    const categories: Conn2FlowTreeItem[] = [
      new Conn2FlowTreeItem(
        '🎛️ Modos de Operação & Autonomia',
        this.defaultCollapsibleState,
        undefined,
        'settings-gear',
        'Controle visual da topologia de agentes e do nível de autonomia da esteira',
        [
          new Conn2FlowTreeItem(
            '🏛️ Tríade de Agentes (Arquiteto + Executor + Revisor)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setTriAgent',
            isTriade ? activeIcon : inactiveIcon,
            'Modo Enterprise: Revisor técnico dedicado inspeciona o código antes da homologação',
            undefined,
            undefined,
            isTriade ? '● ATIVO' : '',
            `mode-triade-${isTriade}-${ver}`
          ),
          new Conn2FlowTreeItem(
            '👥 Duplo Agente (Arquiteto + Executor)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setDoubleAgent',
            !isTriade ? activeIcon : inactiveIcon,
            'Modo Didático: Fluxo ágil ideal para aprendizado e tarefas rápidas',
            undefined,
            undefined,
            !isTriade ? '● ATIVO' : '',
            `mode-duplo-${!isTriade}-${ver}`
          ),
          new Conn2FlowTreeItem(
            '🛡️ Nível 1: Supervisionado',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setSupervised',
            auto === 'supervisionado' ? activeIcon : inactiveIcon,
            'Apenas edição e testes locais; sem commit ou deploy automático sem aval humano',
            undefined,
            undefined,
            auto === 'supervisionado' ? '● ATIVO' : '',
            `auto-sup-${auto === 'supervisionado'}-${ver}`
          ),
          new Conn2FlowTreeItem(
            '👁️ Nível 2: Autônomo Monitorado',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setMonitored',
            auto === 'autonomo_monitorado' ? activeIcon : inactiveIcon,
            'Executa esteira com Live Todo List na tela e deploy exclusivo no ambiente de teste',
            undefined,
            undefined,
            auto === 'autonomo_monitorado' ? '● ATIVO' : '',
            `auto-mon-${auto === 'autonomo_monitorado'}-${ver}`
          ),
          new Conn2FlowTreeItem(
            '🤖 Nível 3: Autônomo Headless',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setHeadless',
            auto === 'autonomo_headless' ? activeIcon : inactiveIcon,
            'Execução silenciosa em background via Git Worktrees e MCP Hub',
            undefined,
            undefined,
            auto === 'autonomo_headless' ? '● ATIVO' : '',
            `auto-head-${auto === 'autonomo_headless'}-${ver}`
          ),
          new Conn2FlowTreeItem(
            TerminalModeManager.isReuse ? '🔄 Terminal: Reutilizar Ativo (Clique p/ Novo)' : '➕ Terminal: Criar Novo (Clique p/ Reutilizar)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.terminal.toggleMode',
            TerminalModeManager.isReuse ? 'sync' : 'new-folder',
            TerminalModeManager.isReuse ? 'Reutiliza o mesmo terminal ativo para não poluir o painel. Clique para alternar.' : 'Abre um novo terminal separado para cada comando. Clique para alternar.',
            undefined,
            undefined,
            TerminalModeManager.isReuse ? '(Compartilhado)' : '(Dedicado)',
            `term-mode-${TerminalModeManager.isReuse}-${ver}`
          )
        ],
        undefined,
        undefined,
        `cat-modes-${this.defaultCollapsibleState}-${ver}`
      )
    ];

    // Se o projeto tiver ações customizadas locais (.c2f/actions.json), insere o acordeão Plug & Play!
    if (customManifest && customManifest.actions.length > 0) {
      const customItems = customManifest.actions.map(act => {
        const isFile = act.type === 'file';
        const cmdId = isFile ? 'conn2flow.custom.openFile' : 'conn2flow.custom.runTerminal';
        const cmdArg = isFile ? act.path : act.command;
        const icon = act.icon || (isFile ? 'file-code' : 'play');

        return new Conn2FlowTreeItem(
          act.label,
          vscode.TreeItemCollapsibleState.None,
          cmdId,
          icon,
          act.description || act.label,
          undefined,
          [cmdArg]
        );
      });

      // Botão para editar o manifesto na hora
      customItems.push(
        new Conn2FlowTreeItem(
          '⚙️ Editar Ações do Projeto (.c2f/actions.json)',
          vscode.TreeItemCollapsibleState.None,
          'conn2flow.custom.editManifest',
          'edit',
          'Abre o manifesto de ações customizadas locais para edição rápida'
        )
      );

      categories.push(
        new Conn2FlowTreeItem(
          `⭐ ${customManifest.title || 'Ações do Projeto'}`,
          this.defaultCollapsibleState,
          undefined,
          'star',
          'Ações e automações customizadas definidas no .c2f/actions.json deste projeto',
          customItems,
          undefined,
          undefined,
          `cat-custom-${this.defaultCollapsibleState}-${ver}`
        )
      );
    }

    categories.push(
      new Conn2FlowTreeItem(
        '🏛️ SDD & Governança Viva',
        this.defaultCollapsibleState,
        undefined,
        'shield',
        'Controle de especificações, navegador de intakes, lotes e relatórios SDD',
        [
          new Conn2FlowTreeItem(
            `🎯 Escopo: ${SddScopeManager.getScopeLabel()}`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.sdd.selectScope',
            'target',
            'Alterna o escopo de trabalho do SDD entre: Core do Sistema (conn2flow) e Projetos Satélites (transformamp, lumix, etc.)'
          ),
          new Conn2FlowTreeItem(
            `📄 Exibição: ${SddViewModeManager.label}`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.sdd.toggleViewMode',
            'split-horizontal',
            'Alterna modo de visualização entre: Ambos Lado a Lado, Apenas Renderizado (Preview), e Apenas Código-Fonte (Editor)'
          ),
          new Conn2FlowTreeItem(
            `🌿 Auto-Gardening: ${GardeningManager.isAutoGardeningEnabled() ? '🟢 ATIVO' : '⚪ Desativado'}`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.sdd.toggleAutoGardening',
            'sync',
            'Alterna o monitoramento automático de Memory Gardening para alertar quando a memória passar de 35KB / 100 linhas'
          ),
          new Conn2FlowTreeItem(
            `🧹 Executar Gardening (${GardeningManager.getMemoryHealth().label})`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.sdd.runGardening',
            'trash',
            'Executa c2f ai:prune-memories no terminal para verificar a conformidade da memória'
          ),
          new Conn2FlowTreeItem(
            '📝 Criar Requisição de Gardening (req-XXX)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.sdd.createGardeningRequest',
            'diff-added',
            'Gera automaticamente a próxima requisição normativa de Memory Gardening com template oficial e opção de ativar no CURRENT.md'
          ),
          new Conn2FlowTreeItem('Abrir CURRENT.md', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openCurrent', 'file-text', 'Abre a requisição SDD ativa no modo configurado'),
          new Conn2FlowTreeItem('Abrir SPEC.md', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openSpec', 'file-code', 'Abre a especificação normativa geral no modo configurado'),
          new Conn2FlowTreeItem('Abrir Checklist de Validação', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openChecklist', 'checklist', 'Abre o checklist de critérios de aceite e validação técnica'),
          new Conn2FlowTreeItem('📂 Navegar Requisições (human-requests/)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.browseRequests', 'folder-opened', 'Menu superior para pesquisar e abrir qualquer requisição normativa req-XXX.md'),
          new Conn2FlowTreeItem('📂 Navegar Registros de Lotes (implementation/)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.browseBatches', 'history', 'Menu superior para pesquisar e abrir qualquer relatório de lote batch-YYY.md'),
          new Conn2FlowTreeItem('📂 Navegar Decisões Arquiteturais (decisions/)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.browseDecisions', 'repo', 'Menu superior para pesquisar e abrir qualquer registro de decisão ADR'),
          new Conn2FlowTreeItem('📂 Navegar Handoffs de Agentes (handoffs/)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.browseHandoffs', 'repo-pull', 'Menu superior para pesquisar e abrir relatórios de handoff entre agentes')
        ],
        undefined,
        undefined,
        `cat-sdd-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '🤝 Ponte da Tríade (Disparo & Handoff)',
        this.defaultCollapsibleState,
        undefined,
        'organization',
        'Disparo autônomo, cópia de prompts e troca de bastão entre agentes',
        [
          new Conn2FlowTreeItem('🚀 Iniciar Claude Code (/goal)', vscode.TreeItemCollapsibleState.None, 'conn2flow.bridge.launchClaudeGoal', 'play-circle', 'Abre menu com opções para rodar Claude CLI ou copiar prompt direto para o chat do Claude no VS Code'),
          new Conn2FlowTreeItem('📋 Copiar Prompt do Executor (Clipboard)', vscode.TreeItemCollapsibleState.None, 'conn2flow.bridge.copyPrompt', 'clippy', 'Copia para a área de transferência o prompt formatado com regras SDD para colar em qualquer IA'),
          new Conn2FlowTreeItem('📥 Registrar Log do Terminal (Handoff)', vscode.TreeItemCollapsibleState.None, 'conn2flow.bridge.recordHandoff', 'repo-pull', 'Abre sdd/handoffs/CURRENT-HANDOFF.md para colar o log ou notas da tela'),
          new Conn2FlowTreeItem('📡 Sincronizar e Notificar Arquiteto', vscode.TreeItemCollapsibleState.None, 'conn2flow.bridge.notifyArchitect', 'cloud-upload', 'Comita e envia as evidências do lote para o repositório Git')
        ],
        undefined,
        undefined,
        `cat-bridge-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '🐳 Docker & Logs em Tempo Real',
        this.defaultCollapsibleState,
        undefined,
        'server',
        'Monitoramento e inspeção de containers Docker',
        [
          new Conn2FlowTreeItem('Status dos Containers', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.status', 'pulse', 'Executa docker ps no terminal integrado'),
          new Conn2FlowTreeItem(
            LogFollowManager.isApacheFollowing ? '🟢 Logs Apache (Ao Vivo - Clique p/ Parar)' : '▶️ Logs Apache (Follow)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.docker.logsApache',
            LogFollowManager.isApacheFollowing ? 'debug-stop' : 'output',
            LogFollowManager.isApacheFollowing ? 'Monitoramento ativo. Clique para parar (enviar Ctrl+C) e liberar o terminal' : 'Inicia o monitoramento contínuo dos logs do Apache'
          ),
          new Conn2FlowTreeItem(
            LogFollowManager.isPhpFollowing ? '🟢 Logs PHP (Ao Vivo - Clique p/ Parar)' : '▶️ Logs PHP (Follow)',
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.docker.logsPhp',
            LogFollowManager.isPhpFollowing ? 'debug-stop' : 'terminal',
            LogFollowManager.isPhpFollowing ? 'Monitoramento ativo. Clique para parar (enviar Ctrl+C) e liberar o terminal' : 'Inicia o monitoramento contínuo dos logs de erro do PHP'
          ),
          new Conn2FlowTreeItem('Limpar Logs PHP', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.truncatePhpLog', 'trash', 'Trunca o arquivo /var/log/php_errors.log dentro do container')
        ],
        undefined,
        undefined,
        `cat-docker-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '🛠️ Manager & Core (Sistema)',
        this.defaultCollapsibleState,
        undefined,
        'tools',
        'Comandos de compilação e pipeline do Core Framework',
        [
          new Conn2FlowTreeItem('Update All (Sistema Core)', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.updateAll', 'sync', 'Executa ./c2f manager:update-all (Atualiza recursos, arquivos e banco do sistema principal)'),
          new Conn2FlowTreeItem(`Sync Core -> Projeto [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.syncCoreTarget', 'arrow-right', `Sincroniza os arquivos atualizados do Core para a pasta do projeto ${targetProject}`),
          new Conn2FlowTreeItem(`Update All -> Projeto [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.updateAllTarget', 'refresh', `Executa o ciclo completo de 7 etapas (Core -> DB -> Recursos -> Testes -> CSS) para ${targetProject}`),
          new Conn2FlowTreeItem('Sync Resources (Local)', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.syncResources', 'file-submodule', 'Executa ./c2f resources:sync'),
          new Conn2FlowTreeItem(`CSS Rebuild [${targetProject || 'projeto'}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.cssRebuild', 'zap', 'Regenera o Tailwind CSS a partir do HTML do banco para o projeto ativo'),
          new Conn2FlowTreeItem(`CSS Audit [${targetProject || 'projeto'}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.cssAudit', 'search', 'Audita procedência de CSS e classes órfãs para o projeto ativo')
        ],
        undefined,
        undefined,
        `cat-manager-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '🗃️ Projetos & Environment',
        this.defaultCollapsibleState,
        undefined,
        'folder-library',
        `Gerenciamento de projetos satélites (Alvo ativo: ${targetProject})`,
        [
          new Conn2FlowTreeItem(
            `Alvo Ativo: ${targetProject}`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.projects.setTarget',
            'target',
            'Clique para alterar o projeto alvo padrão no environment.json'
          ),
          new Conn2FlowTreeItem(`Update All Projeto Alvo [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.updateAllTarget', 'refresh', `Executa a sincronização completa de 7 etapas para ${targetProject}`),
          new Conn2FlowTreeItem(`Deploy Projeto Alvo [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.deployTarget', 'rocket', `Executa deploy local ou remoto para ${targetProject}`),
          new Conn2FlowTreeItem(`Sync Core -> Projeto [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.syncCoreTarget', 'arrow-right', `Sincroniza os arquivos alterados no Core para o projeto ${targetProject}`),
          new Conn2FlowTreeItem(`Sync Arquivos -> Test Environment [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.syncFilesTarget', 'cloud-upload', `Sincroniza os arquivos de ${targetProject} diretamente para a pasta de testes sites/localhost/${targetProject}/`),
          new Conn2FlowTreeItem('Update All Escolhendo Projeto...', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.updateAllWithSelect', 'list-ordered', 'Escolha qualquer projeto do environment.json para rodar Update All'),
          new Conn2FlowTreeItem('Deploy de Outro Projeto...', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.deployOther', 'send', 'Escolha um projeto cadastrado no environment.json para deploy'),
          new Conn2FlowTreeItem('Novo Projeto Satélite (Wizard)', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.scaffoldNew', 'new-folder', 'Cria e registra novo projeto satélite com estrutura canônica'),
          new Conn2FlowTreeItem('Cadastrar Projeto Existente', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.registerExisting', 'plus', 'Cadastra um projeto existente no devProjects do environment.json'),
          new Conn2FlowTreeItem('Clonar Repositórios Oficiais...', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.cloneMissing', 'repo-clone', 'Verifica e clona repositórios faltantes da organização ao lado do workspace'),
          new Conn2FlowTreeItem('Sincronizar com Template Canônico', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.syncTemplate', 'diff-added', 'Garante que o environment.json tenha todas as chaves do template do core')
        ],
        undefined,
        undefined,
        `cat-projects-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '📚 AI Workspace Hub',
        this.defaultCollapsibleState,
        undefined,
        'circuit-board',
        'Ferramentas de IA, sincronização de skills e documentação',
        [
          new Conn2FlowTreeItem('Sincronizar Skills (ai:sync)', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.sync', 'extensions', 'Executa c2f ai:sync adaptado automaticamente ao seu terminal (Git Bash ou PowerShell)'),
          new Conn2FlowTreeItem('Distribuir Skills p/ Todos os Repos', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.syncAllRepos', 'repo-clone', 'Executa sync-all-repos.ps1 distribuindo as 36 skills para todos os repositórios adjacentes'),
          new Conn2FlowTreeItem('Abrir AGENTS.md', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.openAgents', 'person', 'Abre a convenção de agentes e papéis do ecossistema'),
          new Conn2FlowTreeItem('Abrir GEMINI.md', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.openGemini', 'sparkle', 'Abre a governança da Tríade de IAs do Google Antigravity')
        ],
        undefined,
        undefined,
        `cat-ai-${this.defaultCollapsibleState}-${ver}`
      ),
      new Conn2FlowTreeItem(
        '📖 Documentação Oficial & Guias',
        this.defaultCollapsibleState,
        undefined,
        'book',
        'Manuais de referência, guias de arquitetura e documentação completa do ecossistema',
        [
          new Conn2FlowTreeItem('Manual do Painel Dev Tools', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openDevToolsGuide', 'dashboard', 'Guia completo com todos os botões e recursos desta extensão'),
          new Conn2FlowTreeItem('Publicação no Marketplace VS Code', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openMarketplaceGuide', 'cloud-upload', 'Passo a passo oficial para publicar na loja da Microsoft'),
          new Conn2FlowTreeItem('Guia do Desenvolvedor Conn2Flow', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openDevGuide', 'mortar-board', 'Arquitetura, convenções e fluxo de desenvolvimento'),
          new Conn2FlowTreeItem('Guia de Governança SDD', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openSddGuide', 'law', 'Ciclo de vida de especificações, requisições e lotes'),
          new Conn2FlowTreeItem('Arquitetura Tailwind CSS (3 Camadas)', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openTailwindGuide', 'symbol-color', 'Regras das 3 camadas de estilos e compilação do Tailwind'),
          new Conn2FlowTreeItem('Guia de Ambiente Docker', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openDockerGuide', 'server', 'Topologia dos containers Apache, PHP, MySQL e phpMyAdmin'),
          new Conn2FlowTreeItem('Sistema de Recursos e Runtime SQL', vscode.TreeItemCollapsibleState.None, 'conn2flow.docs.openResourcesGuide', 'paintcan', 'Como o runtime serve HTML/CSS exclusivamente do banco de dados')
        ],
        undefined,
        undefined,
        `cat-docs-${this.defaultCollapsibleState}-${ver}`
      )
    );

    return categories;
  }
}
