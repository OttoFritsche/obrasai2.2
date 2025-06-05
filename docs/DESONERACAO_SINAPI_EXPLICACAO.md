# 📊 Desoneração SINAPI - Impacto no Orçamento

## ✅ **Status da Importação**

**CONFIRMADO**: Os dados foram importados com SUCESSO!

- **Total de registros**: 7.800 composições
- **Preços SEM desoneração**: 7.800 ✅
- **Preços COM desoneração**: 7.800 ✅
- **Diferença média**: 7,19% (preços sem desoneração são maiores)

---

## 🎯 **O que é Desoneração da Folha de Pagamento?**

A **desoneração da folha de pagamento** é um benefício fiscal criado pelo
governo federal que substitui a contribuição previdenciária patronal de 20%
sobre a folha de salários por uma alíquota sobre o faturamento bruto da empresa.

### 📋 **Modalidades SINAPI**

| Modalidade          | Descrição                                      | Quando Usar                              |
| ------------------- | ---------------------------------------------- | ---------------------------------------- |
| **SEM Desoneração** | Preços com contribuição previdenciária de 20%  | Obras privadas, empresas não enquadradas |
| **COM Desoneração** | Preços com alíquota reduzida sobre faturamento | Obras públicas, empresas beneficiadas    |

---

## 💰 **Impacto Financeiro no Orçamento**

### 🔢 **Diferenças Percentuais Típicas**

Com base nos dados importados:

- **Diferença média**: 7,19%
- **Maior diferença**: 33,33% (corte e dobra de aço)
- **Menor diferença**: 0% (alguns serviços específicos)

### 📈 **Exemplos Práticos**

| Serviço                          | Sem Desoneração | Com Desoneração | Economia |
| -------------------------------- | --------------- | --------------- | -------- |
| Corte e dobra de aço CA-50 Ø20mm | R$ 0,0033/kg    | R$ 0,0022/kg    | 33,33%   |
| Transporte vertical manual       | R$ 0,80/L       | R$ 0,60/L       | 25,00%   |
| Montagem de armadura             | R$ 0,0272/kg    | R$ 0,0232/kg    | 14,71%   |

---

## 🏗️ **Aplicação no Sistema de Orçamento**

### 🎛️ **Configuração Automática**

O sistema deve permitir escolher a modalidade:

```typescript
interface ConfiguracaoOrcamento {
    modalidade: "SEM_DESONERACAO" | "COM_DESONERACAO";
    estado: EstadoBrasil;
    dataReferencia: Date;
}
```

### 🔄 **Lógica de Seleção de Preços**

```sql
-- Exemplo de consulta para buscar preço correto
SELECT 
  CASE 
    WHEN :modalidade = 'SEM_DESONERACAO' THEN preco_sem_sp
    WHEN :modalidade = 'COM_DESONERACAO' THEN preco_com_sp
  END as preco_unitario
FROM sinapi_composicoes_mao_obra
WHERE codigo_composicao = :codigo;
```

---

## 📊 **Cenários de Uso**

### 🏛️ **Obras Públicas**

- **Modalidade**: COM Desoneração
- **Justificativa**: Empresas do setor da construção civil têm direito ao
  benefício
- **Economia média**: 7,19% no custo total da obra

### 🏠 **Obras Privadas**

- **Modalidade**: SEM Desoneração (padrão)
- **Justificativa**: Nem todas as empresas são beneficiadas
- **Custo**: Valores integrais com contribuição previdenciária

### 🔄 **Obras Mistas**

- **Flexibilidade**: Permitir escolha por item ou global
- **Controle**: Auditoria de qual modalidade foi aplicada

---

## ⚖️ **Aspectos Legais e Normativos**

### 📜 **Base Legal**

- **Lei 12.844/2013**: Institui a desoneração
- **Decreto 8.426/2015**: Regulamenta a aplicação
- **Portaria MTE**: Define setores beneficiados

### 🎯 **Setores Beneficiados**

- Construção civil
- Confecção e vestuário
- Call centers
- Tecnologia da informação
- Outros setores específicos

### ⚠️ **Responsabilidades**

- **Contratante**: Verificar enquadramento da empresa
- **Contratada**: Comprovar direito ao benefício
- **Sistema**: Documentar modalidade utilizada

---

## 🚀 **Implementação no Sistema**

### 1️⃣ **Interface de Configuração**

```typescript
// Componente de seleção de modalidade
<Select>
    <Option value="SEM_DESONERACAO">
        Sem Desoneração (Padrão) - Preços integrais
    </Option>
    <Option value="COM_DESONERACAO">
        Com Desoneração - Economia média de 7,19%
    </Option>
</Select>;
```

### 2️⃣ **Cálculo Automático**

- Aplicar modalidade escolhida em todos os itens
- Mostrar comparativo de valores
- Destacar economia obtida

### 3️⃣ **Relatórios**

- Discriminar modalidade utilizada
- Mostrar economia total
- Justificar escolha técnica

---

## 📈 **Benefícios para o Usuário**

### 💡 **Transparência**

- Visualização clara das duas modalidades
- Comparativo automático de custos
- Justificativa técnica da escolha

### 💰 **Economia**

- Redução média de 7,19% nos custos
- Otimização automática por modalidade
- Análise de viabilidade financeira

### 📋 **Conformidade**

- Adequação à legislação vigente
- Documentação completa da escolha
- Auditoria facilitada

---

## 🎯 **Próximos Passos**

1. ✅ **Dados importados** - Concluído
2. 🔄 **Interface de seleção** - Em desenvolvimento
3. 📊 **Relatórios comparativos** - Planejado
4. 🔍 **Sistema de auditoria** - Planejado

---

_Última atualização: 02/06/2025_ _Dados SINAPI: Abril/2025_
