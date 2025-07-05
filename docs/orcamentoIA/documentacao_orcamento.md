# Documentação Detalhada: Funcionalidades de Orçamento Paramétrico no ObrasAI

Este documento detalha as funcionalidades do módulo de orçamento paramétrico do ObrasAI e fornece um guia passo a passo sobre como um usuário pode criar um novo orçamento usando inteligência artificial. Este material será utilizado para treinar uma IA que auxiliará os usuários na utilização do sistema.

## 1. Visão Geral das Funcionalidades de Orçamento Paramétrico

O módulo de orçamento paramétrico do ObrasAI é uma ferramenta avançada que utiliza inteligência artificial para gerar estimativas de custos precisas e detalhadas para projetos de construção civil. O sistema combina dados técnicos, coeficientes regionais e algoritmos de IA para criar orçamentos completos em minutos. As principais funcionalidades incluem:

*   **Wizard Inteligente Multi-Etapas:** Interface guiada em 4 etapas que coleta informações essenciais do projeto de forma intuitiva e progressiva.
*   **Cálculo Automático com IA:** Processamento inteligente que gera automaticamente mais de 35 itens distribuídos em 11 etapas construtivas diferentes.
*   **Integração com Dados Regionais:** Utilização de bases de custos regionais (CUB, SINAPI, dados históricos) para garantir precisão geográfica.
*   **Análise Paramétrica Avançada:** Sistema que considera tipo de obra, padrão construtivo, localização e especificações técnicas para cálculos precisos.
*   **Validação Inteligente:** Schemas de validação robustos que garantem a qualidade e consistência dos dados inseridos.
*   **Visualização Detalhada:** Interface completa para visualização dos resultados com análises, métricas e sugestões da IA.
*   **Conversão para Obra Real:** Funcionalidade para converter orçamentos aprovados em projetos reais no sistema.

## 2. Como Criar um Orçamento Paramétrico (Passo a Passo)

Para criar um novo orçamento paramétrico no ObrasAI, siga os passos detalhados abaixo:

### Passo 1: Acessar o Módulo de Orçamento

1.  No painel de controle do ObrasAI, navegue até a seção de `Orçamentos`.
2.  Clique no botão `Novo Orçamento` ou `Orçamento IA` (geralmente localizado no canto superior direito da tela).
3.  Você será direcionado para a interface do wizard de orçamento paramétrico.

### Passo 2: Etapa 1 - Dados Básicos da Obra

A primeira etapa coleta as informações fundamentais do projeto:

#### Campos Obrigatórios:
*   **Nome do Orçamento:** Digite um nome descritivo para identificar seu orçamento (mínimo 3 caracteres, máximo 100).
    - Exemplo: "Residência Unifamiliar - João Silva"
    - Exemplo: "Reforma Comercial - Loja Centro"

*   **Tipo de Obra:** Selecione o tipo de construção no menu dropdown:
    - **Residência Unifamiliar (R1):** Casa individual/sobrado
    - **Residência Multifamiliar (R4):** Prédios residenciais/condomínios
    - **Comércio - Loja:** Estabelecimentos comerciais de varejo
    - **Comércio - Escritório:** Espaços corporativos e administrativos
    - **Comércio - Galpão:** Armazéns e espaços industriais leves
    - **Industrial Leve:** Fábricas de pequeno/médio porte
    - **Industrial Pesada:** Complexos industriais de grande porte
    - **Institucional:** Escolas, hospitais, órgãos públicos
    - **Reforma Residencial:** Reformas em residências
    - **Reforma Comercial:** Reformas em estabelecimentos comerciais

*   **Padrão da Obra:** Escolha o nível de acabamento:
    - **Popular:** Acabamentos básicos, materiais econômicos
    - **Normal:** Acabamentos intermediários, boa relação custo-benefício
    - **Alto:** Acabamentos superiores, materiais de qualidade
    - **Luxo:** Acabamentos premium, materiais importados/especiais

