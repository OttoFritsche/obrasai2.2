# Documentação Detalhada: Funcionalidades de Controle Orçamentário no ObrasAI

Este documento detalha as funcionalidades do módulo de **Controle Orçamentário
Inteligente** do ObrasAI e fornece um guia passo a passo sobre como um usuário
pode utilizar esta ferramenta para ter total controle financeiro de suas obras.
Este material será utilizado para treinar uma IA que auxiliará os usuários na
utilização do sistema.

## 1. Visão Geral das Funcionalidades de Controle Orçamentário

O **Controle Orçamentário Inteligente** é uma das ferramentas mais poderosas do
ObrasAI, projetada para fornecer uma visão completa e inteligente da situação
financeira de todas as obras do usuário. O sistema faz uma **diferenciação clara
e fundamental** entre dois conceitos orçamentários:

### Conceitos Fundamentais:

1. **Orçamento Disponível (Dinheiro Investido):**
   - É o capital real que o usuário possui ou investiu na obra
   - Representa o limite financeiro real para execução do projeto
   - Usado para controle de caixa e fluxo financeiro
   - Exemplo: "Tenho R$ 200.000 para construir esta casa"

2. **Orçamento Paramétrico (Estimativa de Gastos):**
   - É uma estimativa técnica de quanto a obra vai custar
   - Gerado por inteligência artificial baseada em SINAPI/CUB
   - Usado para planejamento e comparação de eficiência
   - Exemplo: "A IA estima que esta casa custará R$ 180.000"

### Funcionalidades Principais:

- **Dashboard Consolidado:** Visão unificada de todas as obras com métricas
  financeiras inteligentes
- **Análise Comparativa:** Comparação entre orçamento disponível, gasto real e
  estimativas paramétricas
- **Sistema de Alertas Inteligentes:** Alertas automáticos baseados em IA para
  situações críticas
- **Projeções Financeiras:** Projeção de gastos baseada na tendência atual
  (Burn-Up Chart)
- **Comparativo com SINAPI:** Análise de custo por m² em relação às referências
  de mercado
- **Recomendações Automatizadas:** Sugestões inteligentes para otimização
  financeira
- **Controle de Risco:** Classificação automática de risco financeiro por obra

## 2. Como Acessar e Navegar no Controle Orçamentário

### Passo 1: Acessar o Módulo

1. No menu principal do ObrasAI, clique em `Controle Orçamentário`
2. Você será direcionado para o dashboard principal com todas as análises
3. A página carrega automaticamente dados de todas as suas obras ativas

### Passo 2: Compreender o Cabeçalho

O cabeçalho apresenta:

- **Título:** "Controle Orçamentário Inteligente"
- **Descrição:** Explicação sobre a diferenciação entre orçamento disponível e
  estimativas
- **Botão "Novo Orçamento Paramétrico":** Permite criar orçamentos IA para obras
  existentes

### Passo 3: Interpretar as Métricas Consolidadas

O sistema exibe 6 cards principais com métricas consolidadas:

#### Card 1: Orçamento Disponível

- **Valor:** Soma total do dinheiro investido/disponível em todas as obras
- **Descrição:** "Dinheiro Investido"
- **Tooltip:** "Total de dinheiro disponível/investido para todas as obras"
- **Cor:** Azul (indica capital disponível)

#### Card 2: Total Executado

- **Valor:** Soma de todos os gastos realizados em todas as obras
- **Descrição:** Percentual do orçamento disponível já consumido
- **Indicador:** Badge verde (dentro do orçamento) ou vermelho (estourado)
- **Tooltip:** "Total já gasto em todas as obras"

#### Card 3: Saldo Disponível

- **Valor:** Diferença entre orçamento disponível e total gasto
- **Cor:** Verde (positivo) ou vermelho (negativo/estourado)
- **Descrição:** "Disponível para gastar" ou "Orçamento estourado"
- **Tooltip:** "Quanto ainda resta do orçamento disponível"

#### Card 4: Estimativa Paramétrica

- **Valor:** Soma das estimativas de IA para todas as obras
- **Descrição:** "Baseado em IA/SINAPI"
- **Cor:** Roxo (diferencia das métricas reais)
- **Tooltip:** "Estimativa de custo total baseada em orçamentos paramétricos"

#### Card 5: Precisão Estimativas

- **Valor:** Percentual médio de precisão das estimativas IA
- **Cor:** Verde (>80%), Amarelo (60-80%), Vermelho (<60%)
- **Descrição:** "Acurácia IA"
- **Tooltip:** "Quão precisas têm sido as estimativas paramétricas"

#### Card 6: Obras em Risco

