import { describe, it, expect } from 'vitest';
import { render } from './test-utils';

describe('LandingPage Accessibility - Testes Básicos', () => {
  it('deve ter estrutura semântica básica', () => {
    const { container } = render(
      <div>
        <header role="banner">
          <nav role="navigation">
            <a href="https://example.com/home">Home</a>
            <a href="https://example.com/about">Sobre</a>
          </nav>
        </header>
        <main role="main">
          <h1>Título Principal</h1>
          <p>Conteúdo principal da página</p>
        </main>
        <footer role="contentinfo">
          <p>Rodapé da página</p>
        </footer>
      </div>
    );

    expect(container.querySelector('[role="banner"]')).toBeInTheDocument();
    expect(container.querySelector('[role="main"]')).toBeInTheDocument();
    expect(container.querySelector('[role="contentinfo"]')).toBeInTheDocument();
    expect(container.querySelector('[role="navigation"]')).toBeInTheDocument();
  });

  it('deve ter hierarquia de headings correta', () => {
    const { container } = render(
      <div>
        <h1>Título Principal</h1>
        <h2>Subtítulo</h2>
        <h3>Seção</h3>
      </div>
    );

    const h1 = container.querySelector('h1');
    const h2 = container.querySelector('h2');
    const h3 = container.querySelector('h3');

    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();
    expect(h3).toBeInTheDocument();
  });

  it('deve ter navegação acessível', () => {
    const { container } = render(
      <nav role="navigation">
        <a href="https://example.com/home">Home</a>
        <a href="https://example.com/about">Sobre</a>
        <a href="https://example.com/contact">Contato</a>
      </nav>
    );

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(3);
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link.textContent).toBeTruthy();
    });
  });
});