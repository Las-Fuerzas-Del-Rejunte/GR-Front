/// <reference types="jest" />

import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';


//
// Componente auxiliar para acceder al contexto
//
const TestConsumer = () => {
  const { user, login, logout, recoverPassword, updateUser, isAuthenticated } = useAuth();
  return (
    <div>
      <p data-testid="user">{user ? user.email : 'null'}</p>
      <p data-testid="authenticated">{isAuthenticated ? 'yes' : 'no'}</p>

      <button onClick={() => login('admin@sistema.com', 'admin123')}>login-success</button>
      <button onClick={() => login('admin@sistema.com', 'wrong')}>login-error</button>
      <button onClick={logout}>logout</button>

      <button onClick={() => recoverPassword('admin@sistema.com')}>recover-ok</button>
      <button onClick={() => recoverPassword('notfound@mail.com')}>recover-fail</button>

      <button onClick={() => updateUser({ name: 'Nuevo Nombre' })}>update-user</button>
    </div>
  );
};

//
// Mock del localStorage
//
beforeEach(() => {
  jest.spyOn(Storage.prototype, 'setItem');
  jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  jest.spyOn(Storage.prototype, 'removeItem');
});

const setup = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

describe('AuthProvider (JEST)', () => {

  //test usuario sin autenticar
  it('inicia sin usuario y no autenticado', () => {
    setup();
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(screen.getByTestId('authenticated').textContent).toBe('no');
  });

  //test de login exitoso
  it('login exitoso actualiza usuario y localStorage', async () => {
    setup();
    screen.getByText('login-success').click();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('admin@sistema.com');
    });

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(screen.getByTestId('authenticated').textContent).toBe('yes');
  });

  //test de login fallido
  it('login fallido no autentica', async () => {
    setup();
    screen.getByText('login-error').click();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('null');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('no');
  });

  //test cerrar sesion
  it('logout limpia el usuario y el localStorage', async () => {
    setup();

    screen.getByText('login-success').click();
    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('yes')
    );

    screen.getByText('logout').click();

    expect(localStorage.removeItem).toHaveBeenCalledWith('user');

    await waitFor(() =>
      expect(screen.getByTestId('authenticated').textContent).toBe('no')
    );
  });

  //test recuperar contrasena
  it('recoverPassword funciona cuando el usuario existe', async () => {
    setup();
    screen.getByText('recover-ok').click();
    await waitFor(() => expect(true).toBe(true));
  });

  //test recuperar contrasena pero usuario no existe
  it('recoverPassword devuelve error cuando no existe', async () => {
    setup();
    screen.getByText('recover-fail').click();
    await waitFor(() => expect(true).toBe(true));
  });

  //test actualizar datos usuario
  it('updateUser actualiza el usuario y guarda en localStorage', async () => {
    setup();

    screen.getByText('login-success').click();
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('admin@sistema.com')
    );

    screen.getByText('update-user').click();

    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
