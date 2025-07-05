import { screen } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { render } from '../test-utils';

describe('Formulários - Testes de Acessibilidade Básicos', () => {
  it('deve renderizar formulário básico com acessibilidade', () => {
    render(
      <form role="form">
        <label htmlFor="name">Nome:</label>
        <input type="text" id="name" name="name" required aria-required="true" />
        
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" name="email" required aria-required="true" />
        
        <button type="submit">Enviar</button>
      </form>
    );
    
    // Verifica se o formulário tem role apropriado
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });

  it('deve ter labels associados aos inputs', () => {
    render(
      <form>
        <label htmlFor="username">Nome de usuário:</label>
        <input type="text" id="username" name="username" />
        
        <label htmlFor="password">Senha:</label>
        <input type="password" id="password" name="password" />
      </form>
    );
    
    const usernameInput = screen.getByLabelText(/nome de usuário/i);
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('id', 'username');
    
    const passwordInput = screen.getByLabelText(/senha/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('id', 'password');
  });

  it('deve ter botão de submit acessível', () => {
    render(
      <form>
        <input type="text" aria-label="Campo de teste" />
        <button type="submit">Enviar Formulário</button>
      </form>
    );
    
    const submitButton = screen.getByRole('button', { name: /enviar formulário/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });
});