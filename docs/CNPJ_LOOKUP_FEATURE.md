# 🔍 Funcionalidade de Busca Automática de CNPJ

## Descrição

Esta funcionalidade permite a busca automática de dados de empresas através do
CNPJ na página de cadastro de fornecedores PJ. Quando o usuário digita um CNPJ
válido, o sistema automaticamente consulta a API da ReceitaWS e preenche os
campos relacionados.

## 🚀 Funcionalidades Implementadas

### 1. Busca Automática

- **Trigger**: Acionada automaticamente quando um CNPJ completo e válido é
  digitado
- **Delay**: 1 segundo após a última digitação para evitar requisições
  desnecessárias
- **Validação**: CNPJ é validado antes da consulta usando algoritmo oficial

### 2. Preenchimento Automático

Os seguintes campos são preenchidos automaticamente:

- **Razão Social** ✅
- **Nome Fantasia** ✅ (se disponível)
- **Telefone Principal** ✅ (se disponível)
- **Endereço Completo** 📋 (exibido como informação adicional)

### 3. Indicadores Visuais

- **Loading**: Spinner durante a busca
- **Sucesso**: Ícone verde quando empresa ativa é encontrada
- **Aviso**: Ícone amarelo quando empresa está inativa
- **Botão Manual**: Botão de busca manual quando CNPJ é válido

### 4. Formatação Automática

- **CNPJ**: Formatado automaticamente como 00.000.000/0000-00
- **CPF**: Formatado automaticamente como 000.000.000-00
- **Telefone**: Formatado automaticamente como (00) 00000-0000
- **Dados Salvos**: Enviados sem formatação para o banco de dados

## 🛠️ Arquivos Implementados

### 1. Hook Personalizado

```typescript
// src/hooks/useCNPJLookup.ts
export const useCNPJLookup = () => {
    // Lógica de busca, validação e estado
};
```

### 2. Utilitários de Formatação

```typescript
// src/lib/utils/formatters.ts
export const formatCNPJ = (cnpj: string): string => {/* ... */};
export const formatCPF = (cpf: string): string => {/* ... */};
export const formatPhone = (phone: string): string => {/* ... */};
export const unformat = (value: string): string => {/* ... */};
```

### 3. Validações Aprimoradas

```typescript
// src/lib/validations/fornecedor.ts
// Validação de CNPJ e CPF usando algoritmos oficiais
```

### 4. API Atualizada

```typescript
// src/services/api.ts
// Remove formatação antes de salvar no banco
```

## 🔧 Como Usar

### Para o Usuário

1. Acesse a página de **Novo Fornecedor PJ**
2. Digite o CNPJ no campo correspondente
3. Aguarde a formatação automática
4. Após digitar completamente, aguarde 1 segundo
5. Os dados serão buscados e preenchidos automaticamente
6. Verifique e complete os dados faltantes
7. Salve o fornecedor

### Para Desenvolvedores

```typescript
// Usar o hook em outros componentes
const { lookupCNPJ, isLoading, data, error } = useCNPJLookup();

// Usar as funções de formatação
import { formatCNPJ, unformat } from "@/lib/utils/formatters";

const formatted = formatCNPJ("12345678000199");
const clean = unformat("12.345.678/0001-99");
```

## 🎯 API Externa Utilizada

### ReceitaWS

- **URL**: https://receitaws.com.br/v1/cnpj/{cnpj}
- **Tipo**: API pública e gratuita
- **Rate Limit**: Aproximadamente 3 requisições por minuto
- **Dados Retornados**:
  - Razão social
  - Nome fantasia
  - Situação cadastral
  - Endereço completo
  - Telefones
  - E outros dados da Receita Federal

## 🚦 Estados da Aplicação

### Loading

- Spinner no campo CNPJ
- Campos relacionados desabilitados
- Descrição: "Buscando dados do CNPJ..."

### Sucesso (Empresa Ativa)

- Ícone verde de check
- Campos preenchidos com borda verde
- Toast de sucesso
- Descrição: "✓ Empresa ativa encontrada"

### Aviso (Empresa Inativa)

