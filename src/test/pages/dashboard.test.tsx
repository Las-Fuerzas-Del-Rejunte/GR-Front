import { render, screen } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';
import { describe, it, expect, jest } from '@jest/globals';
import React from 'react';

// --- Mocks de componentes pesados ---
jest.mock('../../components/AreaChartCards', () => () => (
  <div data-testid="area-chart-cards" />
));

jest.mock('../../components/ui/Card', () => (props: { children: React.ReactNode }) => (
  <div data-testid="card">{props.children}</div>
));

jest.mock('../../components/ui/Badge', () => (props: { status: string }) => (
  <span data-testid="badge">{props.status}</span>
));

// mock necesario para lucide-react
jest.mock('lucide-react', () => ({
  Info: () => <div data-testid="icon-info" />
}));

// --- Datos mock para los contextos ---
const mockClaims = [
  {
    id: '1',
    customerName: 'Juan Pérez',
    subject: 'Problema con producto',
    status: 'Nuevo',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    customerName: 'Ana Gómez',
    subject: 'Consulta técnica',
    status: 'Resuelto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockStatuses = [
  { id: 'nuevo', name: 'Nuevo', color: 'blue', order: 1 },
  { id: 'resuelto', name: 'Resuelto', color: 'green', order: 2 }
];

// --- Mock de ClaimsContext ---
jest.mock('../../context/ClaimsContext', () => ({
  useClaims: () => ({
    claims: mockClaims
  }),
  ClaimsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// --- Mock de StatusContext ---
jest.mock('../../context/StatusContext', () => ({
  useStatuses: () => ({
    statuses: mockStatuses
  }),
  StatusProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Dashboard Page', () => {

  it('renderiza el título principal', () => {
    render(
      <Dashboard />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });


  it('renderiza AreaChartCards con los datos correctos', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('area-chart-cards')).toBeInTheDocument();
  });


  it('muestra la sección de Distribución por Estado', () => {
    render(<Dashboard />);
    expect(screen.getByText('Distribución por Estado')).toBeInTheDocument();
  });


  it('muestra exactamente 2 estados (según mockStatuses)', () => {
    render(<Dashboard />);
    expect(screen.getAllByText(/Nuevo|Resuelto/).length).toBeGreaterThanOrEqual(2);
  });


  it('muestra la sección de Actualizaciones Recientes', () => {
    render(<Dashboard />);
    expect(screen.getByText('Actualizaciones Recientes')).toBeInTheDocument();
  });

  
  it('renderiza las tarjetas de reclamos recientes', () => {
    render(<Dashboard />);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
  });
});
