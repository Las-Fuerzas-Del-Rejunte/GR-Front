import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AreaChartCards from '../../components/AreaChartCards';

describe('AreaChartCards', () => {
  const mockStatuses = [
    { id: 1, name: 'Resuelto' },
    { id: 2, name: 'En progreso' },
  ];

  const mockClaims = [
    {
      id: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'En progreso',
    },
    {
      id: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'Resuelto',
    },
  ];

  it('renderiza las tres tarjetas con sus títulos', () => {
    render(
      <AreaChartCards
        claimsData={mockClaims}
        totalOpen={5}
        newToday={2}
        resolvedLastWeek={3}
        statuses={mockStatuses}
      />
    );

    expect(screen.getByText('Reclamos Abiertos')).toBeInTheDocument();
    expect(screen.getByText('Nuevos Hoy')).toBeInTheDocument();
    expect(screen.getByText('Resueltos (7 días)')).toBeInTheDocument();
  });

  it('muestra los valores correctos en las tarjetas', () => {
    render(
      <AreaChartCards
        claimsData={mockClaims}
        totalOpen={5}
        newToday={2}
        resolvedLastWeek={3}
        statuses={mockStatuses}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renderiza un gráfico por cada tarjeta', () => {
    render(
      <AreaChartCards
        claimsData={mockClaims}
        totalOpen={5}
        newToday={2}
        resolvedLastWeek={3}
        statuses={mockStatuses}
      />
    );

    // gracias al mock, buscamos el div marcado
    const areas = screen.getAllByTestId('area-chart-line');
    expect(areas).toHaveLength(3);
  });
});
