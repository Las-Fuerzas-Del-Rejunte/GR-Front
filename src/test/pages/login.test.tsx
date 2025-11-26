import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { useAuth } from '../../context/AuthContext';

// Mock AuthContext
jest.mock('../../context/AuthContext');

const mockLogin = jest.fn();
(useAuth as jest.Mock).mockReturnValue({
  login: mockLogin,
});

// Mock useNavigate manual (solo una vez)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  // Importa el módulo real para mantener todo excepto useNavigate
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los campos y el botón', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña', { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('muestra y oculta la contraseña', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const passwordInput = screen.getByLabelText('Contraseña', { selector: 'input' });
    const toggleButton = screen.getByRole('button', { name: /mostrar contraseña/i });

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    fireEvent.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('si el login es exitoso navega al home', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Correo Electrónico', { selector: 'input' }), { target: { value: 'admin@sistema.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña', { selector: 'input' }), { target: { value: 'admin123' } });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'));
  });

  it('si el login falla muestra mensaje de error', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Correo Electrónico', { selector: 'input' }), { target: { value: 'admin@sistema.com' } });
    fireEvent.change(screen.getByLabelText('Contraseña', { selector: 'input' }), { target: { value: 'admin123' } });

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(await screen.findByText(/credenciales inválidas/i)).toBeInTheDocument();
  });
});
