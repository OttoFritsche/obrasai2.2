# 🔍 Guia de Testes de Acessibilidade

Este guia explica como usar os testes de acessibilidade implementados no projeto ObrasAI.

## 📋 Visão Geral

Implementamos uma suíte completa de testes de acessibilidade seguindo as diretrizes WCAG 2.1 AA, incluindo:

- ✅ Auditoria automatizada com `axe-core`
- ⌨️ Testes de navegação por teclado
- 🎯 Validação de contraste de cores
- 🏷️ Verificação de labels e ARIA
- 📱 Testes de responsividade acessível

## 🚀 Comandos Disponíveis

### Executar Todos os Testes de Acessibilidade
```bash
npm run test:accessibility
```

### Executar em Modo Watch
```bash
npm run test:accessibility:watch
```

### Gerar Relatório Completo
```bash
npm run audit:accessibility
```

### Auditoria Completa (alias)
```bash
npm run audit:accessibility
```

## 📁 Estrutura dos Testes

```
src/tests/accessibility/
├── axe-config.ts              # Configurações do axe-core
├── test-utils.tsx             # Utilitários para testes
├── run-accessibility-tests.ts # Script de execução
└── components/
    ├── Header.accessibility.test.tsx
    ├── Forms.accessibility.test.tsx
    ├── Images.accessibility.test.tsx
    └── LandingPage.accessibility.test.tsx
```

## 🔧 Configurações

### Níveis de Conformidade

1. **Padrão (WCAG 2.1 AA)**
   ```typescript
   import { axe } from '../axe-config';
   await testAccessibility(component, axe);
   ```

2. **Rigoroso (WCAG 2.1 AAA)**
   ```typescript
   import { axeStrict } from '../axe-config';
   await testAccessibilityStrict(component, axeStrict);
   ```

3. **Desenvolvimento**
   ```typescript
   import { axeDev } from '../axe-config';
   await testAccessibilityDev(component, axeDev);
   ```

## 📊 Relatórios Gerados

Após executar `npm run audit:accessibility`, os seguintes arquivos são gerados:

```
accessibility-reports/
├── accessibility-report.json    # Dados brutos
├── accessibility-report.html    # Relatório visual
├── accessibility-report.md      # Documentação
└── accessibility-metrics.json   # Métricas resumidas
```

## 🧪 Tipos de Testes

### 1. Testes Básicos de Acessibilidade
```typescript
test('deve passar na auditoria básica de acessibilidade', async () => {
  const { container } = render(<Component />);
  await testAccessibility(container);
});
```

### 2. Testes de Navegação por Teclado
```typescript
test('deve ser navegável por teclado', async () => {
  render(<Component />);
  await testNavigationAccessibility();
});
```

### 3. Testes de Contraste
```typescript
test('deve ter contraste adequado', async () => {
  const { container } = render(<Component />);
  await testColorContrast(container);
});
```

### 4. Testes de Formulários
```typescript
test('formulário deve ser acessível', async () => {
  const { container } = render(<Form />);
  await testFormAccessibility(container);
});
```

## 🔍 Testes Manuais Recomendados

### Navegação por Teclado
1. **Tab**: Navegar entre elementos focáveis
2. **Shift+Tab**: Navegação reversa
3. **Enter/Space**: Ativar botões e links
4. **Escape**: Fechar modais e dropdowns
5. **Setas**: Navegar em menus e listas

### Checklist Manual
- [ ] Todos os elementos interativos são focáveis
- [ ] Ordem de foco é lógica
- [ ] Indicadores de foco são visíveis
- [ ] Não há armadilhas de foco
- [ ] Skip links funcionam corretamente

## 🎧 Testes com Screen Readers

### NVDA (Windows)
1. Instalar NVDA gratuito
2. Navegar com `Ctrl+Alt+N`
3. Testar leitura de conteúdo
4. Verificar landmarks e headings

### JAWS (Windows)
1. Usar versão trial
2. Testar navegação por elementos
3. Verificar anúncios de mudanças

### VoiceOver (macOS)
1. Ativar com `Cmd+F5`
2. Navegar com `Ctrl+Option+Setas`
3. Testar rotor de navegação

## 🚨 Resolução de Problemas Comuns

### Violações Frequentes

1. **Elementos sem label**
   ```html
   <!-- ❌ Incorreto -->
   <button>❌</button>
   
   <!-- ✅ Correto -->
   <button aria-label="Fechar modal">❌</button>
   ```

2. **Contraste insuficiente**
   ```css
   /* ❌ Contraste baixo */
   color: #999 on #fff; /* 2.85:1 */
   
   /* ✅ Contraste adequado */
   color: #666 on #fff; /* 4.54:1 */
   ```

3. **Falta de estrutura semântica**
   ```html
   <!-- ❌ Incorreto -->
   <div class="header">Título</div>
   
   <!-- ✅ Correto -->
   <h1>Título</h1>
   ```

### Debugging

1. **Executar teste específico**
   ```bash
   npx vitest src/tests/accessibility/components/Header.accessibility.test.tsx
   ```

2. **Ver detalhes de violações**
   ```bash
   npm run audit:accessibility
   # Abrir accessibility-reports/accessibility-report.html
   ```

3. **Modo debug**
   ```typescript
   await testAccessibilityDev(container); // Mais detalhes
   ```

## 🔄 Integração CI/CD

Os testes são executados automaticamente:

- ✅ **Push/PR**: Testes básicos
- 📅 **Diário**: Auditoria completa
- 🚀 **Deploy**: Lighthouse audit

### Configuração GitHub Actions
Ver `.github/workflows/accessibility.yml` para configuração completa.

## 📚 Recursos Adicionais

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)

## 🤝 Contribuindo

Ao adicionar novos componentes:

1. Criar teste de acessibilidade correspondente
2. Executar `npm run audit:accessibility`
3. Corrigir violações antes do commit
4. Documentar padrões específicos

## 📞 Suporte

Para dúvidas sobre acessibilidade:
- Consultar este guia
- Revisar relatórios gerados
- Testar manualmente com screen readers
- Usar ferramentas de desenvolvimento do navegador