#### Campo Opcional:
*   **Descrição:** Informações adicionais sobre o projeto (máximo 500 caracteres)
    - Exemplo: "Casa térrea com 3 quartos, 2 banheiros, sala, cozinha e área de serviço"

### Passo 3: Etapa 2 - Localização

A segunda etapa define a localização geográfica do projeto:

#### Campos Obrigatórios:
*   **Estado:** Selecione o estado brasileiro (sigla de 2 letras)
    - O sistema utiliza esta informação para aplicar índices regionais de custo
    - Exemplo: SP, RJ, MG, RS, etc.

*   **Cidade:** Digite o nome da cidade onde será executada a obra
    - Mínimo 2 caracteres, máximo 100
    - Exemplo: "São Paulo", "Rio de Janeiro", "Belo Horizonte"

#### Campo Opcional:
*   **CEP:** Código postal no formato 00000-000
    - Quando preenchido, o sistema pode buscar automaticamente dados complementares
    - Permite maior precisão nos cálculos regionais

#### Funcionalidade de Busca por CEP:
Se você inserir um CEP válido, o sistema pode:
- Preencher automaticamente a cidade
- Validar a consistência estado/cidade
- Aplicar índices de custo mais precisos para a região

### Passo 4: Etapa 3 - Áreas e Metragens

A terceira etapa coleta as informações dimensionais do projeto:

#### Campo Obrigatório:
*   **Área Total (m²):** Área total do projeto em metros quadrados
    - Valor mínimo: 0.01 m²
    - Valor máximo: 999.999 m²
    - Este é o principal parâmetro para os cálculos paramétricos
    - Exemplo: 120.50 (para uma casa de 120,5 m²)

#### Campos Opcionais:
*   **Área Construída (m²):** Área efetivamente construída (pode ser diferente da área total)
    - Útil para projetos com áreas descobertas, terraços, etc.
    - Se não preenchida, o sistema assume que é igual à área total

*   **Áreas Detalhadas:** Especificação de áreas por ambiente/função
    - Campo avançado para projetos complexos
    - Permite maior precisão nos cálculos por ambiente
    - Exemplo: {"quartos": 45.0, "banheiros": 12.0, "cozinha": 15.0}

#### Dicas Importantes para Áreas:
- **Seja Preciso:** A área total é o principal fator de cálculo. Medições precisas resultam em orçamentos mais exatos.
- **Considere o Tipo:** Para reformas, informe apenas a área que será efetivamente trabalhada.
- **Áreas Externas:** Inclua áreas como varandas e terraços se receberão acabamentos.

### Passo 5: Etapa 4 - Especificações Técnicas e Parâmetros

A quarta e última etapa permite definir especificações técnicas avançadas:

#### Campos Opcionais Avançados:
*   **Especificações Técnicas:** Detalhes técnicos específicos do projeto
    - Tipo de fundação (sapata, radier, estaca)
    - Sistema estrutural (concreto armado, metálica, madeira)
    - Tipo de cobertura (laje, telha cerâmica, telha metálica)
    - Padrão de instalações (básico, intermediário, avançado)
    - Acabamentos específicos (porcelanato, cerâmica, laminado)

*   **Parâmetros de Entrada:** Configurações específicas para o cálculo
    - Margem de segurança desejada (padrão: 15%)
    - Incluir equipamentos (sim/não)
    - Considerar mão de obra especializada
    - Fator de complexidade do projeto

#### Exemplos de Especificações por Tipo de Obra:

**Para Residência Unifamiliar:**
```
{
  "fundacao": "sapata_corrida",
  "estrutura": "concreto_armado",
  "cobertura": "telha_ceramica",
  "piso_interno": "ceramica_45x45",
  "piso_externo": "concreto_desempenado",
  "pintura": "latex_acrilico",
  "instalacoes": "padrao_normal"
}
```

