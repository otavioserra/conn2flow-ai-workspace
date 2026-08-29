import * as vscode from 'vscode';
import { ModesManager } from './modesManager';
import { ProjectsManager } from './projectsManager';
import { CustomActionsManager } from './customActionsManager';

export class Conn2FlowTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly commandId?: string,
    public readonly iconName?: string,
    public readonly tooltipText?: string,
    public readonly children?: Conn2FlowTreeItem[],
    public readonly commandArgs?: any[]
  ) {
    super(label, collapsibleState);

    this.tooltip = tooltipText || label;

    if (iconName) {
      this.iconPath = new vscode.ThemeIcon(iconName);
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

  refresh(): void {
    this._onDidChangeTreeData.fire();
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

    const categories: Conn2FlowTreeItem[] = [
      new Conn2FlowTreeItem(
        '🎛️ Modos de Operação & Autonomia',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'settings-gear',
        'Controle visual da topologia de agentes e do nível de autonomia da esteira',
        [
          new Conn2FlowTreeItem(
            `${isTriade ? '✔ ' : ''}🏛️ Tríade de Agentes (Arquiteto + Executor + Revisor)`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setTriAgent',
            isTriade ? 'check' : 'organization',
            'Modo Enterprise: Revisor técnico dedicado inspeciona o código antes da homologação'
          ),
          new Conn2FlowTreeItem(
            `${!isTriade ? '✔ ' : ''}👥 Duplo Agente (Arquiteto + Executor)`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setDoubleAgent',
            !isTriade ? 'check' : 'person',
            'Modo Didático: Fluxo ágil ideal para aprendizado e tarefas rápidas'
          ),
          new Conn2FlowTreeItem(
            `${auto === 'supervisionado' ? '✔ ' : ''}🛡️ Nível 1: Supervisionado`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setSupervised',
            auto === 'supervisionado' ? 'check' : 'shield',
            'Apenas edição e testes locais; sem commit ou deploy automático sem aval humano'
          ),
          new Conn2FlowTreeItem(
            `${auto === 'autonomo_monitorado' ? '✔ ' : ''}👁️ Nível 2: Autônomo Monitorado`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setMonitored',
            auto === 'autonomo_monitorado' ? 'check' : 'eye',
            'Executa esteira com Live Todo List na tela e deploy exclusivo no ambiente de teste'
          ),
          new Conn2FlowTreeItem(
            `${auto === 'autonomo_headless' ? '✔ ' : ''}🤖 Nível 3: Autônomo Headless`,
            vscode.TreeItemCollapsibleState.None,
            'conn2flow.modes.setHeadless',
            auto === 'autonomo_headless' ? 'check' : 'robot',
            'Execução silenciosa em background via Git Worktrees e MCP Hub'
          )
        ]
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
          vscode.TreeItemCollapsibleState.Expanded,
          undefined,
          'star',
          'Ações e automações customizadas definidas no .c2f/actions.json deste projeto',
          customItems
        )
      );
    }

    categories.push(
      new Conn2FlowTreeItem(
        '🏛️ SDD & Governança Viva',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'shield',
        'Controle de especificações e requisitos SDD com renderização Markdown rica',
        [
          new Conn2FlowTreeItem('Abrir CURRENT.md (Preview)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openCurrent', 'file-text', 'Abre a requisição SDD ativa formatada via Preview'),
          new Conn2FlowTreeItem('Abrir SPEC.md (Preview)', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openSpec', 'file-code', 'Abre a especificação normativa geral formatada via Preview'),
          new Conn2FlowTreeItem('Abrir Checklist de Validação', vscode.TreeItemCollapsibleState.None, 'conn2flow.sdd.openChecklist', 'checklist', 'Abre o checklist de critérios de aceite e validação técnica')
        ]
      ),
      new Conn2FlowTreeItem(
        '🐳 Docker & Logs em Tempo Real',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'server',
        'Monitoramento e inspeção de containers Docker',
        [
          new Conn2FlowTreeItem('Status dos Containers', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.status', 'pulse', 'Executa docker ps no terminal integrado'),
          new Conn2FlowTreeItem('Logs Apache (Follow)', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.logsApache', 'output', 'Monitora os logs do Apache em tempo real'),
          new Conn2FlowTreeItem('Logs PHP (Follow)', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.logsPhp', 'terminal', 'Monitora o php_errors.log em tempo real'),
          new Conn2FlowTreeItem('Limpar Logs PHP', vscode.TreeItemCollapsibleState.None, 'conn2flow.docker.truncatePhpLog', 'trash', 'Limpa o arquivo php_errors.log dentro do container')
        ]
      ),
      new Conn2FlowTreeItem(
        '🛠️ Manager & Core (Sistema)',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'tools',
        'Comandos de compilação e pipeline do Core Framework',
        [
          new Conn2FlowTreeItem('Update All (Sistema)', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.updateAll', 'sync', 'Pipeline de 4 etapas: Core -> Resources -> Files -> Database & CSS Rebuild'),
          new Conn2FlowTreeItem('Sincronizar Recursos', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.syncResources', 'paintcan', 'Executa c2f resources:sync'),
          new Conn2FlowTreeItem('CSS Rebuild', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.cssRebuild', 'zap', 'Reconstrói css_precompiled e css_compiled do banco'),
          new Conn2FlowTreeItem('CSS Audit', vscode.TreeItemCollapsibleState.None, 'conn2flow.manager.cssAudit', 'search', 'Audita a procedência e classes Tailwind em banco')
        ]
      ),
      new Conn2FlowTreeItem(
        '🗃️ Projetos & Environment',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'folder-library',
        `Gerenciamento de projetos satélites (Alvo ativo: ${targetProject})`,
        [
          new Conn2FlowTreeItem(`🎯 Projeto Alvo Ativo: [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.setTarget', 'target', 'Clique para alternar o projeto padrão no environment.json'),
          new Conn2FlowTreeItem(`🚀 Deploy Projeto Alvo [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.deployTarget', 'rocket', `Executa deploy 1-Click no projeto ativo '${targetProject}' sem pedir ID`),
          new Conn2FlowTreeItem('🎯 Deploy Escolhendo Projeto...', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.deployWithSelect', 'list-selection', 'Abre lista com todos os projetos do environment.json para deploy'),
          new Conn2FlowTreeItem(`🔄 Update All Projeto Alvo [${targetProject}]`, vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.updateAllTarget', 'refresh', `Pipeline de 6 etapas no projeto ativo '${targetProject}'`),
          new Conn2FlowTreeItem('💻 Update All Escolhendo Projeto...', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.updateAllWithSelect', 'list-ordered', 'Abre lista de projetos para executar o pipeline de 6 etapas'),
          new Conn2FlowTreeItem('➕ Cadastrar Novo Projeto no Environment', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.addNew', 'add', 'Cadastra novo projeto no devProjects do environment.json'),
          new Conn2FlowTreeItem('🔍 Verificar Repositórios Clonados', vscode.TreeItemCollapsibleState.None, 'conn2flow.projects.checkRepositories', 'repo', 'Verifica se conn2flow, lumix, transformamp e conn2flow-site estão presentes'),
          new Conn2FlowTreeItem('✨ Criar Ações Customizadas (.c2f/actions.json)', vscode.TreeItemCollapsibleState.None, 'conn2flow.custom.initManifest', 'sparkle', 'Cria o manifesto .c2f/actions.json para adicionar botões personalizados')
        ]
      ),
      new Conn2FlowTreeItem(
        '📚 AI Workspace Hub',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        'circuit-board',
        'Ferramentas de IA, sincronização de skills e documentação',
        [
          new Conn2FlowTreeItem('Sincronizar Skills (1-Click)', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.syncSkills', 'cloud-download', 'Propaga as 36 skills em todos os repositórios'),
          new Conn2FlowTreeItem('Validar 36 Skills (ai:sync)', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.validateSkills', 'pass', 'Valida contratos e integridade via c2f ai:sync'),
          new Conn2FlowTreeItem('Abrir Playbook Multi-Agentes', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.openPlaybook', 'book', 'Abre o guia prático de orquestração multi-agentes'),
          new Conn2FlowTreeItem('Abrir Catálogo de Skills', vscode.TreeItemCollapsibleState.None, 'conn2flow.ai.openCatalog', 'list-unordered', 'Abre o catálogo oficial das 36 skills do Conn2Flow')
        ]
      )
    );

    return categories;
  }
}
