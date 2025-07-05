import { configureAxe } from 'jest-axe';

// Configuração personalizada do axe-core para o projeto ObrasAI
export const axe = configureAxe({
  rules: {
    // Regras específicas para WCAG 2.1 AA
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-structure': { enabled: true },
    
    // Regras específicas para formulários
    'label': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    
    // Regras para imagens
    'image-alt': { enabled: true },
    'image-redundant-alt': { enabled: true },
    
    // Regras para navegação
    'skip-link': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    
    // Regras para conteúdo dinâmico
    'live-region': { enabled: true },
    'aria-hidden-focus': { enabled: true },
    
    // Desabilitar regras que podem ser problemáticas em desenvolvimento
    'color-contrast-enhanced': { enabled: false }, // WCAG AAA - muito restritivo
    'meta-refresh': { enabled: false }, // Não aplicável para SPAs
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  // Incluir apenas violações e avisos sérios
  resultTypes: ['violations', 'incomplete']
});

// Configuração mais restritiva para componentes críticos
export const axeStrict = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'color-contrast-enhanced': { enabled: true }, // WCAG AAA para componentes críticos
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'semantic-structure': { enabled: true },
    'label': { enabled: true },
    'image-alt': { enabled: true },
    'skip-link': { enabled: true },
    'landmark-one-main': { enabled: true },
    'region': { enabled: true },
    'live-region': { enabled: true },
    'aria-hidden-focus': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag21aaa'],
  resultTypes: ['violations', 'incomplete', 'inapplicable']
});

// Configuração para testes de desenvolvimento (mais permissiva)
export const axeDev = configureAxe({
  rules: {
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'aria-labels': { enabled: true },
    'label': { enabled: true },
    'image-alt': { enabled: true },
    
    // Desabilitar regras que podem ser problemáticas durante desenvolvimento
    'landmark-one-main': { enabled: false },
    'region': { enabled: false },
    'skip-link': { enabled: false },
  },
  tags: ['wcag2a', 'wcag2aa'],
  resultTypes: ['violations']
});