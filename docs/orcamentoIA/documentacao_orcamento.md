# Documentação do Módulo de Orçamento Paramétrico ObrasAI

Este documento detalha as funcionalidades do módulo de orçamento paramétrico da plataforma ObrasAI. O objetivo é fornecer um guia completo para que a IA possa auxiliar os usuários na criação e gerenciamento de orçamentos de forma eficiente e intuitiva.

## Visão Geral do Módulo

O módulo de Orçamento Paramétrico permite aos usuários criar estimativas de custo para projetos de construção civil de forma rápida e precisa, utilizando inteligência artificial para parametrizar os custos com base em características específicas da obra. As principais funcionalidades incluem:

- Criação de novos orçamentos paramétricos.
- Listagem e gerenciamento de orçamentos existentes.
- Detalhamento completo de cada orçamento, incluindo itens, custos e análises.

## Estrutura dos Arquivos

As funcionalidades de orçamento estão organizadas nos seguintes arquivos principais dentro da pasta `src/pages/dashboard/orcamento/`:

- `NovoOrcamento.tsx`: Interface para a criação de novos orçamentos.
- `OrcamentosLista.tsx`: Página para listar e gerenciar todos os orçamentos criados.
- `OrcamentoDetalhe.tsx`: Página para visualizar os detalhes completos de um orçamento específico.

## Funcionalidades Detalhadas

### 1. Criação de Novo Orçamento (`NovoOrcamento.tsx`)

A página de criação de novo orçamento é a porta de entrada para a geração de estimativas de custo. Ela guia o usuário através de um processo simplificado para definir os parâmetros da obra e obter um orçamento inicial.

**Principais Características:**

- **Interface Intuitiva:** Utiliza um componente `WizardOrcamento` que divide o processo de criação em etapas claras e fáceis de seguir.
- **Orçamento Paramétrico com IA:** A plataforma utiliza inteligência artificial para estimar os custos com base nos parâmetros fornecidos pelo usuário.
- **Informações Claras:** Apresenta ao usuário informações sobre o que o orçamento paramétrico da ObrasAI contempla, como:
    - As 11 etapas da construção.
    - Estimativa de mão de obra.
    - Estimativa de materiais.
- **Redirecionamento:** Após a criação bem-sucedida do orçamento, o usuário é redirecionado para a página de detalhes do novo orçamento.

**Passo a Passo para Criar um Novo Orçamento:**

1.  **Acessar a Página:** Navegue até a seção de "Orçamentos" no dashboard e clique na opção para criar um "Novo Orçamento".
2.  **Preencher o Formulário Wizard:**
    *   **Informações Básicas:**
        *   **Nome do Orçamento:** Defina um nome descritivo para o seu orçamento (ex: "Residência Térrea Alphaville", "Reforma Apartamento Centro").
        *   **Cliente (Opcional):** Associe o orçamento a um cliente existente ou crie um novo.
        *   **CEP da Obra:** Informe o CEP do local da obra para que a IA possa considerar custos regionais.
        *   **Endereço:** Detalhe o endereço da obra.
    *   **Características da Obra:**
        *   **Tipo de Obra:** Selecione o tipo de construção (ex: Residencial, Comercial, Industrial).
        *   **Padrão da Obra:** Escolha o padrão de acabamento e construção (ex: Baixo, Médio, Alto).
        *   **Área a Construir (m²):** Informe a área total que será construída.
        *   **Número de Pavimentos:** Indique a quantidade de andares da edificação.
    *   **Outras Informações (Opcional):**
        *   **Observações:** Adicione quaisquer notas ou informações relevantes sobre o projeto.
3.  **Iniciar Geração do Orçamento:** Após preencher todos os campos obrigatórios, clique no botão "Gerar Orçamento com IA".
4.  **Aguardar Processamento:** A IA processará as informações e gerará uma estimativa de custo detalhada.
5.  **Visualizar Detalhes:** Ao concluir, você será redirecionado para a página de "Detalhes do Orçamento", onde poderá analisar todos os itens, custos e informações geradas.

### 2. Listagem de Orçamentos (`OrcamentosLista.tsx`)

