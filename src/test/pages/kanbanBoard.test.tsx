import { render, screen, fireEvent } from "@testing-library/react";
import KanbanBoard from "../../pages/KanbanBoard";
import { describe, it, expect, jest } from "@jest/globals";

// ---------- Mocks tipados (sin "any") ----------

// Mock KanbanCard
jest.mock("../../components/KanbanCard", () => {
  return function KanbanCardMock(props: Record<string, unknown>) {
    const claim = props.claim as { customerName: string };
    return <div data-testid="kanban-card">{claim.customerName}</div>;
  };
});

// Mock Button
jest.mock("../../components/ui/Button", () => {
  return function ButtonMock(props: Record<string, any>) {
    return (
      <button data-testid="button" {...props}>
        {props.children}
      </button>
    );
  };
});

// Mock iconos de lucide-react
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="icon-search" />,
  Filter: () => <div data-testid="icon-filter" />,
  ChevronDown: () => <div data-testid="icon-chevron" />,
  Plus: () => <div data-testid="icon-plus" />
}));

// Mock Drag & Drop
jest.mock("@hello-pangea/dnd", () => ({
  DragDropContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Droppable: ({
    children
  }: {
    children: (
      provided: any,
      snapshot: unknown
    ) => React.ReactNode;
  }) => (
    <div>
      {children(
        { innerRef: () => {}, droppableProps: {} },
        {}
      )}
    </div>
  ),
  Draggable: ({
    children
  }: {
    children: (
      provided: any,
      snapshot: unknown
    ) => React.ReactNode;
  }) => (
    <div>
      {children(
        {
          innerRef: () => {},
          draggableProps: {},
          dragHandleProps: {}
        },
        {}
      )}
    </div>
  )
}));

// Mock ClaimsContext
jest.mock("../../context/ClaimsContext", () => ({
  useClaims: () => ({
    claims: [
      {
        id: "1",
        customerName: "Juan Pérez",
        status: "Nuevo",
        subject: "A"
      },
      {
        id: "2",
        customerName: "Ana Gómez",
        status: "En Progreso",
        subject: "B"
      }
    ],
    updateClaimStatus: jest.fn(),
    searchClaims: jest.fn(() => [
      {
        id: "1",
        customerName: "Juan Pérez",
        status: "Nuevo",
        subject: "A"
      }
    ])
  })
}));

// Mock StatusContext
jest.mock("../../context/StatusContext", () => ({
  useStatuses: () => ({
    statuses: [
      { id: "s1", name: "Nuevo", color: "blue" },
      { id: "s2", name: "En Progreso", color: "amber" }
    ],
    reorderStatuses: jest.fn()
  })
}));

// ------------------------------------

describe("KanbanBoard", () => {
  const mockOpenNew = jest.fn();
  const mockOpenDetail = jest.fn();

  const renderBoard = () =>
    render(
      <KanbanBoard
        onOpenNewClaim={mockOpenNew}
        onOpenClaimDetail={mockOpenDetail}
      />
    );

  it("renderiza el título principal", () => {
    renderBoard();
    expect(screen.getByText("Vista de Reclamos")).toBeInTheDocument();
  });

  it("muestra las columnas según los statuses mock", () => {
    renderBoard();
    expect(screen.getByText("Nuevo")).toBeInTheDocument();
    expect(screen.getByText("En Progreso")).toBeInTheDocument();
  });

  it("renderiza los reclamos en las columnas correctas", () => {
    renderBoard();
    expect(screen.getAllByTestId("kanban-card").length).toBe(2);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Gómez")).toBeInTheDocument();
  });

  it("filtra reclamos al escribir en el buscador", () => {
    renderBoard();
    fireEvent.change(
      screen.getByPlaceholderText("Buscar por ID, asunto, cliente..."),
      {
        target: { value: "Juan" }
      }
    );

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Ana Gómez")).toBeNull();
  });

  it("ejecuta onOpenNewClaim al presionar el botón", () => {
    renderBoard();
    fireEvent.click(screen.getByText("Nuevo reclamo"));
    expect(mockOpenNew).toHaveBeenCalledTimes(1);
  });

});
