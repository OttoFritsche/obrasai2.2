# Documentação da Página de Listagem de Obras (`ObrasLista.tsx`)

Este documento detalha a funcionalidade e os componentes da página de listagem de obras, localizada em `src/pages/dashboard/obras/ObrasLista.tsx`.

## Visão Geral

A página `ObrasLista` é responsável por exibir uma lista de todas as obras cadastradas no sistema. Ela permite aos usuários visualizar informações resumidas de cada obra, acessar detalhes, editar, excluir e iniciar a criação de um orçamento paramétrico para uma obra específica. A página também apresenta um cabeçalho com o título, um resumo estatístico e botões de ação principais.

## Estrutura do Arquivo e Principais Componentes

O arquivo `ObrasLista.tsx` utiliza os seguintes componentes e hooks principais:

- **React Hooks:** `useState` para gerenciar o estado local (ex: obra a ser deletada).
- **TanStack Query:** `useQuery` (indiretamente através do hook `useObras`) para buscar e gerenciar os dados das obras de forma assíncrona, incluindo estados de carregamento e erro.
- **React Router DOM:** `Link` e `useNavigate` para navegação entre páginas.
- **Lucide React:** Para ícones.
- **Framer Motion:** Para animações sutis na interface.
- **Componentes de UI (shadcn/ui):**
    - `DataTable`: Para exibir a lista de obras de forma organizada e com funcionalidades de busca.
    - `Button`: Para ações como adicionar nova obra, editar, excluir, etc.
    - `Badge`: Para exibir o status da obra.
    - `Card`, `CardContent`, `CardHeader`, `CardTitle`: Para agrupar e exibir informações, como as estatísticas rápidas.
    - `AlertDialog`: Para confirmação de exclusão de obras.
    - `Tooltip`: Para exibir dicas sobre os botões de ação.
- **Layout:** `DashboardLayout` como componente base para a estrutura da página no dashboard.
- **Serviços:** `obrasApi` (indiretamente via `useObras`) para interagir com a API de obras.
- **Internacionalização (i18n):** `t` para tradução de textos, `formatCurrencyBR` e `formatDateBR` para formatação de moeda e data.
- **Hooks Customizados:** `useObras` para encapsular a lógica de busca, listagem e exclusão de obras.

## Funcionalidades Principais

### 1. Cabeçalho da Página

- **Título e Descrição:** Exibe "Obras" e "Gerencie suas obras e projetos".
- **Ícone:** Um ícone de `Building` (prédio) para representar a seção de obras.
- **Botões de Ação Principais:**
    - **"Orçamento IA"**: Navega para a página de criação de novo orçamento (`/dashboard/orcamentos/novo`).
    - **"Nova Obra"**: Navega para a página de cadastro de uma nova obra (`/dashboard/obras/nova`).

### 2. Cards de Estatísticas Rápidas

Quatro cards exibem um resumo quantitativo das obras:

- **Total de Obras:** Número total de obras cadastradas.
- **Em Andamento:** Número de obras com status "Em andamento".
- **Orçamento Total:** Soma dos orçamentos de todas as obras cadastradas, formatado em moeda brasileira.
- **Obras Atrasadas:** Número de obras com status "Atrasada".

Cada card possui um título, o valor da métrica e uma breve descrição.

### 3. Tabela de Obras (`DataTable`)

A tabela exibe as obras cadastradas com as seguintes colunas:

- **Nome:** Nome da obra.
- **Endereço:** Endereço completo da obra (rua, cidade, estado).
- **Orçamento:** Valor do orçamento da obra, formatado em moeda brasileira.
- **Período:** Data de início e data prevista de término da obra, formatadas.
- **Status:** Status atual da obra, calculado pela função `getObraStatus`. Os status possíveis e suas cores de badge são:
    - **Não iniciada** (cinza)
    - **Planejada** (amarelo/âmbar)
    - **Em andamento** (azul)
    - **Atrasada** (vermelho/rosa)
