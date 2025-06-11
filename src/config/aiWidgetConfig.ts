/**
 * Configurações do Widget de Ajuda IA
 */

export interface WidgetConfig {
  pageContext: string;
  documentationPath: string;
  title: string;
  placeholder: string;
  welcomeMessage: string;
}

/**
 * Mapeamento de rotas para configurações do widget
 */
export const widgetConfigurations: Record<string, WidgetConfig> = {
  '/dashboard/contratos': {
    pageContext: 'Contratos',
    documentationPath: '/docs/contrato/documentacao_contratoIA.md',
    title: 'Ajuda - Contratos',
    placeholder: 'Como posso criar um contrato com IA?',
    welcomeMessage: 'Olá! Sou seu assistente para o módulo de Contratos. Como posso ajudar?'
  },
  '/dashboard/obras': {
    pageContext: 'Obras',
    documentationPath: '/docs/obras/documentacao_obras.md',
    title: 'Ajuda - Obras',
    placeholder: 'Como cadastrar uma nova obra?',
    welcomeMessage: 'Olá! Sou seu assistente para o módulo de Obras. Como posso ajudar?'
  },
  '/dashboard/despesas': {
    pageContext: 'Despesas',
    documentationPath: '/docs/despesas/documentacao_despesas.md',
    title: 'Ajuda - Despesas',
    placeholder: 'Como lançar uma despesa?',
    welcomeMessage: 'Olá! Sou seu assistente para o módulo de Despesas. Como posso ajudar?'
  },
  '/dashboard/orcamentos': {
    pageContext: 'Orçamentos',
    documentationPath: '/docs/orcamentoIA/documentacao_orcamento.md',
    title: 'Ajuda - Orçamentos',
    placeholder: 'Como criar um orçamento paramétrico?',
    welcomeMessage: 'Olá! Sou seu assistente para o módulo de Orçamentos. Como posso ajudar?'
  },
  '/dashboard': {
    pageContext: 'Dashboard',
    documentationPath: '/docs/dashboard/documentacao_dashboard.md',
    title: 'Ajuda - Dashboard',
    placeholder: 'Como interpretar os gráficos?',
    welcomeMessage: 'Olá! Sou seu assistente para o Dashboard. Como posso ajudar?'
  }
};

/**
 * Obtém a configuração do widget baseada na rota atual
 */
export function getWidgetConfig(pathname: string): WidgetConfig | null {
  // Busca configuração exata
  if (widgetConfigurations[pathname]) {
    return widgetConfigurations[pathname];
  }

  // Busca por correspondência parcial
  const matchingPath = Object.keys(widgetConfigurations).find(path => 
    pathname.startsWith(path)
  );

  if (matchingPath) {
    return widgetConfigurations[matchingPath];
  }

  // Configuração padrão
  return {
    pageContext: 'Sistema',
    documentationPath: '/docs/geral/documentacao_geral.md',
    title: 'Ajuda - ObrasAI',
    placeholder: 'Como posso ajudar você?',
    welcomeMessage: 'Olá! Sou seu assistente do ObrasAI. Como posso ajudar?'
  };
}

/**
 * Verifica se o widget deve ser exibido na rota atual
 */
export function shouldShowWidget(pathname: string): boolean {
  // Lista de rotas onde o widget NÃO deve aparecer
  const excludedPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/404',
    '/500'
  ];

  return !excludedPaths.some(path => pathname.startsWith(path));
}