- **Valor:** Número de obras com problemas financeiros
- **Cor:** Verde (0 obras) ou vermelho (obras com risco)
- **Descrição:** Percentual do total de obras
- **Tooltip:** "Obras com risco financeiro ou orçamento crítico"

## 3. Navegação pelas Abas do Sistema

O sistema possui 4 abas principais para análise detalhada:

### 3.1 Aba "Controle Financeiro" (Padrão)

Esta é a aba principal que apresenta:

#### Seção Esquerda: Controle por Obra

Cards individuais para cada obra mostrando:

**Cabeçalho do Card:**

- Nome da obra e localização (cidade, estado)
- Badge de status financeiro:
  - ✅ **Saudável:** Obra dentro do orçamento e sem riscos
  - ⚠️ **Atenção:** Consumo alto do orçamento (75-90%)
  - 🚨 **Risco:** Consumo crítico do orçamento (90%+)
  - 🔴 **Crítico:** Orçamento estourado

**Informações Financeiras:**

- **Orçamento Disponível:** Capital total disponível para a obra
- **Total Executado:** Valor já gasto na obra
- **Saldo Disponível:** Valor restante (pode ser negativo)

**Barra de Progresso Orçamentária:**

- Mostra visualmente o percentual consumido do orçamento
- Cores diferenciadas por nível de risco
- Percentual exato ao lado da barra

**Comparação com Estimativa (se disponível):**

- Exibe a estimativa paramétrica da IA
- Calcula o desvio entre gasto real e estimativa
- Mostra precisão da estimativa em percentual

**Botões de Ação:**

- **👁️ Visualizar:** Ver detalhes completos da obra
- **✏️ Editar:** Modificar dados da obra
- **🧮 Orçamento IA:** Criar/ver orçamento paramétrico

#### Seção Direita: Gráfico Consolidado

Gráfico de barras comparativo mostrando para cada obra:

- **Barra Azul:** Orçamento disponível
- **Barra Verde:** Total gasto
- **Barra Roxa:** Estimativa paramétrica (quando disponível)

### 3.2 Aba "Comparativo"

Analisa o custo por m² das obras em relação às referências SINAPI:

**Quando Exibir:**

- Funciona apenas para obras com orçamento paramétrico criado
- Compara o custo estimado pela IA com dados SINAPI oficiais

**Layout do Comparativo:**

- **Card Esquerdo:** "Sua Estimativa" - Custo/m² calculado pela IA
- **Centro:** Indicador visual de variação com badge colorido
- **Card Direito:** "Referência de Mercado" - Custo/m² SINAPI

**Interpretação das Variações:**

- **Verde (abaixo):** Sua estimativa está abaixo da referência SINAPI
- **Vermelho (acima):** Sua estimativa está acima da referência SINAPI
- **Percentual:** Mostra exatamente quanto de diferença

**Informações Adicionais:**

- Fonte da referência (SINAPI, CUB, etc.)
- Data base dos dados de referência
- Considerações sobre tipo e padrão da obra

### 3.3 Aba "Projeções"

Apresenta gráfico Burn-Up Chart com projeção financeira:

**Componentes do Gráfico:**

- **Área Verde:** Gastos reais acumulados ao longo do tempo
- **Linha Roxa Tracejada:** Projeção de gastos baseada na tendência atual
- **Linha Vermelha:** Limite do orçamento disponível

**Como Interpretar:**

- Se a projeção roxa cruza a linha vermelha: risco de estouro
- Se a área verde está abaixo da tendência esperada: obra econômica
- Velocidade de crescimento da área verde: ritmo de gastos

**Dados Utilizados:**

- Apenas despesas operacionais (exclui aquisição de terreno)
- Baseado no histórico real de gastos da obra
- Projeção matemática até a data prevista de término

### 3.4 Aba "Alertas"

Mostra alertas e recomendações inteligentes por obra:

**Tipos de Alertas (Vermelho):**

- ⚠️ Orçamento estourado com valor específico
- 🚨 Alto percentual do orçamento já consumido
- 📈 Projeção indica possível estouro futuro
- 📊 Grande desvio da estimativa paramétrica
- 💳 Alto valor em despesas pendentes de pagamento
- 📊 Obra sem orçamento paramétrico

**Tipos de Recomendações (Azul):**

- Revisar escopo ou solicitar aporte adicional
- Controlar rigorosamente próximos gastos
- Revisar cronograma e otimizar custos
- Criar orçamento paramétrico para melhor controle
- Priorizar quitação de despesas pendentes
- ✅ Obra com controle financeiro exemplar
- 💰 Obra abaixo do orçamento previsto

## 4. Fluxo de Trabalho Completo do Usuário

### Cenário 1: Usuário Iniciante (Primeira Vez)

