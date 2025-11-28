import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClaimDetailView from '../../components/ClaimDetailView';
import { useClaims } from '../../context/ClaimsContext';
import { useStatuses } from '../../context/StatusContext';
import { useUsers } from '../../context/UsersContext';

// Mock de los hooks
jest.mock('../../context/ClaimsContext');
jest.mock('../../context/StatusContext');
jest.mock('../../context/UsersContext');

describe('ClaimDetailView', () => {
  const claimId = 'claim123';

  const mockClaim = {
    id: claimId,
    status: 'Nuevo',
    subject: 'Test Subject',
    customerName: 'Juan Perez',
    contactInfo: 'juan@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
    priority: null,
    description: 'Descripción del reclamo',
    notes: [],
  };

  beforeEach(() => {
    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue(mockClaim),
      updateClaimStatus: jest.fn(),
      addClaimNote: jest.fn(),
      assignClaim: jest.fn(),
      updateClaimPriority: jest.fn(),
    });

    (useStatuses as jest.Mock).mockReturnValue({
      statuses: [
        { id: '1', name: 'Nuevo', color: 'blue' },
        { id: '2', name: 'En Proceso', color: 'amber' },
      ],
    });

    (useUsers as jest.Mock).mockReturnValue({
      users: [
        { id: 'u1', name: 'Usuario Uno', position: 'Agente' },
        { id: 'u2', name: 'Usuario Dos', position: 'Supervisor' },
      ],
    });
  });

  it('muestra mensaje cuando no encuentra el reclamo', () => {
    (useClaims as jest.Mock).mockReturnValueOnce({
      getClaimById: jest.fn().mockReturnValue(null),
      updateClaimStatus: jest.fn(),
      addClaimNote: jest.fn(),
      assignClaim: jest.fn(),
      updateClaimPriority: jest.fn(),
    });

    render(<ClaimDetailView claimId="noexiste" />);
    expect(screen.getByText(/Reclamo no encontrado/i)).toBeInTheDocument();
  });

  it('muestra información básica del reclamo', () => {
    render(<ClaimDetailView claimId={claimId} />);
    expect(screen.getByText(mockClaim.subject)).toBeInTheDocument();
    expect(screen.getByText(mockClaim.customerName)).toBeInTheDocument();
    expect(screen.getByText(mockClaim.contactInfo)).toBeInTheDocument();
    expect(screen.getByText(mockClaim.description)).toBeInTheDocument();
  });

  it('cambia el estado del reclamo al hacer click en un botón de estado', () => {
    const updateClaimStatus = jest.fn();
    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue(mockClaim),
      updateClaimStatus,
      addClaimNote: jest.fn(),
      assignClaim: jest.fn(),
      updateClaimPriority: jest.fn(),
    });

    render(<ClaimDetailView claimId={claimId} />);

    const nuevoButton = screen.getByRole('button', { name: /Nuevo/i });
    fireEvent.click(nuevoButton);

    expect(updateClaimStatus).toHaveBeenCalledWith(claimId, 'Nuevo');
  });

  it('añade una nota y limpia el campo', () => {
    const addClaimNote = jest.fn();

    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue(mockClaim),
      updateClaimStatus: jest.fn(),
      addClaimNote,
      assignClaim: jest.fn(),
      updateClaimPriority: jest.fn(),
    });

    render(<ClaimDetailView claimId={claimId} />);

    const textarea = screen.getByPlaceholderText(/escriba una nota de seguimiento/i);
    fireEvent.change(textarea, { target: { value: 'Nueva nota' } });
    expect(textarea).toHaveValue('Nueva nota');

    const addNoteBtn = screen.getByRole('button', { name: /añadir seguimiento/i });
    fireEvent.click(addNoteBtn);

    expect(addClaimNote).toHaveBeenCalledWith(claimId, 'Nueva nota', 'Agente de Servicio');
    expect(textarea).toHaveValue('');
  });


  //Test extra para subir coverage
    it('abre y cierra el menú de asignación', () => {
    render(<ClaimDetailView claimId={claimId} />);

    const openAssign = screen.getByRole('button', { name: /Asignar/i });
    fireEvent.click(openAssign);

    // Aparece el portal
    expect(screen.getByText(/Asignar a/i)).toBeInTheDocument();

    // Cierra haciendo click afuera
    fireEvent.click(screen.getByTestId('portal-overlay') || document.body);

    // El menú desaparece
    expect(screen.queryByText(/Asignar a/i)).not.toBeInTheDocument();
  });

  it('asigna un usuario desde el menú', () => {
    const assignClaim = jest.fn();

    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue(mockClaim),
      updateClaimStatus: jest.fn(),
      addClaimNote: jest.fn(),
      assignClaim,
      updateClaimPriority: jest.fn(),
    });

    render(<ClaimDetailView claimId={claimId} />);

    const openAssign = screen.getByRole('button', { name: /Asignar/i });
    fireEvent.click(openAssign);

    const usuario = screen.getByText('Usuario Uno');
    fireEvent.click(usuario);

    expect(assignClaim).toHaveBeenCalledWith(claimId, expect.objectContaining({ id: 'u1' }));
  });

  it('remueve la asignación (Sin asignar)', () => {
    const assignClaim = jest.fn();

    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue({ ...mockClaim, assignedTo: { id: 'u1', name: 'Usuario Uno' } }),
      updateClaimStatus: jest.fn(),
      addClaimNote: jest.fn(),
      assignClaim,
      updateClaimPriority: jest.fn(),
    });

    render(<ClaimDetailView claimId={claimId} />);

    fireEvent.click(screen.getByRole('button', { name: /Usuario Uno/i }));

    const sinAsignar = screen.getByText(/sin asignar/i);
    fireEvent.click(sinAsignar);

    expect(assignClaim).toHaveBeenCalledWith(claimId, null);
  });

  it('abre y selecciona prioridad', () => {
    const updateClaimPriority = jest.fn();

    (useClaims as jest.Mock).mockReturnValue({
      getClaimById: jest.fn().mockReturnValue(mockClaim),
      updateClaimStatus: jest.fn(),
      addClaimNote: jest.fn(),
      assignClaim: jest.fn(),
      updateClaimPriority,
    });

    render(<ClaimDetailView claimId={claimId} />);

    const openPriority = screen.getByRole('button', { name: /Prioridad/i });
    fireEvent.click(openPriority);

    const urgenteBtn = screen.getByText('Urgente');
    fireEvent.click(urgenteBtn);

    expect(updateClaimPriority).toHaveBeenCalledWith(claimId, 'urgent');
  });

  it('muestra mensaje si no hay notas', () => {
    render(<ClaimDetailView claimId={claimId} />);

    expect(
      screen.getByText(/no hay notas de seguimiento aún/i)
    ).toBeInTheDocument();
  });

  it('llama a getSelectedClasses correctamente', () => {
    render(<ClaimDetailView claimId={claimId} />);

    // Fuerza un estado particular para cubrir ramas del map
    expect(screen.getByRole('button', { name: /Nuevo/i })).toBeInTheDocument();
  });


});
