import { render, screen, fireEvent } from '@testing-library/react';
import Profile from '../../pages/Profile';

// Mock AuthContext
const mockUpdateUser = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      name: 'Juan Pérez',
      email: 'juan@test.com',
      phone: '123456',
      department: 'Sistemas',
      position: 'Analista',
      role: 'usuario'
    },
    updateUser: mockUpdateUser
  })
}));

// Mock ToastContext
const mockShowToast = jest.fn();

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(<Profile />); // render en beforeEach
  });

  
  it('debe mostrar los datos del usuario', () => {

    // Nombre principal (header)
    expect(
      screen.getByRole('heading', { level: 2, name: /juan pérez/i })
    ).toBeInTheDocument();

    // Email único
    expect(screen.getByText(/juan@test\.com/i)).toBeInTheDocument();

    // Departamento (buscar dentro de sección específica)
    expect(
      screen.getAllByText('Sistemas')[0] // tomamos el primero si hay duplicados
    ).toBeInTheDocument();

    // Cargo
    expect(
      screen.getAllByText('Analista')[0]
    ).toBeInTheDocument();
  });


  it('debe activar modo edición al presionar Editar Perfil', () => {
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar cambios/i })).toBeInTheDocument();
  });


  it('no debe permitir guardar si el nombre está vacío', () => {
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    const input = screen.getByPlaceholderText('Tu nombre completo');
    fireEvent.change(input, { target: { value: '   ' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(mockShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    expect(mockUpdateUser).not.toHaveBeenCalled();
  });


  it('debe guardar los cambios correctamente', () => {
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    const input = screen.getByPlaceholderText('Tu nombre completo');
    fireEvent.change(input, { target: { value: 'Nuevo Nombre' } });

    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    expect(mockUpdateUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Nuevo Nombre' })
    );

    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' })
    );
  });


  it('debe cancelar edición y restaurar valores originales', () => {
    fireEvent.click(screen.getByRole('button', { name: /editar perfil/i }));

    const input = screen.getByPlaceholderText('Tu nombre completo');
    fireEvent.change(input, { target: { value: 'Otro Nombre' } });

    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    // El input ya no debe existir
    expect(screen.queryByPlaceholderText('Tu nombre completo')).not.toBeInTheDocument();

    // Buscamos el nombre original como heading (no texto suelto duplicado)
    expect(
      screen.getByRole('heading', { level: 2, name: /juan pérez/i })
    ).toBeInTheDocument();
  });
});