1. **Acesso Inicial:**
   - Usuário acessa "Controle Orçamentário"
   - Vê métricas consolidadas de suas obras

2. **Interpretação dos Dados:**
   - Verifica se há obras com status "Risco" ou "Crítico"
   - Analisa o saldo disponível total
   - Observa alertas na aba correspondente

3. **Ações Recomendadas:**
   - Para obras sem orçamento paramétrico: clicar em "Novo Orçamento
     Paramétrico"
   - Para obras com problemas: seguir recomendações dos alertas
   - Monitorar projeções na aba específica

### Cenário 2: Usuário Experiente (Monitoramento Regular)

1. **Check-up Financeiro:**
   - Verificação rápida das métricas consolidadas
   - Análise da precisão das estimativas

2. **Análise Detalhada:**
   - Comparação com referências SINAPI (aba "Comparativo")
   - Verificação de projeções (aba "Projeções")
   - Review de novos alertas (aba "Alertas")

3. **Tomada de Decisões:**
   - Ajustes de orçamento baseados nas projeções
   - Renegociação com fornecedores se custos acima do SINAPI
   - Revisão de cronograma se projeção indica estouro

### Cenário 3: Situação de Crise (Orçamento Crítico)

1. **Identificação do Problema:**
   - Status "Crítico" no card da obra
   - Alertas vermelhos específicos

2. **Análise da Situação:**
   - Verificar exatamente quanto foi o estouro
   - Analisar a projeção para entender tendência futura
   - Comparar com estimativas para ver se o problema era previsível

3. **Ações Corretivas:**
   - Revisar escopo da obra
   - Solicitar aporte adicional
   - Renegociar contratos e fornecedores
   - Ajustar cronograma

## 5. Estrutura de Dados e Integrações

### 5.1 Dados Utilizados pelo Sistema

**Tabelas Principais:**

- `obras`: Dados básicos das obras e orçamento disponível
- `despesas`: Histórico de todos os gastos por obra
- `orcamentos_parametricos`: Estimativas geradas pela IA
- `bases_custos_regionais`: Dados SINAPI/CUB para comparação

**Cálculos Realizados:**

- **Saldo Disponível:** `obra.orcamento - soma(despesas.custo)`
- **Percentual Consumido:** `(total_gasto / orcamento_disponivel) * 100`
- **Desvio Estimativa:** `((gasto_real - estimativa_ia) / estimativa_ia) * 100`
- **Projeção Gasto Final:** `velocidade_gasto_diaria * dias_totais_obra`

### 5.2 Sistema de Classificação de Risco

**Algoritmo de Classificação:**

1. **Crítico:** Saldo disponível negativo (orçamento estourado)
2. **Risco:** Mais de 90% do orçamento consumido
3. **Atenção:** Entre 75% e 90% do orçamento consumido
4. **Saudável:** Menos de 75% do orçamento consumido

**Fatores Agravantes:**

- Projeção indica estouro futuro
- Alto valor em despesas pendentes
- Grande desvio da estimativa paramétrica

### 5.3 Exclusões e Filtros

**Despesas Excluídas das Projeções:**

- Aquisição de terreno (categoria `AQUISICAO_TERRENO_AREA`)
- Despesas não operacionais

**Motivo da Exclusão:**

- Terrenos são investimentos únicos, não recorrentes
- Projeções devem refletir apenas custos operacionais da construção

## 6. Integração com Outros Módulos

### 6.1 Integração com Obras

- **Criação de Orçamento:** Botão direto para criar orçamento paramétrico
- **Navegação:** Links diretos para visualizar/editar obras
- **Sincronização:** Dados atualizados em tempo real

### 6.2 Integração com Despesas

- **Fonte de Dados:** Todas as métricas baseadas em despesas reais
- **Filtragem:** Separação entre despesas operacionais e aquisições
- **Alertas:** Alertas automáticos sobre despesas pendentes

### 6.3 Integração com SINAPI

- **Comparações:** Análise automática de custo por m²
- **Referências:** Dados oficiais para benchmarking
- **Validação:** Verificação de estimativas contra padrões de mercado

### 6.4 Integração com IA/Orçamentos Paramétricos

- **Estimativas:** Utilização das estimativas IA para comparações
- **Precisão:** Cálculo automático da precisão das estimativas
- **Aprendizado:** Feedback para melhoria das futuras estimativas

## 7. Alertas e Notificações Inteligentes

### 7.1 Sistema de Alertas Automáticos

**Alertas Críticos (Vermelho):**

- Orçamento estourado com valor específico
- Mais de 90% do orçamento consumido
- Projeção indica estouro iminente
- Despesas pendentes acima de 15% do orçamento

