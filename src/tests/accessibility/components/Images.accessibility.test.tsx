import { screen } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { render } from '../test-utils';

describe('Imagens e Elementos Visuais - Testes de Acessibilidade Básicos', () => {
  it('deve ter imagens com texto alternativo apropriado', () => {
    render(
      <div>
        <img src="/logo.png" alt="Logo da empresa ObrasAI" />
        <img src="/dashboard.png" alt="Dashboard do sistema ObrasAI mostrando gráficos de obras" />
      </div>
    );
    
    const logoImage = screen.getByAltText(/logo da empresa obrasai/i);
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('alt');
    
    const dashboardImage = screen.getByAltText(/dashboard do sistema obrasai/i);
    expect(dashboardImage).toBeInTheDocument();
    expect(dashboardImage).toHaveAttribute('alt');
  });

  it('deve ter imagens decorativas marcadas adequadamente', () => {
    render(
      <div>
        <img src="/decorative.png" alt="" role="presentation" />
        <img src="/icon.png" aria-hidden="true" alt="" />
      </div>
    );
    
    const decorativeImage = screen.getByRole('presentation');
    expect(decorativeImage).toBeInTheDocument();
    expect(decorativeImage).toHaveAttribute('alt', '');
    
    const hiddenImage = document.querySelector('[aria-hidden="true"]');
    expect(hiddenImage).toHaveAttribute('aria-hidden', 'true');
  });

  it('deve ter ícones funcionais com labels apropriados', () => {
    render(
      <div>
        <button aria-label="Fechar modal">
          <img src="/close-icon.png" alt="" aria-hidden="true" />
        </button>
        <button>
          <img src="/save-icon.png" alt="" aria-hidden="true" />
          Salvar
        </button>
      </div>
    );
    
    const closeButton = screen.getByRole('button', { name: /fechar modal/i });
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveAccessibleName();
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAccessibleName();
  });
});