# 🔧 Scripts para Corrigir Enums do Banco de Dados

## Problema
O erro `invalid input value for enum etapa_enum: "DEMOLICAO"` ocorre porque o valor `'DEMOLICAO'` não existe no enum `etapa_enum` do banco de dados PostgreSQL.

## Solução

### Passo 1: Verificar Enums Atuais
Execute o script `check-enums.sql` no **Supabase SQL Editor** para ver quais valores existem atualmente:

```sql
-- Copie e cole o conteúdo de check-enums.sql
```

### Passo 2: Adicionar DEMOLICAO
Execute o script `add-demolicao-enum.sql` no **Supabase SQL Editor**:

```sql
-- Copie e cole o conteúdo de add-demolicao-enum.sql
```

### Passo 3: Adicionar Outras Etapas (Opcional)
Execute o script `add-missing-etapas.sql` para adicionar outras etapas importantes:

```sql
-- Copie e cole o conteúdo de add-missing-etapas.sql
```

## Como Executar

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute cada script na ordem**
4. **Verifique se não há erros**
5. **Teste o cadastro de despesa novamente**

## Resultado Esperado

Após executar os scripts, você deve conseguir:
- ✅ Cadastrar despesas com etapa "DEMOLICAO"
- ✅ Selecionar outras etapas importantes
- ✅ Não ter mais erros de enum inválido

## Verificação

Para verificar se funcionou:
1. Acesse o formulário de nova despesa
2. Selecione "DEMOLICAO" no campo Etapa
3. Preencha os outros campos obrigatórios
4. Submeta o formulário
5. A despesa deve ser criada com sucesso 