**Para Comércio - Loja:**
```
{
  "fundacao": "radier",
  "estrutura": "concreto_armado",
  "cobertura": "laje_impermeabilizada",
  "piso": "porcelanato_60x60",
  "forro": "gesso_acartonado",
  "pintura": "tinta_epoxi",
  "instalacoes": "comercial_trifasico"
}
```

### Passo 6: Finalização e Processamento

1.  **Revisão Final:** Antes de finalizar, revise todas as informações inseridas nas 4 etapas.
2.  **Clique em "Finalizar":** O botão estará habilitado apenas quando todos os campos obrigatórios estiverem preenchidos.
3.  **Processamento da IA:** O sistema iniciará o cálculo automático:
    - Análise dos parâmetros inseridos
    - Aplicação de coeficientes técnicos
    - Consulta a bases de dados regionais
    - Geração de mais de 35 itens em 11 etapas construtivas
    - Cálculo de custos por categoria (material, mão de obra, equipamentos)

4.  **Tempo de Processamento:** O cálculo geralmente leva entre 30 segundos a 2 minutos, dependendo da complexidade.

5.  **Redirecionamento:** Após a conclusão, você será automaticamente direcionado para a página de visualização do orçamento.

## 3. Estrutura de Dados e Validações

O sistema utiliza schemas de validação robustos para garantir a qualidade dos dados:

### 3.1 Validações por Etapa

**Etapa 1 - Dados Básicos:**
- Nome do orçamento: 3-100 caracteres
- Tipo de obra: deve ser um dos valores válidos do enum
- Padrão da obra: deve ser um dos valores válidos do enum
- Descrição: máximo 500 caracteres (opcional)

**Etapa 2 - Localização:**
- Estado: exatamente 2 caracteres maiúsculos (ex: SP, RJ)
- Cidade: 2-100 caracteres
- CEP: formato brasileiro 00000-000 (opcional)

**Etapa 3 - Áreas:**
- Área total: obrigatória, entre 0.01 e 999.999 m²
- Área construída: opcional, deve ser positiva
- Áreas detalhadas: opcional, objeto com valores numéricos positivos

**Etapa 4 - Especificações:**
- Especificações técnicas: opcional, objeto flexível
- Parâmetros de entrada: opcional, objeto flexível

### 3.2 Tipos de Obra Suportados

O sistema suporta os seguintes tipos de obra com suas respectivas características:

| Tipo | Código | Características |
|------|--------|----------------|
| Residência Unifamiliar | R1_UNIFAMILIAR | Casas, sobrados, residências individuais |
| Residência Multifamiliar | R4_MULTIFAMILIAR | Prédios, condomínios, apartamentos |
| Comércio - Loja | COMERCIAL_LOJA | Lojas, estabelecimentos de varejo |
| Comércio - Escritório | COMERCIAL_ESCRITORIO | Escritórios, salas comerciais |
| Comércio - Galpão | COMERCIAL_GALPAO | Galpões comerciais, armazéns |
| Industrial Leve | INDUSTRIAL_LEVE | Fábricas de pequeno/médio porte |
| Industrial Pesada | INDUSTRIAL_PESADA | Complexos industriais grandes |
| Institucional | INSTITUCIONAL | Escolas, hospitais, órgãos públicos |
| Reforma Residencial | REFORMA_RESIDENCIAL | Reformas em residências |
| Reforma Comercial | REFORMA_COMERCIAL | Reformas comerciais/industriais |

### 3.3 Padrões Construtivos

| Padrão | Características | Faixa de Custo |
|--------|----------------|----------------|
| **Popular** | Acabamentos básicos, materiais econômicos | Menor custo |
| **Normal** | Acabamentos intermediários, boa qualidade | Custo médio |
| **Alto** | Acabamentos superiores, materiais de qualidade | Custo elevado |
| **Luxo** | Acabamentos premium, materiais importados | Maior custo |

## 4. Funcionalidades Técnicas da IA Paramétrica

### 4.1 Sistema de Cálculo Inteligente

A IA paramétrica utiliza múltiplas fontes de dados e algoritmos avançados:

