# Plano de Refatoração Segura - NovaConstrutora.tsx

## 📋 Análise do Componente Atual

### Problemas Identificados
- **1125 linhas** em um único arquivo
- **Múltiplas responsabilidades**: formulários PJ/PF, validação, integração CNPJ, UI
- **Duplicação de código**: campos de endereço repetidos entre PJ e PF
- **Lógica complexa**: gerenciamento de estado, efeitos, mutações
- **JSX extenso**: formulários longos com muita repetição

### Responsabilidades Atuais
1. **Gerenciamento de Estado**: tipo de construtora, formulários, CNPJ lookup
2. **Validação**: schemas Zod para PJ e PF
3. **Integração API**: Supabase mutations, CNPJ lookup
4. **UI/UX**: animações, layout, feedback visual
5. **Formatação**: CNPJ, CPF, telefone, CEP
6. **Navegação**: redirecionamentos e controle de fluxo

## 🎯 Estratégia de Refatoração

### Fase 1: Preparação (Sem Quebras)
1. **Criar hooks customizados**
2. **Extrair componentes de formulário**
3. **Criar utilitários específicos**
4. **Testes de validação**

### Fase 2: Refatoração Incremental
1. **Substituir lógica por hooks**
2. **Substituir JSX por componentes**
3. **Validação contínua**

### Fase 3: Limpeza Final
1. **Remover código duplicado**
2. **Otimizações finais**
3. **Documentação**

## 📁 Nova Estrutura Proposta

```
src/
├── hooks/
│   ├── useConstrutoraMutations.ts     # Mutations PJ/PF
│   ├── useConstrutoraCNPJ.ts          # Lógica CNPJ lookup
│   └── useConstrutoraForm.ts          # Gerenciamento formulários
├── components/
│   └── construtora/
│       ├── ConstrutoraFormPJ.tsx      # Formulário PJ
│       ├── ConstrutoraFormPF.tsx      # Formulário PF
│       ├── ConstrutoraHeader.tsx      # Header com navegação
│       ├── ConstrutoraTypeTabs.tsx    # Tabs PJ/PF
│       └── shared/
│           ├── EnderecoFields.tsx     # Campos de endereço
│           ├── ContatoFields.tsx      # Campos de contato
│           ├── ResponsavelFields.tsx  # Responsável técnico
│           └── FormActions.tsx        # Botões de ação
└── pages/dashboard/construtoras/
    └── NovaConstrutora.tsx            # Componente principal (< 100 linhas)
```

## 🔧 Implementação Detalhada

### 1. Hook: useConstrutoraMutations
```typescript
// Responsabilidade: Gerenciar mutations para PJ e PF
// Benefícios: Reutilização, testabilidade, separação de responsabilidades
export const useConstrutoraMutations = () => {
  // Lógica das mutations PJ/PF
  // Tratamento de erros
  // Navegação pós-sucesso
}
```

### 2. Hook: useConstrutoraCNPJ
```typescript
// Responsabilidade: Gerenciar lookup CNPJ e preenchimento automático
// Benefícios: Isolamento da lógica complexa, reutilização
export const useConstrutoraCNPJ = (form) => {
  // Lógica de debounce
  // Auto-preenchimento
  // Estados de loading
}
```

### 3. Componente: EnderecoFields
```typescript
// Responsabilidade: Campos de endereço reutilizáveis
// Benefícios: DRY, consistência, manutenibilidade
export const EnderecoFields = ({ form, isLoading, cnpjData }) => {
  // Campos: CEP, logradouro, número, complemento, bairro, cidade, estado
}
```

### 4. Componente Principal Refatorado
```typescript
// NovaConstrutora.tsx (< 100 linhas)
export const NovaConstrutora = () => {
  const [construtoraType, setConstrutoraType] = useState('pj');
  
  return (
    <DashboardLayout>
      <ConstrutoraHeader />
      <ConstrutoraTypeTabs 
        value={construtoraType} 
        onChange={setConstrutoraType}
      >
        <ConstrutoraFormPJ />
        <ConstrutoraFormPF />
      </ConstrutoraTypeTabs>
    </DashboardLayout>
  );
};
```

## ✅ Benefícios da Refatoração

### Manutenibilidade
- **Componentes focados**: cada um com uma responsabilidade específica
- **Hooks reutilizáveis**: lógica compartilhada entre componentes
- **Código DRY**: eliminação de duplicação

### Testabilidade
- **Hooks isolados**: fáceis de testar unitariamente
- **Componentes pequenos**: testes mais simples e focados
- **Mocks simplificados**: dependências bem definidas

### Performance
- **Re-renders otimizados**: componentes menores re-renderizam menos
- **Lazy loading**: possibilidade de carregar componentes sob demanda
- **Memoização**: hooks e componentes podem ser memoizados

### Experiência do Desenvolvedor
- **Navegação mais fácil**: arquivos menores e organizados
- **Debugging simplificado**: problemas isolados em componentes específicos
- **Reutilização**: componentes podem ser usados em outras partes

## 🛡️ Estratégia de Segurança

### Validação Contínua
1. **Testes funcionais** após cada etapa
2. **Comparação de comportamento** antes/depois
3. **Rollback rápido** se necessário

### Implementação Incremental
1. **Uma responsabilidade por vez**
2. **Manter funcionalidade original** durante transição
3. **Validação em ambiente de desenvolvimento**

### Backup e Versionamento
1. **Branch dedicada** para refatoração
2. **Commits atômicos** para cada mudança
3. **Testes automatizados** quando possível

## 📊 Métricas de Sucesso

### Antes da Refatoração
- **1125 linhas** em um arquivo
- **7+ responsabilidades** em um componente
- **Duplicação alta** de código
- **Testabilidade baixa**

### Após a Refatoração (Meta)
- **< 100 linhas** no componente principal
- **1 responsabilidade** por arquivo
- **0% duplicação** de código
- **100% testabilidade** dos hooks

## 🚀 Próximos Passos

1. **Aprovação do plano** pela equipe
2. **Criação da branch** `refactor/nova-construtora`
3. **Implementação da Fase 1** (hooks e componentes)
4. **Testes e validação**
5. **Implementação da Fase 2** (substituições)
6. **Testes finais e merge**

---

**Tempo estimado**: 2-3 dias de desenvolvimento
**Risco**: Baixo (implementação incremental)
**Impacto**: Alto (melhoria significativa na manutenibilidade)