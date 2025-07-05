import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { axe, axeDev,axeStrict } from './axe-config';

// Wrapper para testes que inclui todos os providers necessários
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Função customizada de render para testes de acessibilidade
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Função para testar acessibilidade básica
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar acessibilidade com regras mais rigorosas
export const testAccessibilityStrict = async (container: HTMLElement) => {
  const results = await axeStrict(container);
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar acessibilidade em desenvolvimento (mais permissiva)
export const testAccessibilityDev = async (container: HTMLElement) => {
  const results = await axeDev(container);
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar acessibilidade de formulários
export const testFormAccessibility = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'label': { enabled: true },
      'form-field-multiple-labels': { enabled: true },
      'aria-required-attr': { enabled: true },
      'aria-invalid-attr': { enabled: true },
      'aria-describedby': { enabled: true },
    }
  });
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar acessibilidade de navegação
export const testNavigationAccessibility = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'skip-link': { enabled: true },
      'landmark-one-main': { enabled: true },
      'region': { enabled: true },
      'aria-hidden-focus': { enabled: true },
      'keyboard-navigation': { enabled: true },
    }
  });
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar acessibilidade de imagens
export const testImageAccessibility = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'image-alt': { enabled: true },
      'image-redundant-alt': { enabled: true },
      'aria-hidden-body': { enabled: true },
    }
  });
  expect(results).toHaveNoViolations();
  return results;
};

// Função para testar contraste de cores
export const testColorContrast = async (container: HTMLElement) => {
  const results = await axe(container, {
    rules: {
      'color-contrast': { enabled: true },
      'color-contrast-enhanced': { enabled: true },
    }
  });
  expect(results).toHaveNoViolations();
  return results;
};

// Função para gerar relatório detalhado de acessibilidade
export const generateAccessibilityReport = async (container: HTMLElement) => {
  const results = await axe(container);
  
  console.log('\n=== RELATÓRIO DE ACESSIBILIDADE ===');
  console.log(`Violações encontradas: ${results.violations.length}`);
  console.log(`Testes incompletos: ${results.incomplete.length}`);
  console.log(`Testes aprovados: ${results.passes.length}`);
  
  if (results.violations.length > 0) {
    console.log('\n--- VIOLAÇÕES ---');
    results.violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
      console.log(`   Impacto: ${violation.impact}`);
      console.log(`   Elementos afetados: ${violation.nodes.length}`);
      violation.nodes.forEach((node, nodeIndex) => {
        console.log(`   ${nodeIndex + 1}. ${node.target.join(', ')}`);
        console.log(`      HTML: ${node.html}`);
      });
    });
  }
  
  if (results.incomplete.length > 0) {
    console.log('\n--- TESTES INCOMPLETOS ---');
    results.incomplete.forEach((incomplete, index) => {
      console.log(`${index + 1}. ${incomplete.id}: ${incomplete.description}`);
    });
  }
  
  return results;
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };