import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import KanbanCard from '../../components/KanbanCard';
import { Claim } from '../../types/claim';

describe('KanbanCard', () => {

  // 🔥 Base Claim con todas las propiedades obligatorias del tipo Claim
  const baseClaim: Claim = {
    id: '1',
    subject: 'Problema con facturación',
    description: 'El sistema no genera la factura',
    priority: 'high',
    status: 'open',

    customerName: 'Cliente Demo',
    contactInfo: 'cliente@ejemplo.com',

    createdAt: new Date('2024-01-15T12:00:00Z'),
    updatedAt: new Date('2024-01-16T13:00:00Z'),

    notes: [{
        id: 'n1', content: 'Revisar',
        claimId: '1',
        author: 'Juan Perez',
        createdAt: new Date('2024-01-15T12:00:00Z')
    }],

    assignedTo: {
      id: 'u1',
      name: 'Juan Perez',
      position: 'Soporte Nivel 1',
      email: 'juanperez@gmail.com',
      role: 'soporte'
    }
  };

  const renderCard = (override: Partial<Claim> = {}) => {
    const claim: Claim = { ...baseClaim, ...override };
    return render(<KanbanCard claim={claim} onClick={jest.fn()} />);
  };

  // ------------------------------------------------------------------

  it('renderiza el título, descripción y fecha correctamente', () => {
    renderCard();

    expect(
      screen.getByText('Problema con facturación')
    ).toBeInTheDocument();

    expect(
      screen.getByText('El sistema no genera la factura')
    ).toBeInTheDocument();

    // Fecha abreviada "15 ene"
    expect(screen.getByText(/15/i)).toBeInTheDocument();
  });

  it('muestra el texto de prioridad "Alta"', () => {
    renderCard();
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('muestra la cantidad de comentarios', () => {
    renderCard();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('llama a onClick al hacer click en la tarjeta', () => {
    const onClickMock = jest.fn();

    render(<KanbanCard claim={baseClaim} onClick={onClickMock} />);

    fireEvent.click(screen.getByText('Problema con facturación'));

    expect(onClickMock).toHaveBeenCalled();
  });

  it('muestra las iniciales del usuario asignado', () => {
    renderCard();
    expect(screen.getByText('JP')).toBeInTheDocument();
  });

  it('muestra "?" cuando no hay assignedTo', () => {
    renderCard({ assignedTo: undefined });
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('muestra el tooltip al hacer hover sobre el avatar', async () => {
    renderCard();

    const avatar = screen.getByText('JP');
    fireEvent.mouseOver(avatar);

    expect(await screen.findByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Soporte Nivel 1')).toBeInTheDocument();
  });
});