- **Ações:** Botões de ação para cada obra:
    - **Visualizar (Ícone `Eye`):** Navega para a página de detalhes da obra (`/dashboard/obras/:id`).
    - **Editar (Ícone `Pencil`):** Navega para a página de edição da obra (`/dashboard/obras/:id/editar`).
    - **Criar Orçamento IA (Ícone `Calculator`):** Navega para a página de novo orçamento, pré-selecionando a obra atual e definindo a rota de retorno (`/dashboard/orcamentos/novo?obra_id=:id&return=/dashboard/obras`).
    - **Excluir (Ícone `Trash2`):** Abre um diálogo de confirmação (`AlertDialog`) para excluir a obra.

A tabela também inclui uma funcionalidade de **busca** que permite filtrar as obras pelo nome.

### 4. Gerenciamento de Estado da Lista

- **Carregamento (`isLoading`):** Durante o carregamento dos dados, um spinner de carregamento animado é exibido.
- **Erro (`isError`):** Se ocorrer um erro ao buscar os dados, uma mensagem de erro é exibida junto com um botão "Tentar Novamente" que chama a função `refetch` para buscar os dados novamente.

### 5. Ação de Excluir Obra

- Ao clicar no ícone de lixeira na linha de uma obra, o ID da obra é armazenado no estado `obraToDelete`.
- Isso dispara a abertura de um `AlertDialog`.
- **Conteúdo do AlertDialog:**
    - **Título:** "Confirmar Exclusão"
    - **Descrição:** "Tem certeza que deseja excluir esta obra? Esta ação não pode ser desfeita."
    - **Botões:**
        - **Cancelar:** Fecha o diálogo sem excluir.
        - **Excluir:** Chama a função `handleDelete`.
- A função `handleDelete` executa a mutação `deleteObra` (do hook `useObras`) para remover a obra do banco de dados. Após a exclusão bem-sucedida, `obraToDelete` é resetado para `null`, fechando o diálogo.

### 6. Cálculo de Status da Obra (`getObraStatus`)

Esta função interna determina o status de uma obra com base nas datas de início e término e na data atual:

- Se não houver `data_inicio`, o status é "Não iniciada".
- Se `data_inicio` for no futuro, o status é "Planejada".
- Se `data_prevista_termino` existir e for no passado, o status é "Atrasada".
- Caso contrário (se `data_inicio` já passou e `data_prevista_termino` não passou ou não existe), o status é "Em andamento".

## Fluxo de Trabalho do Usuário

1.  O usuário acessa a página `/dashboard/obras`.
2.  A lista de obras é carregada e exibida na tabela, juntamente com as estatísticas rápidas.
3.  O usuário pode:
    *   Buscar obras pelo nome.
    *   Clicar no botão "Nova Obra" para cadastrar uma nova obra.
    *   Clicar no botão "Orçamento IA" para iniciar um novo orçamento sem obra pré-selecionada.
    *   Para uma obra específica na tabela:
        *   Clicar no ícone de olho para ver os detalhes da obra.
        *   Clicar no ícone de lápis para editar a obra.
        *   Clicar no ícone de calculadora para criar um orçamento IA para aquela obra.
        *   Clicar no ícone de lixeira para excluir a obra (com confirmação).

## Considerações Técnicas

- **Gerenciamento de Estado com React Query:** Facilita o data fetching, caching, e sincronização de estado do servidor, reduzindo a necessidade de gerenciar manualmente estados de loading, error, e os próprios dados.
- **Componentização:** O uso de componentes reutilizáveis como `DataTable` e os componentes de UI da `shadcn/ui` promove consistência e manutenibilidade.
- **Internacionalização:** A página está preparada para tradução usando a função `t`.
- **Animações:** `framer-motion` é utilizado para adicionar animações suaves, melhorando a experiência do usuário.

Este detalhamento visa auxiliar no entendimento completo da página `ObrasLista.tsx` para fins de treinamento da IA e futuras manutenções.