A página de listagem de orçamentos oferece uma visão geral de todos os orçamentos criados pelo usuário, permitindo fácil acesso, gerenciamento e acompanhamento.

**Principais Características:**

- **Visualização em Tabela:** Apresenta os orçamentos em um formato de tabela clara e organizada, utilizando o componente `DataTable`.
- **Informações Relevantes:** Exibe colunas com dados importantes como:
    - Nome do Orçamento
    - Cliente
    - Data de Criação
    - Custo Estimado
    - Status (ex: Em Elaboração, Aprovado, Reprovado)
- **Ações Rápidas:** Permite realizar ações diretamente na lista, como:
    - Visualizar Detalhes
    - Editar Orçamento
    - Duplicar Orçamento
    - Excluir Orçamento
- **Busca e Filtros:** Oferece funcionalidades de busca por nome do orçamento e filtros por status ou cliente para facilitar a localização de orçamentos específicos.
- **Criação de Novo Orçamento:** Inclui um botão de atalho para redirecionar o usuário à página de criação de novo orçamento.

**Como Utilizar a Lista de Orçamentos:**

1.  **Acessar a Página:** Navegue até a seção de "Orçamentos" no dashboard.
2.  **Visualizar Orçamentos:** A lista com todos os seus orçamentos será exibida.
3.  **Buscar:** Utilize o campo de busca para encontrar um orçamento pelo nome.
4.  **Filtrar:** Aplique filtros para refinar a lista (ex: mostrar apenas orçamentos "Aprovados").
5.  **Ordenar:** Clique nos cabeçalhos das colunas para ordenar os orçamentos (ex: por data de criação, por custo estimado).
6.  **Acessar Ações:** Para cada orçamento na lista, utilize os botões de ação para:
    *   Clicar no nome do orçamento ou no ícone de "olho" para ver os detalhes.
    *   Clicar no ícone de "lápis" para editar as informações básicas do orçamento.
    *   Clicar no ícone de "copiar" para duplicar o orçamento e criar uma nova versão baseada nele.
    *   Clicar no ícone de "lixeira" para excluir um orçamento (esta ação geralmente requer confirmação).
7.  **Criar Novo:** Clique no botão "Novo Orçamento" para iniciar o processo de criação de um novo orçamento paramétrico.

### 3. Detalhes do Orçamento (`OrcamentoDetalhe.tsx`)

A página de detalhes do orçamento é onde o usuário pode explorar todas as informações de um orçamento específico, incluindo a composição de custos, itens detalhados, análises da IA e opções de gerenciamento.

**Principais Características:**

- **Visão Abrangente:** Apresenta um dashboard completo com todas as informações relevantes do orçamento.
- **Navegação por Abas:** Organiza o conteúdo em abas para facilitar a navegação:
    - **Resumo:** Visão geral com os principais indicadores, informações da obra e status.
    - **Composição de Custos:** Gráficos e tabelas que demonstram a distribuição dos custos por categoria ou etapa.
    - **Itens Detalhados:** Uma tabela interativa com todos os insumos, serviços e seus respectivos quantitativos, custos unitários e totais. Permite busca, filtros e agrupamento por categoria.
    - **Análise IA (Futuro):** Espaço reservado para insights e sugestões geradas pela inteligência artificial sobre o orçamento.
    - **Histórico (Futuro):** Registro de alterações e versões do orçamento.
- **Informações Principais:**
    - Nome do Orçamento, Cliente, Localização.
    - Tipo e Padrão da Obra, Área Construída.
    - Custo Total Estimado, Custo por m².
    - Status do Orçamento (com badge visual).
    - Data de Criação e Última Atualização.
- **Cards de Estatísticas:** Exibe cards com destaque para:
    - Custo Total
    - Custo por m²
    - Área Construída/Total
    - Quantidade de Itens Detalhados