*   **Bases de Dados Regionais:** Integração com CUB, SINAPI e dados históricos
*   **Coeficientes Técnicos:** Aplicação de coeficientes por m² baseados em normas técnicas (TCPO, SINAPI)
*   **Índices Regionais:** Ajustes automáticos baseados na localização geográfica
*   **Análise Paramétrica:** Consideração de tipo, padrão e especificações técnicas
*   **Machine Learning:** Aprendizado contínuo baseado em dados históricos do sistema

### 4.2 Estrutura de Itens Gerados

O sistema gera automaticamente itens organizados em categorias:

**Categorias de Custo:**
- Material de Construção (40-50% do total)
- Mão de Obra (30-35% do total)
- Aluguel de Equipamentos (5-10% do total)
- Transporte e Frete (2-5% do total)
- Taxas e Licenças (1-3% do total)
- Serviços Terceirizados (5-10% do total)
- Administrativo (2-5% do total)
- Imprevistos (5-10% do total)

**Etapas Construtivas:**
1. Planejamento e Projetos
2. Demolição (se aplicável)
3. Terraplanagem e Movimento de Terra
4. Fundação
5. Estrutura
6. Alvenaria e Vedações
7. Cobertura
8. Instalações Elétricas
9. Instalações Hidráulicas
10. Revestimentos e Acabamentos
11. Limpeza e Entrega

### 4.3 Métricas de Qualidade

O sistema fornece indicadores de qualidade da estimativa:

*   **Confiança da Estimativa:** Percentual de confiança (0-100%)
*   **Margem de Erro Estimada:** Faixa de variação esperada (padrão: ±15%)
*   **Score de Precisão:** Baseado na qualidade dos dados de entrada
*   **Fatores de Risco:** Identificação de elementos que podem afetar o custo

## 5. Interpretação dos Resultados

### 5.1 Tela de Resultados

Após o processamento, o usuário visualiza:

*   **Resumo Executivo:** Custo total, custo por m², margem de erro
*   **Gráficos de Distribuição:** Custos por categoria e por etapa
*   **Lista Detalhada de Itens:** Todos os itens com quantidades, preços unitários e totais
*   **Análises da IA:** Sugestões, alertas e recomendações
*   **Comparações:** Benchmarks com projetos similares (quando disponível)

### 5.2 Indicadores Visuais

*   **🟢 Verde:** Estimativa dentro da faixa normal para o tipo/padrão
*   **🟡 Amarelo:** Estimativa com variações moderadas, requer atenção
*   **🔴 Vermelho:** Estimativa com desvios significativos, requer revisão

### 5.3 Sugestões da IA

O sistema pode fornecer sugestões como:
- "Considere especificar o tipo de fundação para maior precisão"
- "Área informada está acima da média para este tipo de obra"
- "Padrão selecionado pode impactar significativamente o custo de acabamentos"
- "Localização pode ter variações de custo devido a fatores logísticos"

## 6. Ações Pós-Criação

### 6.1 Opções Disponíveis

Após criar o orçamento, o usuário pode:

*   **Visualizar Detalhes:** Ver todos os itens e análises completas
*   **Editar Parâmetros:** Modificar dados de entrada e recalcular
*   **Exportar Relatório:** Gerar PDF ou Excel com o orçamento completo
*   **Converter em Obra:** Transformar o orçamento em um projeto real
*   **Compartilhar:** Enviar para clientes ou equipe
*   **Duplicar:** Criar novo orçamento baseado no atual

### 6.2 Conversão para Obra Real

Quando o orçamento é aprovado, pode ser convertido em obra:
1. Clique em "Converter em Obra"
2. Confirme os dados básicos
3. Defina cronograma inicial
4. O sistema criará automaticamente:
   - Registro da obra
   - Estrutura de custos
   - Itens de controle
   - Baseline para acompanhamento

## 7. Orientações para Treinamento de IA

### 7.1 Cenários de Uso Comum

