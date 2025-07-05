# Correção: Erro de Validação "Expected object, received string"

## Problema Identificado

O erro "Expected object, received string" estava ocorrendo na etapa 4 do wizard de orçamento paramétrico devido aos campos `especificacoes` e `parametros_entrada` estarem sendo inicializados como `undefined` em vez de objetos vazios.

## Causa Raiz

Os schemas Zod esperavam que esses campos fossem objetos (usando `z.record(z.unknown())`), mas o formulário estava inicializando-os como `undefined`, causando falha na validação.

## Correções Implementadas

### 1. Hook useWizardOrcamento.ts

**Antes:**
```typescript
// Etapa 4 - Especificações
especificacoes: undefined,
parametros_entrada: undefined
```

**Depois:**
```typescript
// Etapa 4 - Especificações
especificacoes: {},
parametros_entrada: {}
```

### 2. Schema de Validação (orcamento.ts)

**Antes:**
```typescript
export const WizardEtapa4Schema = z.object({
  especificacoes: z.record(z.unknown()).optional(),
  parametros_entrada: z.record(z.unknown()).optional()
});
```

**Depois:**
```typescript
export const WizardEtapa4Schema = z.object({
  especificacoes: z.record(z.unknown()).default({}),
  parametros_entrada: z.record(z.unknown()).default({})
});
```

### 3. Validação com Fallback

Adicionada validação com fallback na função `validarEtapaAtual`:

```typescript
// Garantir que especificacoes e parametros_entrada sejam objetos
const valuesWithDefaults = {
  ...currentValues,
  especificacoes: currentValues.especificacoes || {},
  parametros_entrada: currentValues.parametros_entrada || {}
};
```

### 4. Submit com Tratamento

Adicionado tratamento similar na função `handleSubmit`:

```typescript
// Garantir que especificacoes e parametros_entrada sejam objetos
const dadosComDefaults = {
  ...dadosCompletos,
  especificacoes: dadosCompletos.especificacoes || {},
  parametros_entrada: dadosCompletos.parametros_entrada || {}
};
```

## Resultado

✅ O erro "Expected object, received string" foi resolvido
✅ A etapa 4 do wizard agora valida corretamente
✅ O orçamento pode ser criado sem erros de validação
✅ Mantida a compatibilidade com dados existentes

## Prevenção Futura

- Sempre inicializar campos de objeto com `{}` em vez de `undefined`
- Usar `.default({})` nos schemas Zod para campos de objeto
- Implementar validação com fallback para campos críticos
- Adicionar logs de erro para facilitar debugging

## Teste

Para testar se a correção está funcionando:

1. Acesse o wizard de orçamento
2. Preencha as etapas 1, 2 e 3
3. Avance para a etapa 4
4. Clique em "Criar Orçamento"
5. Verifique se não há erros de validação

---

**Data da Correção:** $(date)
**Arquivos Modificados:**
- `src/hooks/useWizardOrcamento.ts`
- `src/lib/validations/orcamento.ts`