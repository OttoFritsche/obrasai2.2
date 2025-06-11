# Documentação do Módulo de Contratos - ObrasAI

## Visão Geral

O módulo de Contratos do ObrasAI é uma funcionalidade completa para gerenciamento de contratos de obra, oferecendo tanto criação manual quanto assistida por IA. A página principal (`ContratosLista.tsx`) serve como centro de controle para visualizar, filtrar e gerenciar todos os contratos do sistema.

## Estrutura do Arquivo

**Localização:** `/src/pages/dashboard/contratos/ContratosLista.tsx`

### Dependências Principais
- React Router para navegação
- Tanstack Table para tabelas de dados
- Framer Motion para animações
- Lucide React para ícones
- Hooks customizados: `useContratos`, `useObras`
- Componentes UI personalizados

## Componentes Principais

### 1. Cabeçalho da Página

**Elementos:**
- Ícone de documento (FileText)
- Título "Contratos"
- Descrição "Gerencie seus contratos de obra"
- Botões de ação principais

**Botões de Ação:**

#### Botão "Novo Contrato" (Azul com Gradiente)
- **Rota:** `/dashboard/contratos/novo`
- **Ícone:** Plus
- **Função:** Criar contrato manual/tradicional
- **Estilo:** Gradiente azul para roxo com efeito hover

#### Dropdown "Assistente IA"
- **Ícone:** Bot + ChevronDown
- **Opção:** "Novo Contrato com IA"
- **Rota:** `/dashboard/contratos/novo-ia`
- **Função:** Criar contrato assistido por IA

### 2. Cards de Métricas (Dashboard)

Quatro cards principais exibindo estatísticas em tempo real:

#### Card 1: Total de Contratos
- **Ícone:** FileText
- **Cor:** Primária (slate)
- **Valor:** Contagem total de contratos

#### Card 2: Contratos Ativos
- **Ícone:** CheckCircle
- **Cor:** Verde (success)
- **Valor:** Contratos com status 'ATIVO'

#### Card 3: Aguardando Assinatura
- **Ícone:** Clock
- **Cor:** Amarelo (warning)
- **Valor:** Contratos com status 'AGUARDANDO_ASSINATURA'

#### Card 4: Valor Total
- **Ícone:** AlertCircle
- **Cor:** Azul (info)
- **Valor:** Soma de todos os valores dos contratos (formatado em R$)

### 3. Sistema de Filtros

**Card de Filtros com:**

#### Filtro por Obra
- **Tipo:** Select dropdown
- **Opções:** "Todas as obras" + lista de obras cadastradas
- **Função:** Filtra contratos por obra específica

#### Filtro por Status
- **Tipo:** Select dropdown
- **Opções:**
  - Todos os status
  - RASCUNHO
  - AGUARDANDO_ASSINATURA
  - ATIVO
  - CONCLUIDO
  - CANCELADO

### 4. Tabela de Contratos

**Colunas da Tabela:**

1. **Número:** Número do contrato (fonte monospace)
2. **Título:** Nome do contrato + data de criação
3. **Obra:** Nome da obra associada
4. **Contratado:** Nome e documento do contratado
5. **Valor:** Valor formatado em moeda brasileira
6. **Status:** Badge colorido com ícone
7. **Ações:** Menu dropdown com opções

**Funcionalidades da Tabela:**
- Busca por título
- Ordenação por colunas
- Paginação automática
- Responsividade

### 5. Sistema de Status

**Status Disponíveis:**

- **RASCUNHO:** Badge secundário, ícone Edit
- **AGUARDANDO_ASSINATURA:** Badge warning, ícone Clock
- **ATIVO:** Badge success, ícone CheckCircle
- **CONCLUIDO:** Badge default, ícone CheckCircle
- **CANCELADO:** Badge destructive, ícone AlertCircle

### 6. Menu de Ações por Contrato

**Ações Disponíveis:**

#### Para Todos os Contratos:
- **Visualizar:** Navega para detalhes do contrato
- **Baixar Documento:** Abre PDF em nova aba (se disponível)
- **Excluir:** Remove contrato com confirmação

#### Para Contratos em RASCUNHO:
- **Editar:** Edição manual do contrato
- **Editar com IA:** Edição assistida por IA
- **Enviar para Assinatura:** Inicia processo de assinatura

## Fluxos de Trabalho

### Como Criar um Novo Contrato Normal

1. **Acesso:** Na página de lista de contratos
2. **Ação:** Clicar no botão "Novo Contrato" (azul com gradiente)
3. **Navegação:** Sistema redireciona para `/dashboard/contratos/novo`
4. **Processo:** Preenchimento manual de todos os campos do contrato
5. **Campos Típicos:**
   - Número do contrato
   - Título/descrição
   - Obra associada
   - Dados do contratado (nome, documento)
   - Valor total
   - Prazo de execução
   - Termos e condições