**Cenário 1: Usuário iniciante criando primeiro orçamento**
- Orientar sobre a importância de dados precisos
- Explicar cada etapa do wizard
- Destacar campos obrigatórios vs opcionais
- Mostrar como interpretar os resultados

**Cenário 2: Usuário experiente buscando precisão**
- Enfatizar uso de especificações técnicas detalhadas
- Orientar sobre áreas detalhadas por ambiente
- Explicar como parâmetros avançados afetam o cálculo
- Mostrar análises comparativas

**Cenário 3: Orçamento para apresentação a cliente**
- Orientar sobre escolha adequada de padrão construtivo
- Explicar como apresentar margem de erro
- Mostrar opções de exportação e relatórios
- Destacar elementos de credibilidade (fontes de dados)

### 7.2 Dicas para Orientação de Usuários

*   **Precisão de Dados:** Enfatizar que dados mais precisos geram orçamentos mais confiáveis
*   **Tipo de Obra:** Explicar as diferenças entre tipos e como isso afeta o cálculo
*   **Padrão Construtivo:** Orientar sobre a escolha adequada baseada no público-alvo
*   **Localização:** Destacar a importância da localização nos custos regionais
*   **Áreas:** Orientar sobre medições precisas e consideração de áreas específicas
*   **Especificações:** Explicar quando vale a pena detalhar especificações técnicas

### 7.3 Troubleshooting Comum

**Problema: "Área total é obrigatória"**
- Verificar se o campo está preenchido
- Confirmar que o valor é maior que 0.01
- Verificar se não há caracteres especiais

**Problema: "Estado inválido"**
- Verificar se está usando sigla de 2 letras
- Confirmar que está em maiúsculas (SP, RJ, MG)
- Verificar se é um estado brasileiro válido

**Problema: "CEP inválido"**
- Verificar formato 00000-000
- Confirmar que são apenas números
- Lembrar que o CEP é opcional

**Problema: "Processamento demorado"**
- Explicar que cálculos complexos podem levar até 2 minutos
- Orientar a não fechar a página durante o processamento
- Sugerir verificar conexão com internet

**Problema: "Resultado muito alto/baixo"**
- Verificar se tipo e padrão estão corretos
- Confirmar área informada
- Revisar especificações técnicas
- Explicar variações regionais

### 7.4 Boas Práticas

*   **Sempre revisar dados antes de finalizar**
*   **Usar especificações técnicas para projetos complexos**
*   **Considerar margem de segurança adequada**
*   **Comparar com projetos similares quando possível**
*   **Documentar premissas utilizadas**
*   **Atualizar orçamentos periodicamente**
*   **Validar resultados com profissionais experientes**

## 8. Integração com Outros Módulos

### 8.1 Integração com Obras

*   **Criação Direta:** Orçamentos podem ser criados diretamente de uma obra existente
*   **Conversão:** Orçamentos aprovados podem ser convertidos em obras
*   **Comparação:** Sistema permite comparar orçado vs realizado
*   **Aprendizado:** Dados reais alimentam a IA para melhorar futuras estimativas

### 8.2 Integração com Despesas

*   **Baseline:** Orçamento serve como baseline para controle de custos
*   **Alertas:** Sistema alerta quando gastos excedem o orçado
*   **Análise de Desvios:** Comparação automática entre previsto e realizado
*   **Relatórios:** Relatórios integrados de performance orçamentária

### 8.3 Integração com SINAPI

*   **Preços de Referência:** Utilização de preços SINAPI como base
*   **Atualizações:** Preços são atualizados automaticamente
*   **Comparações:** Indicadores de variação em relação aos preços oficiais
*   **Validação:** Validação de estimativas contra referências nacionais

Este documento serve como base completa para o treinamento da IA, garantindo que ela possa orientar os usuários de forma precisa e eficiente sobre a criação e utilização de orçamentos paramétricos no ObrasAI, desde conceitos básicos até funcionalidades avançadas.