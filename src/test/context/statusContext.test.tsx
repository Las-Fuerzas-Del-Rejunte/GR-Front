import { render, screen, fireEvent } from '@testing-library/react';
import { StatusProvider, useStatuses } from '../../context/StatusContext';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// --- Mock localStorage ---
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => null);
  Storage.prototype.setItem = jest.fn();
  Storage.prototype.removeItem = jest.fn();
});

// --- Test Component ---
const TestComponent = () => {
  const {
    statuses,
    addStatus,
    deleteStatus,
    updateStatus,
    reorderStatuses
  } = useStatuses();

  return (
    <div>
      <button onClick={() => addStatus('Nuevo Estado', 'purple')}>
        add-status
      </button>

      <button
        onClick={() =>
          updateStatus(statuses[0].id, 'Actualizado', 'red')
        }
      >
        update-status
      </button>

      <button onClick={() => deleteStatus(statuses[0].id)}>
        delete-status
      </button>

      <button onClick={() => reorderStatuses(0, statuses.length - 1)}>
        reorder-statuses
      </button>

      <div data-testid="count">{statuses.length}</div>
      <div data-testid="first-name">{statuses[0]?.name ?? 'none'}</div>
      <div data-testid="first-color">{statuses[0]?.color ?? 'none'}</div>
      <div data-testid="last-name">{statuses[statuses.length - 1]?.name ?? 'none'}</div>
    </div>
  );
};

const setup = () =>
  render(
    <StatusProvider>
      <TestComponent />
    </StatusProvider>
  );

describe('StatusContext', () => {

  it('carga los estados por defecto cuando localStorage está vacío', () => {
  setup();

  expect(screen.getByTestId('count').textContent).toBe('4');
  expect(screen.getByTestId('first-name').textContent).toBe('Nuevo');
});


it('addStatus agrega un estado nuevo', () => {
  setup();

  fireEvent.click(screen.getByText('add-status'));

  expect(screen.getByTestId('count').textContent).toBe('5');
  expect(Storage.prototype.setItem).toHaveBeenCalled();
});


it('updateStatus actualiza el nombre y color de un estado', () => {
  setup();

  fireEvent.click(screen.getByText('update-status'));

  expect(screen.getByTestId('first-name').textContent).toBe('Actualizado');
  expect(screen.getByTestId('first-color').textContent).toBe('red');
});


it('deleteStatus elimina un estado', () => {
  setup();

  const firstName = screen.getByTestId('first-name').textContent;

  fireEvent.click(screen.getByText('delete-status'));

  expect(screen.getByTestId('count').textContent).toBe('3');
  expect(screen.getByTestId('first-name').textContent).not.toBe(firstName);
});


it('reorderStatuses mueve el primer estado al final', () => {
  setup();

  const initialFirst = screen.getByTestId('first-name').textContent;

  fireEvent.click(screen.getByText('reorder-statuses'));

  expect(screen.getByTestId('first-name').textContent).not.toBe(initialFirst);
  expect(screen.getByTestId('last-name').textContent).toBe(initialFirst);


  // Además persiste en localStorage
  expect(Storage.prototype.setItem).toHaveBeenCalled();
  });

});