- Ícone amarelo de alerta
- Toast de aviso com situação
- Campos ainda são preenchidos
- Descrição: "⚠ Empresa encontrada mas inativa"

### Erro

- Toast de erro
- Campo permanece editável
- Descrição do erro específico

## 🛡️ Validações Implementadas

### CNPJ

1. **Formato**: Aceita com ou sem formatação
2. **Dígitos**: Deve ter exatamente 14 dígitos
3. **Sequência**: Não pode ser sequência de números iguais
4. **Algoritmo**: Validação usando algoritmo oficial da Receita Federal

### CPF

1. **Formato**: Aceita com ou sem formatação
2. **Dígitos**: Deve ter exatamente 11 dígitos
3. **Sequência**: Não pode ser sequência de números iguais
4. **Algoritmo**: Validação usando algoritmo oficial

## 📊 Performance e Otimizações

### Debounce

- **Delay**: 1 segundo após última digitação
- **Objetivo**: Evitar múltiplas requisições durante digitação

### Cache

- **Implementação**: Gerenciado pelo hook personalizado
- **Reset**: Limpa cache ao trocar entre abas PJ/PF

### Validação Prévia

- **CNPJ**: Validado antes da requisição
- **Economia**: Evita chamadas desnecessárias para CNPJs inválidos

## 🧪 Como Testar

### Teste Manual

1. Use um CNPJ válido de exemplo: `11.222.333/0001-81`
2. Digite no campo CNPJ da página de fornecedores
3. Observe a formatação automática
4. Aguarde a busca automática
5. Verifique se os dados foram preenchidos

### CNPJs de Teste Reais

- **Magazine Luiza**: 47.960.950/0001-21
- **Petrobras**: 33.000.167/0001-01
- **Banco do Brasil**: 00.000.000/0001-91

### Casos de Erro

- CNPJ inválido: `111.111.111-11`
- CNPJ inexistente: `12.345.678/0001-99`

## 🔄 Integração com Formulários

### React Hook Form

- **Compatibilidade**: 100% compatível
- **Validação**: Integrada com Zod schemas
- **Estado**: Sincronizado com estado do formulário

### Zod Schemas

- **Validação**: CNPJ e CPF validados em tempo real
- **Mensagens**: Mensagens de erro personalizadas
- **Refinements**: Validações customizadas implementadas

## 🎨 UI/UX Features

### Feedback Visual

- **Cores**: Verde para sucesso, amarelo para aviso, vermelho para erro
- **Ícones**: CheckCircle, AlertCircle, Loader2
- **Bordas**: Destacam campos preenchidos automaticamente

### Responsividade

- **Mobile**: Funciona perfeitamente em dispositivos móveis
- **Desktop**: Interface otimizada para desktop
- **Tablet**: Layout adaptativo

### Acessibilidade

- **Labels**: Todos os campos possuem labels adequados
- **Descriptions**: Descrições contextuais para cada estado
- **Keyboard**: Navegação por teclado suportada

## 🚨 Limitações e Considerações

### API Externa

- **Dependência**: Depende da disponibilidade da ReceitaWS
- **Rate Limit**: Limitação de requisições por minuto
- **Dados**: Nem todos os CNPJs possuem todos os dados

### Validação

- **Offline**: Validação de CNPJ funciona offline
- **Busca**: Busca de dados requer conexão com internet

### Campos Opcionais

- **Email**: Não fornecido pela API da Receita
- **Campos Adicionais**: Devem ser preenchidos manualmente

## 🔮 Próximas Melhorias

### Funcionalidades Futuras

1. **Cache Persistente**: Salvar dados consultados localmente
2. **Múltiplas APIs**: Fallback para outras APIs de CNPJ
3. **Busca CEP**: Integração com API de CEP
4. **Histórico**: Histórico de empresas consultadas
5. **Favoritos**: Sistema de empresas favoritas

### Otimizações

1. **Service Worker**: Cache offline de dados
2. **Lazy Loading**: Carregamento sob demanda
3. **Compression**: Compressão de dados da API

---

**Desenvolvido em**: 2024-12-26\
**Versão**: 1.0.0\
**Tecnologias**: React, TypeScript, Zod, React Hook Form, Supabase
