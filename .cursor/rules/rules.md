---
# METADADOS PARA PROCESSAMENTO POR IA
version: 3.0 # Versão com checklists de segurança e boas práticas integrados
linguagem: pt-BR
codificacao: UTF-8
ultima_atualizacao: 2025-01-01T10:00:00-03:00
contexto_ia:
  - tipo_regras: diretrizes_desenvolvimento_avancadas
  - dominio: plataforma_gestao_obras_obrasai
  - complexidade: alta
  - tecnologias: [react, typescript, supabase, n8n, vitest, msw]
# CATEGORIAS PRINCIPAIS
regras:
  compreensao_codigo:
    prioridade: alta
    diretrizes:
      - "analise_codigo_existente_antes_solucao: Antes de propor soluções, analisar o código existente para entender a estrutura e convenções."
      - "identificacao_causa_raiz_antes_correcao: Ao encontrar problemas, identificar a causa raiz antes de sugerir correções."
      - "priorizacao_simplicidade: No ObrasAI, sempre priorizar soluções simples e funcionais."
  estilo_codigo_e_boas_praticas:
    prioridade: alta
    diretrizes:
      - "dry_principle: Evitar duplicação de código (DRY) através de componentes, hooks e funções reutilizáveis."
      - "eliminar_dead_code: Remover código não utilizado (componentes, funções, imports, variáveis)."
      - "typescript_consistente: Proibir `any`, tipar todas as props, usar `interface` para objetos e `type` para uniões/aliases."
      - "componentes_bem_estruturados: Manter componentes pequenos e focados (máx 250 linhas), com responsabilidade única."
      - "limite_tamanho_arquivos_critico: Arquivos não devem exceder 400-500 linhas. Refatorar arquivos maiores em módulos menores."
      - "gerenciamento_estado_eficiente: Usar TanStack Query para estado do servidor e Context API modular. Evitar 'prop drilling'."
      - "uso_correto_react_hooks: Seguir as regras dos hooks, gerenciar dependências (`useEffect`, `useCallback`) e criar custom hooks para lógicas complexas."
      - "separacao_logica_apresentacao: Isolar lógica de negócio em hooks e serviços, mantendo componentes focados na UI."
      - "performance_otimizacoes: Usar `React.memo`, `useCallback`, `useMemo` quando necessário e virtualizar listas longas."
      - "estrutura_organizacao_projeto: Manter a estrutura de arquivos e pastas definida, evitando dependências circulares."
      - "acessibilidade_a11y: Garantir labels acessíveis, alt text em imagens, semântica HTML e navegação por teclado."
  seguranca:
    prioridade: critica
    diretrizes:
      - "proteger_chaves_dados_sensiveis: Nunca fazer commit de segredos. Usar variáveis de ambiente e `.gitignore`."
      - "nao_expor_apis_frontend: Toda a lógica com chaves deve ocorrer no backend (Edge Functions)."
      - "validacao_entrada_dupla: Validar TODOS os inputs no frontend (Zod) e no backend."
      - "rls_obrigatorio: Implementar Row Level Security (RLS) no Supabase de forma rigorosa para todas as tabelas."
      - "protecao_ataques_comuns: Prevenir SQL Injection com o ORM do Supabase e XSS com sanitização de dados."
      - "logging_seguro: Manter logs de eventos críticos, mas NUNCA registrar dados sensíveis (senhas, tokens)."
      - "politica_senhas_fortes: Exigir senhas fortes via Zod e usar o hash seguro do Supabase Auth."
      - "backup_recuperacao_dados: Confiar nos backups automáticos do Supabase."
      - "analise_dependencias: Manter dependências atualizadas e rodar `npm audit` periodicamente."
      - "comunicacao_segura_https: Forçar HTTPS em toda a aplicação."
      - "protecao_dados_pessoais_lgpd: Implementar práticas compatíveis com LGPD."
  implementacao_e_testes:
    prioridade: alta
    diretrizes:
      - "divisao_tarefas_complexas_etapas: Dividir implementações complexas em etapas incrementais e testáveis."
      - "estrategia_testes_robusta: Para cada nova funcionalidade, implementar testes (unitários ou de integração) seguindo o padrão do projeto: Vitest + Testing Library + MSW. Focar em testar o comportamento do usuário e a resposta da UI."
      - "tratamento_erros_robusto: Implementar `try/catch` em chamadas de API, usar Error Boundaries e fornecer feedback claro ao usuário."
      - "foco_modificacoes_relevantes: Usar '// ... existing code ...' para indicar código não alterado."
      - "commits_atomicos_significativos: Fazer commits pequenos, focados em uma única mudança lógica."
      - "documentacao_fluxos_n8n: Documentar claramente os fluxos n8n criados."
  formato_respostas_ia:
    prioridade: media
    diretrizes:
      - "detalhamento_tecnico_funcionamento_codigo: Fornecer explicações técnicas detalhadas sobre como e por que o código proposto funciona."
      - "estrutura_resposta_visao_geral_primeiro: Dar uma visão geral do problema e da solução antes de mergulhar nos detalhes."
      - "exemplos_praticos_obrasai: Fornecer exemplos práticos contextualizados para o domínio de gestão de obras."
  # ... (Demais seções como adaptacao_projeto, integracoes_automacao, etc. podem ser mantidas como estão ou ajustadas se necessário)
  adaptacao_projeto:
    prioridade: alta
    diretrizes:
      - "preferencia_recursos_existentes: Antes de sugerir novas tecnologias, verificar se a funcionalidade pode ser implementada com Supabase, React ou n8n."
      - "consideracao_ambientes_multiplos: Considerar os diferentes ambientes (desenvolvimento, teste, produção) ao propor soluções."
      - "escalabilidade_leads: Considerar o crescimento do volume de leads e dados ao projetar soluções."
# ... (restante do arquivo pode ser mantido)
---