6. **Salvamento:** Contrato criado com status "RASCUNHO"
7. **Próximos Passos:** Editar, enviar para assinatura ou excluir

### Como Criar um Novo Contrato com IA

1. **Acesso:** Na página de lista de contratos
2. **Ação:** Clicar no dropdown "Assistente IA"
3. **Seleção:** Escolher "Novo Contrato com IA"
4. **Navegação:** Sistema redireciona para `/dashboard/contratos/novo-ia`
5. **Processo IA:**
   - Interface de chat com assistente IA
   - IA faz perguntas sobre o contrato
   - Usuário responde em linguagem natural
   - IA gera automaticamente o contrato baseado nas respostas
6. **Campos Gerados Automaticamente:**
   - Cláusulas contratuais
   - Termos técnicos
   - Valores e prazos
   - Condições específicas da obra
7. **Revisão:** Usuário pode revisar e ajustar o contrato gerado
8. **Salvamento:** Contrato criado com status "RASCUNHO"
9. **Vantagens da IA:**
   - Geração automática de cláusulas
   - Adequação às normas legais
   - Personalização baseada no tipo de obra
   - Redução de erros e omissões

### Fluxo de Edição com IA

1. **Pré-requisito:** Contrato deve estar em status "RASCUNHO"
2. **Acesso:** Menu de ações → "Editar com IA"
3. **Navegação:** `/dashboard/contratos/{id}/editar-ia`
4. **Funcionalidades:**
   - Chat interativo para modificações
   - IA sugere melhorias no contrato
   - Ajustes automáticos de cláusulas
   - Verificação de consistência legal

### Processo de Assinatura

1. **Pré-requisito:** Contrato em status "RASCUNHO"
2. **Ação:** Menu de ações → "Enviar para Assinatura"
3. **Navegação:** `/dashboard/contratos/{id}/enviar`
4. **Processo:**
   - Geração de PDF final
   - Envio para plataforma de assinatura digital
   - Mudança de status para "AGUARDANDO_ASSINATURA"
   - Notificações automáticas

## Gerenciamento de Estado

### Estados da Aplicação
- **contratos:** Lista de todos os contratos
- **obras:** Lista de obras para filtros
- **selectedObraId:** Filtro ativo de obra
- **selectedStatus:** Filtro ativo de status
- **contratoToDelete:** ID do contrato a ser excluído
- **isLoading:** Estado de carregamento
- **error:** Estado de erro

### Hooks Utilizados
- **useContratos:** Gerencia CRUD de contratos
- **useObras:** Carrega lista de obras
- **useNavigate:** Navegação programática
- **useState:** Estados locais da página

## Funcionalidades Avançadas

### Sistema de Busca
- Busca em tempo real por título do contrato
- Placeholder: "Buscar por título..."
- Integrado com DataTable

### Animações
- Framer Motion para transições suaves
- Animações escalonadas nos cards
- Efeitos hover nos botões
- Transições de página

### Responsividade
- Grid adaptativo para cards (1 coluna mobile, 4 desktop)
- Tabela responsiva com scroll horizontal
- Filtros empilhados em mobile

### Confirmações de Segurança
- Modal de confirmação para exclusão
- Prevenção de ações acidentais
- Feedback visual para ações destrutivas

## Considerações Técnicas

### Performance
- Lazy loading de dados
- Filtros otimizados
- Memoização de cálculos
- Paginação automática

### Segurança
- Validação de permissões por status
- Sanitização de dados
- Prevenção de XSS
- Logs de auditoria

### Acessibilidade
- Labels semânticos
- Navegação por teclado
- Screen reader friendly
- Contraste adequado

## Integração com IA

### Assistente de Contratos
- **Função:** Criação automática de contratos
- **Tecnologia:** GPT-4 especializado em contratos de obra
- **Entrada:** Descrição em linguagem natural
- **Saída:** Contrato completo e estruturado

### Capacidades da IA
- Geração de cláusulas específicas por tipo de obra
- Adequação às normas da construção civil
- Cálculo automático de prazos e valores
- Sugestões de melhorias contratuais
- Verificação de consistência legal

### Fluxo de Interação com IA
1. Usuário descreve o projeto
2. IA faz perguntas de esclarecimento
3. IA gera minuta do contrato
4. Usuário revisa e aprova
5. Contrato finalizado e salvo

Esta documentação serve como base para treinar chatbots e assistentes IA que irão auxiliar os usuários do ObrasAI no gerenciamento eficiente de contratos de obra.