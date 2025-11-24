import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider, useToast } from '../../context/ToastContext';
import { describe, it, expect, jest } from '@jest/globals';

// Mock del Toast
jest.mock('../../components/ui/Toast', () => ({
  __esModule: true,
  default: (props: {
    id: string;
    title: string;
    message?: string;
    onClose: (id: string) => void;
  }) => (
    <div data-testid="toast">
      <span data-testid="toast-title">{props.title}</span>
      <span data-testid="toast-message">{props.message}</span>
      <button
        data-testid="toast-close"
        onClick={() => props.onClose(props.id)}
      >
        close
      </button>
    </div>
  )
}));

// componente para test
const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button
        onClick={() =>
          showToast({
            type: 'success',
            title: 'Operación exitosa',
            message: 'Todo salió bien'
          })
        }
      >
        show-success
      </button>

      <button
        onClick={() =>
          showToast({
            type: 'error',
            title: 'Error',
            message: 'Ocurrió un problema'
          })
        }
      >
        show-error
      </button>
    </div>
  );
};

// Helper render
const setup = () =>
  render(
    <ToastProvider>
      <TestComponent />
    </ToastProvider>
  );


//Pruebas de la clase

describe('ToastContext', () => {
  it('showToast agrega un toast al DOM', () => {
    setup();

    fireEvent.click(screen.getByText('show-success'));

    expect(screen.getByTestId('toast-title').textContent).toBe('Operación exitosa');
    expect(screen.getByTestId('toast-message').textContent).toBe('Todo salió bien');
  });

  it('puede mostrar un toast de error', () => {
    setup();

    fireEvent.click(screen.getByText('show-error'));

    expect(screen.getByTestId('toast-title').textContent).toBe('Error');
    expect(screen.getByTestId('toast-message').textContent).toBe('Ocurrió un problema');
  });

  it('onClose elimina el toast', () => {
    setup();

    fireEvent.click(screen.getByText('show-success'));

    // Antes existe
    expect(screen.getByTestId('toast')).toBeTruthy();

    // Cerrar
    fireEvent.click(screen.getByTestId('toast-close'));

    // Después desaparece
    expect(screen.queryByTestId('toast')).toBeNull();
  });
});
