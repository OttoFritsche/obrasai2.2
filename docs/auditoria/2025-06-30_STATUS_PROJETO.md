# Relatório de Status do Projeto "ObrasAI" - 30/06/2025

## 1. Resumo Executivo

A auditoria revelou um projeto com uma base tecnológica sólida e moderna, mas
com falhas críticas em processos fundamentais de desenvolvimento e governança de
banco de dados. O projeto está em um estado de **RISCO MÉDIO**. Embora a
aplicação possa estar funcional em partes, a ausência de `strict mode` no
TypeScript, a falta de testes automatizados e, principalmente, a divergência
entre as migrações do repositório e o schema real do banco de dados (inferido
pelo uso da tabela `leads` nas Edge Functions) comprometem a estabilidade,
manutenibilidade e escalabilidade futura.

A correção desses pontos é crucial antes de considerar o projeto pronto para um
ambiente de produção estável.

---

## 2. Diagnóstico Detalhado

### ✅ Itens OK

- **Stack Tecnológica:** O projeto utiliza uma stack alinhada com as melhores
  práticas (Vite, React, TypeScript, Tailwind, shadcn/ui, TanStack Query, Zod).
- **Estrutura de Código:** A organização de pastas em `src/`, `supabase/` e
  `scripts/` é lógica e facilita a navegação.
- **Práticas de Segurança em Edge Functions:** A função `lead-capture` demonstra
  boa implementação de segurança com tratamento de CORS e `rate limiting`.
- **Boas Práticas de Banco de Dados (Parcial):** A migração da tabela
  `embeddings_conhecimento` segue as regras de nomenclatura `snake_case` e
  ativação de RLS.

### ⚠️ Itens em RISCO

- **Strict Mode Desativado:** O `tsconfig.app.json` está com `"strict": false` e
  `"noImplicitAny": false`. Isso anula muitas das vantagens de segurança de
  tipos do TypeScript e é uma violação direta das regras do projeto.
  **(Criticidade: Alta)**
- **Padronização de Respostas de API:** As Edge Functions não seguem um padrão
  consistente para respostas de sucesso e erro. O padrão
  `{ success, data, error }` deve ser aplicado universalmente. **(Criticidade:
  Baixa)**
- **Validação Manual em vez de Zod:** A Edge Function `lead-capture` realiza
  validação manual dos dados de entrada, enquanto as regras do projeto
  recomendam o uso de Zod para consistência e robustez. **(Criticidade: Média)**

### ❌ Itens FALTANTES / ERROS

- **DIVERGÊNCIA DE SCHEMA DO BANCO DE DADOS:** Este é o problema mais grave
  encontrado. A Edge Function `lead-capture` interage com uma tabela chamada
  `leads`, mas **não existe um arquivo de migração correspondente** no diretório
  `supabase/migrations`. Isso indica que tabelas estão sendo criadas ou
  alteradas manualmente via interface da Supabase, o que quebra o princípio de
  Infraestrutura como Código (IaC) e torna o ambiente de desenvolvimento
  inconsistente e propenso a erros. **(Criticidade: CRÍTICA)**
- **Ausência de Pipeline de CI/CD:** Não há workflows do GitHub Actions (ou
  similar) para automatizar build, lint e testes, o que é essencial para
  garantir a qualidade do código a cada alteração. **(Criticidade: Alta)**
- **Ausência de Testes Automatizados:** O projeto carece de uma suíte de testes
  (unitários, integração ou E2E), tornando qualquer alteração arriscada e a
  validação de funcionalidades um processo manual e lento. **(Criticidade:
  Alta)**

---

## 3. Plano de Ação Recomendado

A seguir, um plano passo-a-passo para estabilizar o projeto.

### Fase 1: Correções Críticas e Fundamentais

1. **Ativar o Strict Mode:**
   - Alterar `tsconfig.app.json` para `"strict": true`.
   - Corrigir todos os erros de tipagem que surgirão. Esta deve ser a prioridade
     máxima para restaurar a segurança de tipos.

2. **Sincronizar o Schema do Banco de Dados:**
   - Usar a CLI da Supabase para gerar os arquivos de migração para **todas as
     tabelas existentes** que não estão no diretório `migrations` (ex:
     `supabase db remote commit`).
   - Revisar os arquivos gerados para garantir que sigam os padrões (RLS
     ativado, `snake_case`).
   - **Estabelecer como regra que NENHUMA alteração de schema pode ser feita sem
     um arquivo de migração correspondente.**

### Fase 2: Padronização e Boas Práticas

3. **Implementar Testes Unitários e de Integração:**
   - Configurar Vitest no projeto.
   - Começar escrevendo testes para as funções utilitárias (`/lib/utils`) e para
     as validações com Zod (`/lib/validations`).
   - Escrever testes de integração para as Edge Functions, mockando as chamadas
     ao Supabase.

4. **Refatorar Edge Functions:**
   - Padronizar todas as respostas para o formato
     `{ success: boolean, data: any | null, error: { message: string } | null }`.
   - Substituir as validações manuais por schemas Zod, reutilizando-os entre o
     frontend e o backend sempre que possível.

### Fase 3: Automação e Deploy

5. **Criar Pipeline de CI/CD:**
   - Adicionar um workflow em `.github/workflows/ci.yml` que rode a cada Pull
     Request e push para a `main`.
   - O workflow deve, no mínimo:
     - Instalar dependências (`npm install`).
     - Rodar o linter (`npm run lint`).
     - Rodar a build (`npm run build`).
     - Executar os testes (`npm test`).

6. **Automatizar Deploy (Opcional, mas recomendado):**
   - Criar um workflow de deploy (`.github/workflows/deploy.yml`) que, após o
     merge para a `main`, execute `supabase functions deploy`.

---

## 4. Checklist "Pronto para Deploy"

- [ ] `strict: true` está ativado e todos os erros de tipo foram corrigidos.
- [x] Stack de tecnologia está definida e funcional.
- [ ] O diretório `supabase/migrations` reflete 100% o schema do banco de dados
      de produção.
- [ ] Todas as tabelas sensíveis possuem RLS ativado com políticas adequadas.
- [ ] Testes unitários cobrem as principais lógicas de negócio.
- [ ] Testes de integração validam o fluxo das Edge Functions.
- [ ] Pipeline de CI está configurado e passando.
- [ ] Todas as Edge Functions seguem o padrão de código e resposta.
- [ ] Variáveis de ambiente (`.env`) estão documentadas e não há secrets
      versionados.
