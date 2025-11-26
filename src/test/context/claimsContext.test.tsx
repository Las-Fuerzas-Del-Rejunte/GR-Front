import { render, screen, fireEvent } from '@testing-library/react';
import { ClaimsProvider, useClaims } from '../../context/ClaimsContext';
import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { mockClaims } from '../../data/mockData';


// Mock ID estable
beforeAll(() => {
  jest.spyOn(Date, 'now').mockReturnValue(123456789);
});

// --- Test Component ---
const TestComponent = () => {
  const {
    claims,
    addClaim,
    updateClaimStatus,
    addClaimNote,
    deleteClaim,
    assignClaim,
    updateClaimPriority,
    searchClaims
  } = useClaims();

  const first = claims[0];

  return (
    <div>
      <button
        onClick={() =>
          addClaim({
            subject: 'Nuevo reclamo',
            description: 'Descripción test',
            customerName: 'Juan Pérez',
            status: 'open',
            priority: 'low',
            assignedTo: null,
            contactInfo: 'a@a.com / 123',
          })
        }
      >
        add-claim
      </button>

      <button onClick={() => first && updateClaimStatus(first.id, 'closed')}>
        update-status
      </button>

      <button onClick={() => first && addClaimNote(first.id, 'Nota test', 'Tester')}>
        add-note
      </button>

      <button onClick={() => first && deleteClaim(first.id)}>
        delete-claim
      </button>

      <button
        onClick={() =>
          first &&
          assignClaim(first.id, {
            id: 'u1',
            name: 'Pepe',
            email: 'pepe@mail.com',
            role: 'agent'
          })
        }
      >
        assign-claim
      </button>

      <button onClick={() => first && updateClaimPriority(first.id, 'urgent')}>
        update-priority
      </button>

      <input
        data-testid="search-input"
        onChange={(e) => searchClaims(e.target.value)}
      />

      <div data-testid="claims-count">{claims.length}</div>
      <div data-testid="first-subject">{first?.subject ?? 'none'}</div>
      <div data-testid="first-status">{first?.status ?? 'none'}</div>
      <div data-testid="first-priority">{first?.priority ?? 'none'}</div>
      <div data-testid="notes-count">{first?.notes.length ?? 0}</div>
      <div data-testid="assigned-to">{first?.assignedTo?.name ?? 'none'}</div>
    </div>
  );
};

// Helper render
const setup = () =>
  render(
    <ClaimsProvider>
      <TestComponent />
    </ClaimsProvider>
  );


//Pruebas

describe('ClaimsContext', () => {

  it('addClaim agrega reclamo nuevo', () => {
    setup();

    fireEvent.click(screen.getByText('add-claim'));

    expect(screen.getByTestId('claims-count').textContent).toBe(String(mockClaims.length + 1));
    expect(screen.getByTestId('first-subject').textContent).toBe('Nuevo reclamo');
  });


  it('updateClaimStatus actualiza estado', () => {
    setup();
    fireEvent.click(screen.getByText('add-claim'));
    fireEvent.click(screen.getByText('update-status'));

    expect(screen.getByTestId('first-status').textContent).toBe('closed');
  });


  it('addClaimNote agrega una nota', () => {
    setup();
    fireEvent.click(screen.getByText('add-claim'));
    fireEvent.click(screen.getByText('add-note'));

    expect(screen.getByTestId('notes-count').textContent).toBe('1');
  });


  it('deleteClaim elimina un reclamo', () => {
    setup();

    // Agrego nuevo reclamo → ahora es first
    fireEvent.click(screen.getByText('add-claim'));

    const nuevo = screen.getByTestId('first-subject').textContent;

    // Lo elimino
    fireEvent.click(screen.getByText('delete-claim'));

    // El nuevo YA NO debe ser el primero
    expect(screen.getByTestId('first-subject').textContent).not.toBe(nuevo);
    });


  it('assignClaim asigna un usuario', () => {
    setup();
    fireEvent.click(screen.getByText('add-claim'));
    fireEvent.click(screen.getByText('assign-claim'));

    expect(screen.getByTestId('assigned-to').textContent).toBe('Pepe');
  });


  it('updateClaimPriority actualiza prioridad', () => {
    setup();
    fireEvent.click(screen.getByText('add-claim'));
    fireEvent.click(screen.getByText('update-priority'));

    expect(screen.getByTestId('first-priority').textContent).toBe('urgent');
  });

  
  it('searchClaims ejecuta búsqueda sin romper', () => {
    setup();
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'nuevo' }
    });

    expect(true).toBe(true);
  });
});
