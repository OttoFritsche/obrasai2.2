# Plano de Implementação: Módulo Avançado de Licitações com IA

## 1. Visão Geral do Módulo

Este documento detalha o plano técnico para a implementação de um módulo completo de busca e gestão de licitações para construção civil, integrando inteligência artificial para análise e suporte à decisão. O objetivo é criar uma ferramenta que vá além da simples busca, auxiliando o usuário em todo o ciclo de vida da participação em uma licitação.

**Funcionalidades Principais:**
1.  **Busca e Filtragem Avançada:** Encontrar licitações por múltiplos critérios.
2.  **Análise de Edital com IA:** Extrair e resumir os pontos-chave de um edital.
3.  **Checklist de Tarefas e Documentos:** Gerenciar o processo de preparação.
4.  **Notificações e Alertas de Prazos:** Automatizar o acompanhamento de datas importantes.
5.  **Análise de Compatibilidade (Bid/No-Bid):** Recomendar estrategicamente se vale a pena competir.

## 2. Modelo de Dados (Supabase)

Serão criadas as seguintes tabelas para suportar as funcionalidades:

### `licitacoes`
(Tabela principal, conforme definido anteriormente)

### `licitacoes_favoritas`
(Tabela de junção para os favoritos do usuário, conforme definido anteriormente)

### `licitacoes_analises_ia`
(Tabela para cachear os resultados da análise da IA, conforme definido anteriormente)

### `construtora_perfil`
*Tabela para armazenar o perfil da empresa do usuário, usada na Análise de Compatibilidade.*
| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` | Chave primária |
| `tenant_id` | `uuid` | ID da empresa/tenant |
| `especialidades` | `text[]` | Array de especialidades (ex: ['edificacoes', 'saneamento']) |
| `capital_social` | `numeric` | Valor do capital social informado |
| `documentos_padrao` | `jsonb` | JSON com links para documentos padrão (ex: balanço) |
| `created_at` | `timestamp` | ... |

### `licitacao_tarefas`
*Tabela para o checklist de cada licitação favoritada.*
| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` | Chave primária |
| `licitacao_id` | `uuid` | Chave estrangeira para `licitacoes.id` |
| `tenant_id` | `uuid` | ID da empresa/tenant |
| `descricao` | `text` | Descrição da tarefa (ex: "Obter Certidão Negativa") |
| `concluida` | `boolean` | Status da tarefa |
| `fonte` | `text` | Origem da tarefa ('padrão' ou 'ia') |
| `created_at` | `timestamp` | ... |

### `notificacoes`
*Tabela para registrar e controlar as notificações.*
| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` | Chave primária |
| `usuario_id` | `uuid` | ID do usuário a ser notificado |
| `licitacao_id` | `uuid` | Licitação relacionada |
| `mensagem` | `text` | Conteúdo da notificação |
| `tipo` | `text` | Tipo (ex: 'alerta_prazo', 'status_mudou') |
| `data_envio` | `timestamp` | Quando a notificação deve ser enviada |
| `enviada` | `boolean` | Status do envio |

## 3. Fluxos Detalhados das Funcionalidades

### Fluxo 1: Busca e Filtragem
(Conforme documentado anteriormente, usando a Edge Function `buscar-licitacoes`)

### Fluxo 2: Análise de Edital com IA
(Conforme documentado anteriormente, usando a Edge Function `analisar-edital-ia`)

### Fluxo 3: Checklist de Documentos e Tarefas
1.  **Gatilho:** Usuário favorita uma licitação.
2.  **Backend:** Uma nova Edge Function `criar_checklist_licitacao` é acionada.
3.  **Lógica:** A função insere uma lista de tarefas padrão na tabela `licitacao_tarefas`, associadas à licitação e ao tenant. Se uma análise de IA já existir, a função adiciona tarefas extras com base nos requisitos identificados pela IA (ex: "Obter Atestado X").
4.  **Frontend:** Uma nova aba "Preparação" na página de detalhes da licitação exibe as tarefas, permitindo que o usuário as marque como concluídas.

### Fluxo 4: Notificações e Alertas de Prazos
1.  **Gatilho:** Usuário favorita uma licitação.
2.  **Backend:** A mesma Edge Function `criar_checklist_licitacao` também agenda as notificações.
3.  **Lógica:** A função extrai os prazos principais e insere registros na tabela `notificacoes` com as datas de envio apropriadas (ex: 3 dias antes do prazo final).
4.  **Agendamento:** Um **Supabase Cron Job** (`enviar-notificacoes`) roda a cada hora. Ele verifica a tabela `notificacoes` por itens pendentes cuja `data_envio` já passou, envia os e-mails/alertas e marca os itens como `enviada`.

### Fluxo 5: Análise de Compatibilidade (Bid/No-Bid)
1.  **Pré-requisito:** O usuário preenche o perfil da sua construtora na nova página "Perfil da Construtora".
2.  **Gatilho:** Ocorre ao final do "Fluxo 2: Análise de Edital com IA".
3.  **Lógica (Edge Function `analisar-edital-ia`):**
    -   Após a IA extrair os requisitos do edital, a função busca o `construtora_perfil` do tenant atual.
    -   Ela então faz uma **segunda chamada à IA**, enviando os requisitos do edital E o perfil da construtora.
    -   O prompt para esta segunda chamada pede à IA para comparar os dois conjuntos de dados e gerar um parecer de compatibilidade (alto, médio, baixo) com justificativas.
    -   O resultado completo (análise do edital + análise de compatibilidade) é salvo na tabela `licitacoes_analises_ia`.
4.  **Frontend:** O resultado é exibido em uma seção dedicada "Análise de Compatibilidade" na página de detalhes.

## 4. Plano de Implementação em Fases

Dada a complexidade, a implementação será dividida em 3 fases:

### Fase 1: O Essencial (Busca e Análise)
1.  **Backend:**
    -   Criar migrações para as tabelas: `licitacoes`, `licitacoes_favoritas`, `licitacoes_analises_ia`.
    -   Desenvolver e implantar as Edge Functions: `buscar-licitacoes` e `analisar-edital-ia` (sem a lógica de compatibilidade ainda).
2.  **Frontend:**
    -   Desenvolver as páginas de busca, listagem e detalhes da licitação.
    -   Implementar a busca com filtros e a exibição da análise da IA.

### Fase 2: Gestão e Decisão (Checklist e Compatibilidade)
1.  **Backend:**
    -   Criar migrações para as tabelas: `construtora_perfil` e `licitacao_tarefas`.
    -   Implementar a Edge Function `criar_checklist_licitacao`.
    -   Adicionar a lógica de Análise de Compatibilidade à Edge Function `analisar-edital-ia`.
2.  **Frontend:**
    -   Desenvolver a página "Perfil da Construtora".
    -   Implementar a aba "Preparação" com o checklist na página de detalhes.
    -   Exibir o resultado da Análise de Compatibilidade.

### Fase 3: Automação e Retenção (Notificações)
1.  **Backend:**
    -   Criar migração para a tabela `notificacoes`.
    -   Adicionar a lógica de agendamento de notificações na `criar_checklist_licitacao`.
    -   Configurar o Supabase Cron Job `enviar-notificacoes`.
2.  **Frontend:**
    -   Desenvolver o componente de "sininho" para notificações no app.
    -   Criar os templates de e-mail para as notificações.