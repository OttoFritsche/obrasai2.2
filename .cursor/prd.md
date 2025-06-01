# PRD – ObrasAI

## 1. Visão Geral

O ObrasAI é uma plataforma web para gestão de obras na construção civil, com o
objetivo de centralizar informações, automatizar processos e oferecer
inteligência de dados para construtores e equipes. O sistema integra módulos de
gestão operacional, financeira, de equipes, materiais e um núcleo de
Inteligência Artificial (IA) capaz de atuar como gestor digital, respondendo
dúvidas, gerando insights, analisando documentos e otimizando processos.

---

## 2. Objetivos do Projeto

- Centralizar e organizar todas as informações de obras.
- Automatizar tarefas e decisões com IA.
- Facilitar a gestão de equipes, contratos, materiais e pagamentos.
- Oferecer experiência personalizada e escalável via módulos e assinaturas.
- Ser referência em inovação e eficiência no setor de construção civil.

---

## 3. Módulos Principais e Funcionalidades

### 3.1. Módulo de Inteligência Artificial (IA) – Prioridade Máxima

- Chat contextual: Usuário pode perguntar qualquer coisa sobre obras, contratos,
  equipes, documentos, etc.
- Insights automáticos: Alertas, sugestões de melhorias, previsões de custos,
  atrasos, gargalos.
- Análise de documentos: Upload de contratos, notas fiscais (XML/PDF), plantas,
  etc. para extração e interpretação automática de dados.
- Análise de fotos: Upload de imagens da obra para detecção de progresso,
  problemas, segurança.
- Treinamento e onboarding: IA capaz de ensinar o usuário a usar o sistema,
  sugerir fluxos e boas práticas.
- Acesso controlado: Funções de IA liberadas conforme o plano de assinatura.
- Integração com dados do sistema: IA acessa todas as informações relevantes do
  banco de dados para responder perguntas e gerar relatórios.

### 3.2. Gestão de Equipes e Contratos

- Cadastro de equipes: Nome, função, contato, documentos, etc.
- Perfis de usuário: Construtor, engenheiro, arquiteto, mestre de obras,
  administrativo, colaborador.
- Vínculo com obras: Associar membros a obras específicas, com papéis e
  permissões.
- Gestão de contratos: Contratos por empreitada, diária, tarefa, etc.,
  vinculando membros e condições (valores, datas, escopo).
- Controle de presença e produtividade: Registro de presenças, faltas, horas
  trabalhadas, produtividade por membro.
- Relatórios de equipe: Custos, desempenho, histórico de cada membro e equipe.

### 3.3. Gestão de Materiais

- Cadastro de materiais: Nome, categoria, unidade, fornecedor, preço, validade.
- Estoque por obra: Quantidade inicial, entradas, saídas, saldo atual.
- Registro de consumo diário/por tarefa.
- Histórico de movimentações: Compra, aluguel, devolução, perda, sobra.
- Solicitação de compra/aluguel, aprovação e registro de recebimento.
- Alertas inteligentes com IA: Aviso de estoque baixo, previsão de consumo,
  sugestão de compra, alerta de vencimento, sugestão de fornecedores próximos
  (APIs externas).
- Importação automática de notas fiscais (XML/PDF): Extração de dados e
  atualização automática do estoque.
- Relatórios de consumo, custos, desperdício e comparação de preços.
- Integração com outros módulos: Vincular materiais a tarefas, equipes e
  financeiro.

### 3.4. Gestão Financeira e Pagamentos

- Integração Stripe: Cobrança de assinaturas conforme módulos contratados.
- Gestão de despesas e receitas: Cadastro, categorização, relatórios.
- Controle de pagamentos a equipes e fornecedores: Recibos, controle de
  pagamentos pendentes e realizados.
- Alertas de vencimento: Notificações para pagamentos, contratos e documentos a
  vencer.

### 3.5. Gestão de Obras e Documentos

- CRUD completo de obras, fornecedores, notas fiscais, documentos.
- Upload e organização de documentos: Contratos, plantas, laudos, etc.
- Dashboard geral: Visão consolidada de todas as obras, status, custos, alertas.

### 3.6. Comunicação e Notificações

- Notificações internas: Alertas, avisos, lembretes.
- Integração futura: E-mail, SMS, WhatsApp (conforme demanda).

### 3.7. Upload e Análise Inteligente de Plantas, Laudos e Documentos Técnicos

- Upload de arquivos: Permitir upload de plantas (PDF, imagem, DWG*), laudos,
  memoriais, ART/RRT, licenças e outros documentos técnicos, vinculando-os à
  obra desejada.
