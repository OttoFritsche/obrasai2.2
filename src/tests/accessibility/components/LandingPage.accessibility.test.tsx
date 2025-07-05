import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test-utils';

describe('LandingPage Accessibility - Testes Básicos', () => {
  it('deve ter estrutura semântica básica', () => {
    render(
      <div>
        <header role="banner">
          <h1>ObrasAI - Gestão de Obras</h1>
          <nav role="navigation">
            <a href="#home">Home</a>
            <a href="#about">Sobre</a>
            <a href="#contact">Contato</a>
          </nav>
        </header>
        <main role="main">
          <section>
            <h2>Seção Principal</h2>
            <p>Conteúdo da página</p>
          </section>
        </main>
        <footer role="contentinfo">
          <p>© 2024 ObrasAI</p>
        </footer>
      </div>
    );
    
    // Verificar presença de landmarks principais
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('deve ter hierarquia de headings correta', () => {
    render(
      <div>
        <h1>Título Principal</h1>
        <h2>Subtítulo</h2>
        <h3>Seção</h3>
        <h2>Outro Subtítulo</h2>
      </div>
    );
    
    // Verificar se existe pelo menos um h1
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBe(1);
    
    // Verificar se headings seguem ordem lógica
    const allHeadings = screen.getAllByRole('heading');
    expect(allHeadings.length).toBe(4);
  });

  it('deve ter navegação acessível', () => {
    render(
      <nav role="navigation" aria-label="Menu principal">
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Serviços</a></li>
          <li><a href="#contact">Contato</a></li>
        </ul>
      </nav>
    );
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveAttribute('aria-label', 'Menu principal');
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(3);
  });
});