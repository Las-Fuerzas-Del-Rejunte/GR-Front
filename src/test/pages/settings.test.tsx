import { render, screen, fireEvent, within } from '@testing-library/react';
import Settings from '../../pages/Settings';


// Mock StatusContext
const mockAddStatus = jest.fn();
const mockUpdateStatus = jest.fn();
const mockDeleteStatus = jest.fn();

jest.mock('../../context/StatusContext', () => ({
  useStatuses: () => ({
    statuses: [
      { id: '1', name: 'Pendiente', color: 'blue' },
      { id: '2', name: 'En Proceso', color: 'green' }
    ],
    addStatus: mockAddStatus,
    deleteStatus: mockDeleteStatus,
    updateStatus: mockUpdateStatus
  })
}));

// Mock ToastContext
const mockShowToast = jest.fn();

jest.mock('../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

// Mock Modal (evitamos problemas con portales)
jest.mock('../../components/ui/Modal', () => {
  return ({ isOpen, children, title }: any) =>
    isOpen ? (
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    ) : null;
});

// Mock Input (para no depender de estilos internos)
jest.mock('../../components/ui/Input', () => {
  return ({ placeholder, value, onChange }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      data-testid={placeholder}
    />
  );
});

// Mock Button y Card para simplificar
jest.mock('../../components/ui/Button', () => {
  return ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  );
});

jest.mock('../../components/ui/Card', () => {
  return ({ children }: any) => <div>{children}</div>;
});


//Pruebas
describe('Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('debe renderizar los estados existentes', () => {
    render(<Settings />);

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Proceso')).toBeInTheDocument();
  });


  it('debe permitir abrir el modal de agregar estado', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText(/agregar estado/i));

    expect(screen.getByText('Nuevo Estado')).toBeInTheDocument();
    expect(screen.getByTestId('Nombre del estado')).toBeInTheDocument();
  });


  it('no debe permitir guardar un estado vacío', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText(/agregar estado/i));

    const input = screen.getByTestId('Nombre del estado');

    fireEvent.change(input, { target: { value: '   ' } });

    fireEvent.click(screen.getByText(/guardar estado/i));

    expect(mockAddStatus).not.toHaveBeenCalled();
  });


  it('debe agregar un estado correctamente', () => {
    render(<Settings />);

    fireEvent.click(screen.getByText(/agregar estado/i));

    const input = screen.getByTestId('Nombre del estado');
    fireEvent.change(input, { target: { value: 'Revisado' } });

    fireEvent.click(screen.getByText(/guardar estado/i));

    expect(mockAddStatus).toHaveBeenCalledWith('Revisado', 'blue');
  });


  it('debe abrir el modal de edición y actualizar estado', () => {
    render(<Settings />);

    fireEvent.click(screen.getAllByTitle(/editar estado/i)[0]);

    const input = screen.getByTestId('Nombre del estado');
    fireEvent.change(input, { target: { value: 'Pendiente Editado' } });

    fireEvent.click(screen.getByText(/guardar cambios/i));

    expect(mockUpdateStatus).toHaveBeenCalledWith('1', 'Pendiente Editado', expect.any(String));
  });


  it('debe abrir modal de eliminación y permitir cancelar', () => {
    render(<Settings />);

    fireEvent.click(screen.getAllByTitle('Eliminar estado')[0]);

    expect(screen.getByText(/confirmar eliminación/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/cancelar/i));

    expect(screen.queryByText(/confirmar eliminación/i)).not.toBeInTheDocument();
  });

});