- **Ações do Orçamento:** Botões para:
    - **Voltar:** Retorna para a lista de orçamentos.
    - **Editar:** Permite modificar as informações básicas do orçamento.
    - **Duplicar:** Cria uma cópia do orçamento atual.
    - **Recalcular com IA:** Permite que o usuário solicite um novo cálculo paramétrico, útil caso algum parâmetro base tenha sido alterado ou para obter uma nova estimativa com dados atualizados da IA.
    - **Exportar (PDF/Excel - Futuro):** Funcionalidade para exportar o orçamento.
- **Componente `ItensDetalhados`:**
    - **Tabela Interativa:** Utiliza o componente `DataTable` para exibir os itens com paginação, ordenação e busca.
    - **Filtro por Categoria:** Permite ao usuário selecionar uma ou mais categorias para visualizar apenas os itens correspondentes.
    - **Busca por Insumo:** Campo de busca para encontrar itens específicos pelo nome do insumo.
    - **Agrupamento por Categoria:** Os itens são agrupados visualmente por suas categorias usando componentes `Collapsible` (expansíveis/retráteis).
    - **Detalhes do Item:** Para cada item, exibe: Insumo/Serviço, Quantidade, Unidade, Valor Unitário, Valor Total, Fonte do Preço.

**Como Explorar os Detalhes do Orçamento:**

1.  **Acessar a Página:** Clique em um orçamento na página `OrcamentosLista.tsx`.
2.  **Analisar o Resumo:** Na aba "Resumo", verifique as informações gerais, status e os principais indicadores de custo.
3.  **Ver a Composição de Custos:**
    *   Navegue até a aba "Composição de Custos".
    *   Analise o gráfico de pizza ou barras que mostra a distribuição percentual dos custos por grandes categorias (ex: Materiais, Mão de Obra, Equipamentos) ou por etapas da obra (ex: Fundação, Estrutura, Acabamento).
    *   Observe a tabela resumo que acompanha o gráfico, detalhando os valores de cada categoria/etapa.
4.  **Explorar os Itens Detalhados:**
    *   Vá para a aba "Itens Detalhados".
    *   **Navegar pela Tabela:** Role a tabela para ver todos os insumos e serviços.
    *   **Buscar Itens:** Use o campo "Buscar insumo..." para encontrar um item específico.
    *   **Filtrar por Categoria:** Utilize o seletor "Filtrar por Categoria" para focar em grupos específicos de itens (ex: "Alvenaria", "Instalações Elétricas").
    *   **Expandir/Retrair Categorias:** Clique no nome de uma categoria para mostrar ou ocultar os itens pertencentes a ela.
    *   **Analisar Detalhes do Item:** Para cada item, observe a descrição, quantidade, unidade de medida, preço unitário, preço total e a fonte de onde o preço foi obtido.
5.  **Utilizar as Ações:**
    *   Clique em "Editar" para modificar dados como nome do orçamento, cliente, etc.
    *   Clique em "Duplicar" se precisar criar uma variação deste orçamento.
    *   Se necessário, clique em "Recalcular com IA" para que a plataforma gere uma nova estimativa (isso pode alterar os custos e itens).

## Fluxo de Trabalho Típico do Usuário

1.  **Criação:** O usuário acessa `NovoOrcamento.tsx`, preenche os dados da obra e gera um orçamento paramétrico inicial.
2.  **Listagem e Acesso:** O novo orçamento aparece em `OrcamentosLista.tsx`. O usuário pode localizar e acessar este ou outros orçamentos existentes.
3.  **Análise Detalhada:** Em `OrcamentoDetalhe.tsx`, o usuário explora o resumo, a composição de custos e, principalmente, a aba "Itens Detalhados" para entender a fundo a estimativa.
4.  **Ajustes e Recálculo (Se Necessário):** Se identificar a necessidade de ajustes nos parâmetros ou quiser uma nova estimativa, o usuário pode editar o orçamento ou usar a função de recalcular.
5.  **Gerenciamento:** O usuário utiliza as opções de duplicar, excluir ou alterar o status do orçamento conforme o ciclo de vida do projeto.

Este guia detalhado sobre as funcionalidades do módulo de orçamento visa capacitar a IA para fornecer um suporte passo a passo eficaz aos usuários da ObrasAI, tornando o processo de orçamentação mais simples, rápido e inteligente.