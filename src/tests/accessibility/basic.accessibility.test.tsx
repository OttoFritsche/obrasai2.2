import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect,it } from 'vitest';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Componente simples para teste
const SimpleButton = ({ children, ...props }: { children: React.ReactNode; [key: string]: any }) => (
  <button {...props}>{children}</button>
);

const SimpleForm = () => (
  <form>
    <label htmlFor="name">Nome:</label>
    <input id="name" type="text" />
    <button type="submit">Enviar</button>
  </form>
);

const SimpleImage = () => (
  <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwNzNlNiIvPjwvc3ZnPg==" alt="Imagem de teste" />
);

describe('Testes Básicos de Acessibilidade', () => {
  describe('Botões', () => {
    it('botão simples deve ser acessível', async () => {
      const { container } = render(<SimpleButton>Clique aqui</SimpleButton>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('botão com aria-label deve ser acessível', async () => {
      const { container } = render(
        <SimpleButton aria-label="Fechar modal">×</SimpleButton>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Formulários', () => {
    it('formulário com labels deve ser acessível', async () => {
      const { container } = render(<SimpleForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('deve ter labels associados aos inputs', () => {
      render(<SimpleForm />);
      const input = screen.getByLabelText('Nome:');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Imagens', () => {
    it('imagem com alt text deve ser acessível', async () => {
      const { container } = render(<SimpleImage />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('deve ter texto alternativo', () => {
      render(<SimpleImage />);
      const image = screen.getByAltText('Imagem de teste');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Estrutura Semântica', () => {
    it('deve usar elementos semânticos corretos', async () => {
      const { container } = render(
        <main>
          <h1>Título Principal</h1>
          <section>
            <h2>Seção</h2>
            <p>Conteúdo da seção</p>
          </section>
        </main>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('deve ter hierarquia de headings correta', () => {
      render(
        <div>
          <h1>Título Principal</h1>
          <h2>Subtítulo</h2>
          <h3>Sub-subtítulo</h3>
        </div>
      );
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });
  });

  describe('Contraste de Cores', () => {
    it('deve ter contraste adequado', async () => {
      const { container } = render(
        <div style={{ color: '#000', backgroundColor: '#fff' }}>
          Texto com bom contraste
        </div>
      );
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navegação por Teclado', () => {
    it('elementos focáveis devem ser acessíveis', async () => {
      const { container } = render(
        <div>
          <button>Botão 1</button>
          <a href="https://example.com">Link</a>
          <input type="text" aria-label="Campo de texto" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ARIA', () => {
    it('deve usar elementos básicos sem violações', async () => {
      const { container } = render(
        <div>
          <h1>Título</h1>
          <p>Parágrafo de texto</p>
          <button>Botão simples</button>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});