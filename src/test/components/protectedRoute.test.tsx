import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from '../../components/ProtectedRoute';  // ajusta la ruta
import { useAuth } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';

// Mock de useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('ProtectedRoute', () => {
  it('redirige a /login si no está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Como usamos <Navigate to="/login" />, el test puede buscar por un cambio en la URL
    // o bien usar un enfoque más simple y directo:
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  it('muestra los hijos si está autenticado', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});
