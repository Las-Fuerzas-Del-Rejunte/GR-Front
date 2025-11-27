import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast, { ToastType } from '../../components/ui/Toast';

jest.useFakeTimers();

const defaultProps = {
  id: 'toast1',
  title: 'Título de prueba',
  message: 'Mensaje de prueba',
  onClose: jest.fn(),
};

const renderToast = (props = {}) => {
  return render(<Toast type={'success'} {...defaultProps} {...props} />);
};

describe('Toast component', () => {
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('muestra título y mensaje', () => {
    renderToast();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.message!)).toBeInTheDocument();
  });

  it.each([
    ['success', 'bg-green-50', 'CheckCircle'],
    ['error', 'bg-red-50', 'AlertCircle'],
    ['warning', 'bg-yellow-50', 'AlertTriangle'],
    ['info', 'bg-blue-50', 'Info'],
  ])('renderiza el tipo %s con clases y icono correctos', (type: ToastType, expectedClass, iconName) => {
    renderToast({ type });

    const container = screen.getByText(defaultProps.title).parentElement!.parentElement!;
    expect(container).toHaveClass(expectedClass);

    // Como los iconos son componentes SVG importados de 'lucide-react',
    // podemos verificar que el icono esperado está en el documento buscando la clase CSS de color.
    // Ejemplo: check si tiene el color correcto para el tipo
    const iconColors = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
    };

    expect(container.querySelector('svg')).toHaveClass(iconColors[type]);
  });

  it('se muestra y aplica animación de entrada (isVisible)', () => {
    const { container } = renderToast();

    // Inicialmente está invisible por el timeout 10ms
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('opacity-0');

    // Avanzamos el timer para que se active isVisible
    act(() => {
      jest.advanceTimersByTime(20);
    });

    expect(wrapper).toHaveClass('opacity-100');
  });

  it('llama a onClose al hacer click en botón cerrar y ejecuta animación de salida', () => {
    renderToast();

    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);

    // El componente entra en estado de salida (isLeaving)
    // La clase debe cambiar a opacity 0 con transform

    const wrapper = closeBtn.closest('div')!.parentElement!;
    expect(wrapper).toHaveClass('opacity-0');

    // onClose se llama después de 200ms
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.id);
  });

  it('se cierra automáticamente después del duration (default 4000ms)', () => {
    renderToast();

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Debería llamar a onClose luego de 4000ms + 200ms animación salida
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.id);
  });

  it('usa duration personalizado', () => {
    renderToast({ duration: 1000 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(defaultProps.onClose).toHaveBeenCalledWith(defaultProps.id);
  });
});
