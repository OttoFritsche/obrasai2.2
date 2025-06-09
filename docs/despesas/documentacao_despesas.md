# Documentação Detalhada: Funcionalidades de Despesas no ObrasAI

Este documento detalha as funcionalidades da seção de despesas do ObrasAI e fornece um guia passo a passo sobre como um usuário pode adicionar uma nova despesa. Este material será utilizado para treinar uma IA que auxiliará os usuários na utilização do sistema.

## 1. Visão Geral das Funcionalidades de Despesas

A seção de despesas do ObrasAI é uma ferramenta robusta para gerenciar todos os custos associados às suas obras. Ela permite um controle financeiro detalhado, desde o registro inicial até o acompanhamento do status de pagamento. As principais funcionalidades incluem:

*   **Listagem e Visualização:** Exibe todas as despesas registradas em uma tabela interativa, com opções de filtragem por obra, categoria e status de pagamento. Fornece métricas e tendências financeiras para uma visão rápida dos gastos.
*   **Criação de Novas Despesas:** Um formulário intuitivo para registrar novos gastos, permitindo associá-los a obras específicas, categorias, insumos e fornecedores.
*   **Edição de Despesas Existentes:** Permite modificar os detalhes de uma despesa já registrada, como valor, data, status de pagamento e informações do fornecedor.
*   **Exclusão de Despesas:** Funcionalidade para remover despesas que foram registradas incorretamente ou que não são mais relevantes.

## 2. Como Adicionar uma Despesa (Passo a Passo)

Para adicionar uma nova despesa no ObrasAI, siga os passos abaixo:

### Passo 1: Acessar a Seção de Despesas

1.  No painel de controle do ObrasAI, navegue até a seção de `Despesas`.
2.  Procure pelo botão `Nova Despesa` (geralmente localizado no canto superior direito da tela ou em um menu de ações).

### Passo 2: Preencher o Formulário de Nova Despesa

Ao clicar em `Nova Despesa`, um formulário será exibido. Preencha os campos com as informações da sua despesa:

*   **Obra:** Selecione a obra à qual esta despesa está associada. Se você acessou o formulário a partir de uma obra específica, este campo pode já vir pré-preenchido.
*   **Descrição:** Uma breve descrição do que foi gasto (ex: "Compra de cimento", "Pagamento de mão de obra").
*   **Categoria:** Escolha a categoria que melhor se encaixa para esta despesa (ex: "Material", "Mão de Obra", "Serviços").
*   **Insumo:** Especifique o insumo relacionado à despesa (ex: "Cimento CP II", "Pedreiro", "Eletricista").
*   **Etapa:** Indique a etapa da obra em que a despesa ocorreu (ex: "Fundação", "Estrutura", "Acabamento").
*   **Unidade:** A unidade de medida do insumo (ex: "Saco", "Hora", "Serviço").
*   **Quantidade:** A quantidade do insumo adquirido ou do serviço contratado.
*   **Valor Unitário:** O custo por unidade do insumo ou serviço.
*   **Data da Despesa:** A data em que a despesa foi realizada. Utilize o seletor de data para escolher a data correta.
*   **Fornecedor (Pessoa Jurídica ou Física):** Selecione o fornecedor responsável pela despesa. Você pode escolher entre fornecedores PJ (empresas) ou PF (pessoas físicas) previamente cadastrados.
*   **Número da Nota Fiscal:** Se aplicável, insira o número da nota fiscal referente a esta despesa.
*   **Observações:** Qualquer informação adicional relevante sobre a despesa.
*   **Despesa Paga?** Marque esta caixa se a despesa já foi paga.
    *   Se marcada, dois novos campos aparecerão:
        *   **Data do Pagamento:** A data em que o pagamento foi efetuado.
        *   **Forma de Pagamento:** A forma como o pagamento foi realizado (ex: "Dinheiro", "Cartão de Crédito", "Transferência Bancária").

### Passo 3: Salvar a Despesa

1.  Após preencher todos os campos obrigatórios e relevantes, clique no botão `Salvar` ou `Registrar Despesa`.
2.  Você receberá uma notificação de sucesso e será redirecionado para a lista de despesas ou para a página de onde você iniciou a criação da despesa.

## 3. Estrutura de Dados Relevante (Supabase)

As informações das despesas são armazenadas no Supabase, seguindo uma estrutura que permite a integração com outras entidades do sistema:

*   **Tabela `despesas`:**
    *   `id`: Identificador único da despesa.
    *   `descricao`: Descrição da despesa.
    `obra_id`: Chave estrangeira que referencia a tabela `obras`, vinculando a despesa a uma obra específica.
    *   `categoria`: Categoria da despesa (ex: Material, Mão de Obra).
    *   `insumo`: Detalhe do insumo ou serviço.
    *   ``etapa`: Etapa da obra.
    *   `unidade`: Unidade de medida.
    *   `quantidade`: Quantidade.
    *   `valor_unitario`: Valor por unidade.
    *   `custo`: Custo total (calculado como `quantidade * valor_unitario`).
    *   `data_despesa`: Data em que a despesa ocorreu.
    *   `pago`: Booleano indicando se a despesa foi paga.
    *   `data_pagamento`: Data do pagamento (se `pago` for `true`).
    *   `forma_pagamento`: Forma de pagamento (se `pago` for `true`).
    *   `fornecedor_pj_id`: Chave estrangeira opcional para a tabela `fornecedores_pj`.
    *   `fornecedor_pf_id`: Chave estrangeira opcional para a tabela `fornecedores_pf`.
    *   `numero_nf`: Número da Nota Fiscal.
    *   `observacoes`: Observações adicionais.
    *   `tenant_id`: Identificador do inquilino (para suporte a multi-tenancy), garantindo que cada usuário veja apenas suas próprias despesas.

*   **Relacionamentos:**
    *   `despesas` se relaciona com `obras` (muitas despesas para uma obra).
    *   `despesas` se relaciona com `fornecedores_pj` e `fornecedores_pf` (muitas despesas para um fornecedor).
    *   `despesas` se relaciona implicitamente com a tabela de `perfis` ou `usuários` através do `tenant_id` para controle de acesso e multi-tenancy.

Este documento serve como base para o treinamento da IA, garantindo que ela possa orientar os usuários de forma precisa e eficiente sobre a gestão de despesas no ObrasAI.