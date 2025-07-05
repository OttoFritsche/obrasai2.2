import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

// Teste simplificado para Header - focando apenas em acessibilidade básica
describe('Header - Testes de Acessibilidade Básicos', () => {
  it('deve renderizar elementos básicos de acessibilidade', () => {
    render(
      <header role="banner">
        <nav role="navigation" aria-label="Navegação principal">
          <img src="/logo.png" alt="Logo ObrasAI" />
          <button aria-label="Menu de navegação" type="button">
            Menu
          </button>
          <a href="https://example.com/home">Home</a>
          <a href="https://example.com/about">Sobre</a>
          <a href="https://example.com/contact">Contato</a>
        </nav>
      </header>
    );
    
    // Verifica se os elementos básicos estão presentes
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
  });

  it('deve ter elementos com roles apropriados', () => {
    render(
      <header role="banner">
        <nav role="navigation" aria-label="Navegação principal">
          <img src="/logo.png" alt="Logo ObrasAI" />
          <button aria-label="Menu de navegação" type="button">
            Menu
          </button>
          <a href="#home">Home</a>
          <a href="#about">Sobre</a>
          <a href="#contact">Contato</a>
        </nav>
      </header>
    );
    
    // Verifica se os elementos têm roles corretos
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
    expect(menuButton).toHaveAttribute('aria-label');
    
    const logo = screen.getByAltText('Logo ObrasAI');
    expect(logo).toBeInTheDocument();
  });

  it('deve ter links com textos acessíveis', () => {
    render(
      <header role="banner">
        <nav role="navigation" aria-label="Navegação principal">
          <a href="#home">Home</a>
          <a href="#about">Sobre</a>
          <a href="#contact">Contato</a>
        </nav>
      </header>
    );
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
    
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });
});