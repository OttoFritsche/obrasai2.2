# Documentação Detalhada: Funcionalidades de Despesas no ObrasAI

Este documento detalha as funcionalidades da seção de despesas do ObrasAI e fornece um guia passo a passo sobre como um usuário pode adicionar uma nova despesa. Este material será utilizado para treinar uma IA que auxiliará os usuários na utilização do sistema.

## 1. Visão Geral das Funcionalidades de Despesas

A seção de despesas do ObrasAI é uma ferramenta robusta para gerenciar todos os custos associados às suas obras. Ela permite um controle financeiro detalhado, desde o registro inicial até o acompanhamento do status de pagamento. As principais funcionalidades incluem:

*   **Listagem e Visualização:** Exibe todas as despesas registradas em uma tabela interativa, com opções de filtragem por obra, categoria e status de pagamento. Fornece métricas e tendências financeiras para uma visão rápida dos gastos.
*   **Criação de Novas Despesas:** Um formulário intuitivo para registrar novos gastos, permitindo associá-los a obras específicas, categorias, insumos e fornecedores.
*   **Integração SINAPI:** Sistema de busca e comparação com preços de referência SINAPI, permitindo análise de variação de custos e benchmarking com valores de mercado.
*   **Edição de Despesas Existentes:** Permite modificar os detalhes de uma despesa já registrada, como valor, data, status de pagamento e informações do fornecedor.
*   **Exclusão de Despesas:** Funcionalidade para remover despesas que foram registradas incorretamente ou que não são mais relevantes.
*   **Análise de Variação:** Indicadores visuais que mostram a variação percentual entre o valor real da despesa e os preços de referência SINAPI.

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

### Passo 2.1: Utilizar a Referência SINAPI (Opcional)

Entre as seções de informações básicas e financeiras, você encontrará a seção **"Referência SINAPI (Opcional)"**. Esta funcionalidade permite comparar sua despesa com preços de referência do Sistema Nacional de Pesquisa de Custos e Índices da Construção Civil (SINAPI):

#### Como Usar a Busca SINAPI:

1.  **Campo de Busca:** Digite termos relacionados ao insumo, material ou serviço que você está registrando (ex: "cimento", "pedreiro", "tinta").
2.  **Resultados da Busca:** O sistema exibirá uma lista de itens SINAPI relacionados, mostrando:
    *   Código SINAPI
    *   Descrição completa do item
    *   Preço de referência
    *   Unidade de medida
    *   Fonte dos dados (ex: "SINAPI")
    *   Estado de referência (ex: "SP", "RJ")
3.  **Seleção do Item:** Clique no item SINAPI que melhor corresponde à sua despesa.
4.  **Preenchimento Automático:** Ao selecionar um item SINAPI:
    *   O campo "Descrição" será preenchido automaticamente
    *   O campo "Unidade" será atualizado com a unidade SINAPI
    *   Os dados de referência serão armazenados para comparação

#### Indicador de Variação:

Após selecionar um item SINAPI e inserir o valor unitário da sua despesa, o sistema exibirá um **Indicador de Variação** que mostra:

*   **Variação Percentual:** Diferença entre seu preço e o preço SINAPI
*   **Classificação Visual:**
    *   🔴 **Atenção** (variação > 20%): Indica diferença significativa que pode necessitar revisão
    *   🟡 **Moderado** (variação 10-20%): Diferença moderada, dentro de faixas aceitáveis
    *   🟢 **Normal** (variação < 10%): Preço alinhado com referência SINAPI
*   **Valores de Referência:** Exibe o valor real inserido e o valor de referência SINAPI
*   **Dicas Contextuais:** Sugestões baseadas na variação encontrada

#### Benefícios da Integração SINAPI:

*   **Benchmarking:** Compare seus custos com referências nacionais
*   **Controle de Qualidade:** Identifique preços muito acima ou abaixo do mercado
*   **Padronização:** Use descrições e unidades padronizadas do SINAPI
*   **Análise de Tendências:** Acompanhe variações de preço ao longo do tempo
*   **Relatórios:** Gere relatórios com análises comparativas de custos

### Passo 3: Salvar a Despesa

1.  Após preencher todos os campos obrigatórios e relevantes, clique no botão `Salvar` ou `Registrar Despesa`.
2.  Você receberá uma notificação de sucesso e será redirecionado para a lista de despesas ou para a página de onde você iniciou a criação da despesa.

## 3. Estrutura de Dados Relevante (Supabase)

As informações das despesas são armazenadas no Supabase, seguindo uma estrutura que permite a integração com outras entidades do sistema:

*   **Tabela `despesas`:**
    *   `id`: Identificador único da despesa.
    *   `descricao`: Descrição da despesa.
    *   `obra_id`: Chave estrangeira que referencia a tabela `obras`, vinculando a despesa a uma obra específica.
    *   `categoria`: Categoria da despesa (ex: Material, Mão de Obra).
    *   `insumo`: Detalhe do insumo ou serviço.
    *   `etapa`: Etapa da obra.
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
    *   **Campos SINAPI (Novos):**
        *   `codigo_sinapi`: Código do item SINAPI selecionado (ex: "74209/001").
        *   `valor_referencia_sinapi`: Valor de referência do SINAPI para o item.
        *   `variacao_sinapi`: Variação percentual calculada entre o valor real e o valor SINAPI.
        *   `fonte_sinapi`: Fonte dos dados SINAPI (ex: "SINAPI").
        *   `estado_referencia`: Estado de referência dos preços SINAPI (ex: "SP", "RJ").

*   **Relacionamentos:**
    *   `despesas` se relaciona com `obras` (muitas despesas para uma obra).
    *   `despesas` se relaciona com `fornecedores_pj` e `fornecedores_pf` (muitas despesas para um fornecedor).
    *   `despesas` se relaciona implicitamente com a tabela de `perfis` ou `usuários` através do `tenant_id` para controle de acesso e multi-tenancy.

## 4. Funcionalidades Técnicas da Integração SINAPI

### 4.1 Sistema de Busca Inteligente

O sistema utiliza funções SQL otimizadas para buscar itens SINAPI:

*   **Busca Unificada:** Função `buscar_sinapi_unificado` que pesquisa em múltiplas tabelas SINAPI
*   **Busca por Código:** Função `buscar_sinapi_por_codigo` para localizar itens específicos
*   **Filtros Avançados:** Suporte a filtros por estado, fonte e tipo de item
*   **Paginação:** Sistema de paginação para otimizar performance em grandes volumes de dados

### 4.2 Componentes de Interface

*   **SinapiSelectorDespesas:** Componente de busca e seleção de itens SINAPI
*   **VariacaoSinapiIndicator:** Componente visual para exibir variações de preço
*   **Integração com Formulários:** Preenchimento automático de campos baseado na seleção SINAPI

### 4.3 Cálculos de Variação

O sistema calcula automaticamente:

*   **Variação Percentual:** `((valor_real - valor_sinapi) / valor_sinapi) * 100`
*   **Classificação de Severidade:** Baseada em faixas de variação pré-definidas
*   **Indicadores Visuais:** Cores e ícones que facilitam a interpretação rápida

## 5. Orientações para Treinamento de IA

### 5.1 Cenários de Uso Comum

**Cenário 1: Usuário quer comparar preço de cimento**
- Orientar para usar a busca SINAPI com termo "cimento"
- Explicar como selecionar o tipo correto (CP II, CP III, etc.)
- Mostrar como interpretar o indicador de variação

**Cenário 2: Preço muito acima do SINAPI**
- Explicar que variações altas podem indicar:
  - Qualidade superior do material
  - Localização geográfica específica
  - Condições de mercado locais
  - Necessidade de renegociação com fornecedor

**Cenário 3: Preço muito abaixo do SINAPI**
- Alertar para possíveis questões:
  - Qualidade inferior do material
  - Promoções temporárias
  - Erros de digitação
  - Necessidade de verificação

### 5.2 Dicas para Orientação de Usuários

*   **Busca Eficiente:** Orientar uso de termos específicos ("cimento CP II" ao invés de apenas "cimento")
*   **Interpretação de Variações:** Explicar que variações de até 10% são normais
*   **Uso Opcional:** Enfatizar que a referência SINAPI é opcional e complementar
*   **Contexto Regional:** Lembrar que preços SINAPI são referências nacionais e podem variar regionalmente

### 5.3 Troubleshooting Comum

*   **Nenhum resultado na busca:** Sugerir termos mais genéricos ou sinônimos
*   **Item SINAPI não corresponde:** Orientar seleção do item mais próximo disponível
*   **Variação muito alta:** Explicar fatores que podem influenciar a diferença
*   **Campos não preenchidos automaticamente:** Verificar se a seleção foi realizada corretamente

Este documento serve como base para o treinamento da IA, garantindo que ela possa orientar os usuários de forma precisa e eficiente sobre a gestão de despesas no ObrasAI, incluindo o uso avançado das funcionalidades de integração SINAPI para análise e controle de custos.