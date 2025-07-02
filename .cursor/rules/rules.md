---

# METADADOS PARA PROCESSAMENTO POR IA

version: 2.0 # Versão atualizada para ObrasAI formato: yaml linguagem: pt-BR
codificacao: UTF-8 ultima_atualizacao: 2024-12-27T15:00:00-03:00 contexto_ia:

- tipo_regras: diretrizes_desenvolvimento
- dominio: plataforma_gestao_obras_obrasai
- complexidade: alta
- tecnologias: [react, typescript, supabase, n8n, chatbot, edge_functions]

# CATEGORIAS PRINCIPAIS

regras: compreensao_codigo: prioridade: alta diretrizes: -
"analise_codigo_existente_antes_solucao: Antes de propor soluções, analisar o
código existente para entender a estrutura atual e como a nova funcionalidade se
encaixará." - "identificacao_causa_raiz_antes_correcao: Ao encontrar problemas,
identificar a causa raiz antes de sugerir correções, focando em diagnósticos
precisos." - "priorizacao_simplicidade: No ObrasAI, sempre priorizar soluções
simples e funcionais sobre complexidade desnecessária."

estilo_codigo: prioridade: media diretrizes: - "preferencia_solucoes_simples:
Preferir soluções simples e diretas, evitando padrões excessivamente complexos -
especialmente importante para fluxos n8n." - "consistencia_estilo_projeto:
Adaptar-se ao estilo de código já utilizado no projeto (TypeScript/React para
frontend, Edge Functions para backend), mantendo consistência com as convenções
existentes." - "prevencao_duplicacao_codigo: Evitar duplicação de código,
verificando o projeto por funcionalidades semelhares antes de implementar algo
novo. Utilizar componentes e hooks reutilizáveis." -
"convencoes_typescript_react_frontend: Seguir as melhores práticas e convenções
para TypeScript no React, incluindo nomenclatura, organização de componentes e
hooks." - "convencoes_edge_functions: Seguir as melhores práticas para Supabase
Edge Functions, incluindo tratamento de erros, validação de dados e resposta
padronizada." - "limite_tamanho_arquivos: CRÍTICO - Arquivos não devem exceder 400-500 linhas de código. Arquivos maiores devem ser refatorados em módulos menores para facilitar manutenção, legibilidade e evitar complexidade excessiva. Aplicar divisão por responsabilidade única."

seguranca: prioridade: critica diretrizes: -
"priorizacao_seguranca_dados_sensiveis: Ao implementar recursos que envolvam
dados de clientes ou leads, priorizar a segurança e explicar as implicações de
cada decisão." - "implementacao_rls_supabase: Utilizar Row Level Security (RLS)
no Supabase de forma rigorosa para controlar o acesso aos dados de leads,
clientes e projetos." - "gerenciamento_seguro_tokens_apis: Armazenar e gerenciar
tokens de API (n8n webhooks, integrações externas) de forma segura, utilizando
variáveis de ambiente." - "validacao_entrada_dados_completa: Validar todas as
entradas de dados no frontend (chatbot) e no backend (Edge Functions) para
prevenir ataques e inconsistências." - "protecao_dados_pessoais_lgpd:
Implementar práticas compatíveis com LGPD para coleta, armazenamento e
processamento de dados pessoais dos leads."

implementacao: prioridade: alta diretrizes: - "divisao_tarefas_complexas_etapas:
Dividir implementações complexas em etapas incrementais e testáveis, permitindo
validação a cada passo." - "estrategia_testes_funcionalidades: Para cada
funcionalidade do ObrasAI, fornecer uma estratégia de testes simples e prática."

- "foco_modificacoes_relevantes: Ao sugerir mudanças, mostrar apenas as partes
  relevantes, usando '// ... existing code ...' para indicar código não
  alterado."
- "commits_atomicos_significativos: Fazer commits pequenos, focados em uma única
  mudança lógica, com mensagens claras e descritivas." -
  "documentacao_fluxos_n8n: Documentar claramente os fluxos n8n criados,
  incluindo propósito de cada nó e mapeamento de dados."

formato_respostas_ia: prioridade: media diretrizes: -
"detalhamento_tecnico_funcionamento_codigo: Fornecer explicações técnicas
detalhadas sobre como e por que o código proposto funciona, especialmente para
integrações complexas." - "estrutura_resposta_visao_geral_primeiro: Dar uma
visão geral do problema e da solução no início da resposta antes de mergulhar
nos detalhes técnicos." - "exemplos_praticos_obrasai: Sempre que possível,
fornecer exemplos práticos contextualizados para o domínio de gestão de obras."