- Organização automática: Classificação dos documentos por tipo, data,
  responsável e vínculo com módulos (ex: obra, equipe, financeiro).
- Análise por IA:
  - **Plantas:**
    - Extração de informações de legendas, áreas, ambientes, escalas, símbolos e
      anotações.
    - Reconhecimento de ambientes (cômodos, áreas úteis, comuns, etc.).
    - Validação de padrões (normas técnicas, acessibilidade, áreas mínimas).
    - Geração automática de listas de ambientes, metragens e materiais
      previstos.
    - Comparação de versões de plantas para detectar alterações.
  - **Laudos Técnicos:**
    - Extração de conclusões, recomendações, responsáveis técnicos, datas e
      prazos.
    - Geração de alertas automáticos para problemas críticos.
    - Criação de checklists/tarefas a partir de recomendações do laudo.
  - **Outros Documentos:**
    - Validação de datas de validade (ex: licenças, ARTs).
    - Extração de responsáveis, órgãos emissores e dados relevantes.
    - Organização e vinculação automática ao módulo correto.
- Busca semântica: Usuário pode perguntar à IA sobre dados extraídos dos
  documentos (ex: "Qual a área total do projeto?", "Quais ambientes têm
  acessibilidade?").
- Geração de relatórios automáticos: Resumos inteligentes dos documentos
  enviados.
- Detecção de inconsistências: Ex: divergência entre planta e memorial
  descritivo.
- Sugestão de melhorias: Ex: adequações para normas de acessibilidade.
- Tecnologias sugeridas: OCR (Google Vision, AWS Textract, Azure Form
  Recognizer), modelos de IA treinados para construção civil, Edge Functions
  para processamento seguro.
- Limitações: Plantas em DWG exigem conversão prévia ou APIs especializadas;
  qualidade dos arquivos pode impactar a extração; garantir privacidade e
  segurança dos dados.

*Obs: Começar por PDF/imagem e expandir para outros formatos conforme demanda e
viabilidade técnica.

### 3.8. Geração e Gestão de Contratos Personalizados

- Templates de contrato para diferentes tipos de serviço (empreitada, diária,
  subempreita, mestre de obras, pedreiro, etc.), editáveis pelo construtor.
- Preenchimento automático dos dados do contratante, contratado, obra, serviço,
  valores, prazos e condições.
- Anexação de documentos (RG, CPF, CNPJ, comprovante de endereço, etc.) ao
  contrato.
- Geração de contrato em PDF pronto para assinatura.
- Integração com serviços de assinatura eletrônica (Clicksign, DocuSign,
  Autentique, Gov.br, etc.).
- Armazenamento seguro e organizado dos contratos, vinculados à obra e ao
  profissional.
- Consulta, download, impressão e compartilhamento dos contratos.
- Alertas para contratos pendentes, a vencer ou com cláusulas de reajuste.
- Histórico de alterações e versões dos contratos.
- Checklist de obrigações e pagamentos vinculados ao contrato.
- Cláusulas inteligentes: IA sugere cláusulas de proteção, reajuste, multa,
  etc., conforme o tipo de serviço e valor negociado.
- Checklist automático: Geração de tarefas e pagamentos vinculados ao contrato.
- Relatórios de contratos ativos, vencidos, pendentes de assinatura.
- Assinatura presencial (tablet/celular) ou remota (e-mail/WhatsApp).
- Validação automática de documentos anexados (ex: validade de CNH, CNPJ ativo).

### 3.9. Gestão Avançada de Materiais e Categorias

- Estrutura robusta de cadastro de materiais, com os seguintes campos
  principais:
  - id, nome, categoria_id, unidade (kg, m², peça, litro), marca,
    modelo/variante, descrição, código interno/externo (SKU, código de barras),
    fornecedor_id, preço de referência, validade (opcional), foto (opcional),
    status (ativo/inativo).
- Tabela de categorias de materiais, com estrutura hierárquica (categoria >
  subcategoria), permitindo organização e busca eficiente. Exemplo:
  - Estrutura > Cimento, Aço, Madeira
  - Alvenaria > Blocos, Argamassa
  - Elétrica > Fios e cabos, Tomadas/Interruptores
  - Hidráulica > Tubos, Conexões
  - Acabamento > Pisos, Tintas
  - Ferramentas > Elétricas, Manuais
- Permitir cadastro e edição de categorias e subcategorias pelo usuário.
- Cadastro de fornecedores integrado ao material.
- Controle de estoque por obra, com movimentações (entrada, saída, devolução,
  perda, ajuste, aluguel, etc.) sempre vinculadas à obra e ao usuário
  responsável.
- Tabela de estoque por obra, com quantidade atual, quantidade mínima (para
  alertas) e local de armazenamento.
- Importação automática de materiais ao importar nota fiscal de compra, com
  sugestão de cadastro de novos itens.
- Alertas inteligentes: Definir quantidade mínima por material/obra para alertas
  automáticos; IA sugere reposição com base no consumo histórico.
- Gestão de marcas e variantes: Cadastro de diferentes marcas/modelos para o
  mesmo tipo de material, facilitando comparação de preços e controle de
  qualidade.
- Relatórios e dashboards: Consumo por obra, por categoria, por período;
  materiais mais usados, alugados, desperdiçados; custo total de materiais por
  obra.
- Busca inteligente: Por nome, categoria, marca, código, etc.
- Cadastro rápido: Importação de catálogos de fornecedores ou integração com
  APIs de grandes lojas.
- Controle de lote e validade para materiais perecíveis.
- Inventário por QR Code: Geração de etiquetas para facilitar conferência e
  movimentação.
- Gestão de ferramentas e equipamentos: Controle de ferramentas alugadas ou
  próprias, além de materiais de consumo.
- Controle de permissões: Apenas usuários autorizados podem cadastrar/editar
  materiais e movimentações.
- Logs de movimentação para auditoria.
- Validação de dados obrigatórios e unidades/quantidades.
- IA para sugestões de materiais, fornecedores e reposições com base no
  histórico e perfil da obra.

---

## 4. Perfis de Usuário Sugeridos

- Construtor (admin): Acesso total, gestão de todas as obras e equipes.
- Engenheiro: Gestão técnica, relatórios, acompanhamento de obras.
- Arquiteto: Acesso a projetos, documentos, colaboração.
- Mestre de obras: Controle de equipe, execução, checklists.
- Administrativo/Financeiro: Gestão de pagamentos, contratos, documentos.
- Colaborador: Acesso restrito às suas tarefas, contratos e documentos.

> Sugestão: Começar com "Construtor" e "Colaborador", evoluindo para outros
> perfis conforme demanda.

---

## 5. Roadmap Sugerido (Cronograma Escalável)

### Fase 1 – MVP Robusto

- Gestão de obras, equipes, contratos e materiais básicos.
- Módulo de IA: Chat contextual simples (FAQ, dúvidas sobre o sistema).
- Integração Stripe para assinaturas.
- Upload e organização de documentos.
- Notificações internas.

### Fase 2 – Expansão Inteligente

- IA com acesso total aos dados do sistema (responde sobre obras, contratos,
  equipes, materiais, etc.).
- Insights automáticos e relatórios inteligentes.
- Análise de documentos e fotos.
- Perfis de usuário avançados.
- Controle de produtividade e presença.
- Importação automática de notas fiscais.

### Fase 3 – Diferenciais e Escalabilidade

- IA treinada para onboarding, treinamento e sugestões proativas.
- Integração com canais externos (e-mail, WhatsApp, SMS).
- Dashboards avançados, exportação de relatórios.
- Auditoria, logs, histórico detalhado.
- API pública para integrações.
- Marketplace de serviços, gestão de insumos, compliance, gamificação, app
  mobile, IA preditiva, relatórios customizáveis.

---

## 6. Critérios de Aceite e Qualidade

- Código limpo, modular, documentado e testado.
- Segurança de dados (RLS, validação, criptografia).
- Performance e escalabilidade.
- Acessibilidade (WCAG 2.1 AA).
- Experiência do usuário fluida e responsiva.
- Suporte a múltiplos perfis e permissões.
- IA realmente útil, integrada e confiável.

---

## 7. KPIs Sugeridos (para o futuro)

- Número de obras ativas por usuário.
- Engajamento com o módulo de IA (perguntas, respostas, feedback).
- Redução de tempo em tarefas administrativas.
- Taxa de renovação de assinaturas.
- Satisfação do usuário (NPS).

---

## 8. Próximos Passos

1. Validar este PRD e ajustar prioridades.
2. Detalhar requisitos técnicos do módulo de IA (após análise do projeto de IA
   legado).
3. Definir o modelo de dados para equipes, contratos, materiais e permissões.
4. Planejar a integração Stripe e fluxos de assinatura.
5. Iniciar desenvolvimento por sprints, priorizando MVP robusto e escalável.

---

## 9. Observações Finais

- O PRD deve ser revisado e atualizado a cada ciclo de planejamento.
- Novas ideias e demandas dos usuários devem ser incorporadas de forma
  iterativa.
- O foco é entregar valor real para o usuário final, com tecnologia de ponta e
  experiência diferenciada.