**Alertas de Atenção (Amarelo):**

- Entre 75% e 90% do orçamento consumido
- Desvio significativo da estimativa (>20%)
- Velocidade de gasto acima do esperado

**Alertas Informativos (Azul):**

- Obra sem orçamento paramétrico
- Obra com desempenho financeiro exemplar
- Sugestões de otimização

### 7.2 Sistema de Recomendações

**Recomendações Corretivas:**

- Revisar escopo da obra
- Solicitar aporte adicional
- Controlar próximos gastos rigorosamente
- Priorizar quitação de pendências

**Recomendações Preventivas:**

- Criar orçamento paramétrico
- Revisar metodologia de estimativa
- Monitorar tendência de gastos

**Recomendações Positivas:**

- Reconhecimento de boa gestão
- Identificação de economia

## 8. Métricas e KPIs do Sistema

### 8.1 Métricas Financeiras Principais

- **Total Investido:** Soma de todos os orçamentos disponíveis
- **Total Executado:** Soma de todos os gastos realizados
- **Saldo Global:** Diferença entre investido e executado
- **Eficiência Orçamentária:** Percentual médio de consumo

### 8.2 Métricas de Precisão IA

- **Precisão Média:** Quão próximas as estimativas estão dos gastos reais
- **Desvio Médio:** Diferença percentual média entre estimado e real
- **Taxa de Acerto:** Percentual de obras dentro da margem de erro

### 8.3 Métricas de Risco

- **Obras em Risco:** Número e percentual de obras com problemas
- **Valor em Risco:** Total financeiro em obras problemáticas
- **Tempo para Ação:** Urgência baseada nas projeções

## 9. Orientações para Treinamento de IA

### 9.1 Conceitos Fundamentais a Ensinar

**Diferenciação Orçamentária:**

- Sempre explicar claramente a diferença entre orçamento disponível e estimativa
- Orçamento disponível = dinheiro real que o usuário tem
- Estimativa paramétrica = quanto a IA acha que vai custar

**Interpretação de Status:**

- Verde = tudo bem, pode continuar
- Amarelo = ficar atento, monitorar de perto
- Vermelho = ação imediata necessária

### 9.2 Cenários de Orientação Comum

**Usuário Preocupado com Status "Crítico":**

- Explicar que crítico significa orçamento estourado
- Orientar para ver o valor exato do estouro
- Sugerir ações: revisar escopo, buscar aporte, renegociar contratos

**Usuário Questionando Precisão da IA:**

- Explicar que a IA aprende com dados históricos
- Mostrar que precisão melhora com mais informações
- Orientar para fornecer dados mais detalhados nas estimativas

**Usuário Confuso com Projeções:**

- Explicar que projeção é baseada na tendência atual
- Se projeção cruza orçamento = risco de estouro
- Orientar para ajustar ritmo de gastos ou aumentar orçamento

### 9.3 Perguntas Frequentes e Respostas

**P: "Por que minha obra está em risco se ainda tenho dinheiro?"** R: O sistema
projeta o futuro baseado no ritmo atual de gastos. Se continuar gastando no
mesmo ritmo, pode ficar sem dinheiro antes de terminar a obra.

**P: "A estimativa da IA está muito diferente da realidade"** R: Isso é normal
no início. A IA aprende com seus dados. Quanto mais obras você fizer, mais
precisa ela ficará para seu perfil.

**P: "Por que meu custo está acima do SINAPI?"** R: Pode ser por qualidade
superior dos materiais, localização específica, ou condições de mercado locais.
O SINAPI é uma referência, não um limite.

## 10. Boas Práticas para Usuários

### 10.1 Monitoramento Regular

- **Frequência:** Verificar o controle orçamentário semanalmente
- **Foco:** Priorizar obras com status amarelo ou vermelho
- **Ação:** Agir preventivamente nos alertas

### 10.2 Gestão Proativa

- **Orçamentos Paramétricos:** Criar para todas as obras
- **Atualizações:** Manter dados de obras atualizados
- **Comparações:** Usar referências SINAPI para negociações

### 10.3 Tomada de Decisões

- **Baseada em Dados:** Usar métricas para decisões, não intuição
- **Preventiva:** Agir nos alertas amarelos, não esperar ficar vermelho
- **Documentada:** Registrar decisões e resultados para aprendizado

---

Esta documentação serve como base completa para o treinamento da IA, garantindo
que ela possa orientar os usuários de forma precisa e eficiente sobre o uso do
Controle Orçamentário Inteligente no ObrasAI, desde conceitos básicos até
análises avançadas e tomada de decisões estratégicas.

_Última atualização: Janeiro 2025_ _Versão: 1.0.0_