adaptacao_projeto: prioridade: alta diretrizes: -
"preferencia_recursos_existentes: Antes de sugerir novas tecnologias, verificar
se a funcionalidade pode ser implementada com Supabase, React ou n8n." -
"consideracao_ambientes_multiplos: Considerar os diferentes ambientes
(desenvolvimento, teste, produção) ao propor soluções, especialmente para
webhooks e integrações." - "analise_pos_implementacao: Após implementar uma
solução, fornecer uma análise crítica sobre possíveis melhorias futuras ou
otimizações." - "escalabilidade_leads: Considerar o crescimento do volume de
leads e dados ao projetar soluções."

integracoes_automacao: # Específico para ObrasAI prioridade: alta diretrizes: -
"encapsulamento_logica_integracao: Isolar a lógica de comunicação com APIs
externas e Supabase em módulos dedicados para promover reutilização e
manutenibilidade." - "uso_eficiente_recursos_supabase: Escrever queries
otimizadas para o Supabase, utilizar Edge Functions para lógica de negócio e RLS
para segurança." - "tratamento_erros_integracoes: Implementar tratamento de
erros robusto para webhooks, n8n e Edge Functions, incluindo logging detalhado."

- "monitoramento_automacoes: Considerar mecanismos para monitorar fluxos n8n,
  webhooks e Edge Functions, incluindo alertas para falhas." -
  "design_fluxos_n8n_resilientes: Projetar fluxos n8n com tratamento de erro,
  fallbacks e retry quando apropriado." - "padronizacao_webhooks: Manter padrões
  consistentes para webhooks entre diferentes módulos do sistema."

experiencia_usuario: prioridade: alta diretrizes: - "chatbot_conversacional:
Manter o chatbot simples, direto e focado na captura eficiente de leads." -
"feedback_visual_acoes: Fornecer feedback visual claro para todas as ações do
usuário no frontend." - "responsividade_mobile_first: Garantir que todas as
interfaces funcionem perfeitamente em dispositivos móveis." -
"carregamento_rapido: Otimizar tempos de carregamento, especialmente para o
chatbot na landing page."

# METADADOS TÉCNICOS

controle_versao: politica_atualizacao_regras: mensal historico_mudancas:
auto_registrado_pela_ia_ou_git

dependencias_tecnologicas: sistemas_principais: - obrasai_frontend_react_ts -
supabase_backend_edge_functions - supabase_database_postgresql -
n8n_automation_platform - chatbot_landing_page ferramentas_desenvolvimento: -
git - vite - typescript - react - tailwindcss - shadcn_ui - supabase_cli -
n8n_self_hosted - cursor_ide integrações_terceiros: - google_sheets_api -
gmail_smtp - whatsapp_business_api # Futuro - analytics_tools # Futuro

# PRIORIZAÇÃO DE FOCO

niveis_prioridade_desenvolvimento: critica: - seguranca # LGPD, RLS, validação
de dados - captura_leads # Funcionalidade core do sistema - automacao_confiavel

# n8n, webhooks, Edge Functions

alta: - compreensao_codigo - implementacao - adaptacao_projeto -
integracoes_automacao - experiencia_usuario

media: - estilo_codigo - formato_respostas_ia

# POLÍTICAS DE EXECUÇÃO E QUALIDADE

fluxo_validacao_codigo:

- analise_estatica_typescript # Verificação de tipos
- verificacao_conformidade_estilo # ESLint, Prettier
- teste_funcional_chatbot # Teste manual do fluxo de leads
- teste_integracao_n8n # Verificação dos fluxos de automação
- teste_edge_functions # Teste das funções serverless
- revisao_humana_pr # Pull Request review

tratamento_excecoes_runtime:

- logging_detalhado_edge_functions # Logs em Edge Functions
- monitoramento_fluxos_n8n # Alertas para falhas em automações
- backup_dados_criticos # Backup regular do Supabase
- notificacoes_erros_criticos # Alertas para falhas no sistema

# PADRÕES ESPECÍFICOS DO OBRASAI

padroes_dominio: estrutura_leads: - email_obrigatorio_unico -
nome_empresa_cargo_padronizados - origem_rastreamento_consistente -
data_captura_automatica

fluxos_automacao: - webhook_captura_lead - processamento_dados -
armazenamento_supabase - backup_google_sheets - notificacao_email -
integracao_crm_futuro

seguranca_dados: - rls_por_cliente - auditoria_acesso_dados - consentimento_lgpd

- retencao_dados_controlada

# MANUTENÇÃO DAS REGRAS

ciclo_vida_regras_projeto: revisao_periodica: trimestral
atualizacao_conforme_necessario: continua depreciacao_regras_obsoletas:
semestral adaptacao_crescimento_negocio: continua
