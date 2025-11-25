
import { render, screen, fireEvent } from "@testing-library/react";
import KanbanPage from "../../pages/KanbanPage";
import { describe, it, expect, jest, beforeEach} from "@jest/globals";

// ---- MOCKS PRINCIPALES ----
const mockDeleteClaim = jest.fn();
const mockShowToast = jest.fn();

// ---- MOCK KANBANBOARD ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock("../../pages/KanbanBoard", () => (props: any) => (
  <div>
    <button onClick={() => props.onOpenNewClaim()}>open-new</button>
    <button onClick={() => props.onOpenClaimDetail("123")}>open-detail</button>
  </div>
));

// ---- MOCK CLAIMSCONTEXT ----
jest.mock("../../context/ClaimsContext", () => ({
  useClaims: () => ({
    deleteClaim: mockDeleteClaim
  }),
}));

// ---- MOCK TOASTCONTEXT ----
jest.mock("../../context/ToastContext", () => ({
  useToast: () => ({
    showToast: mockShowToast
  }),
}));



// ---- MOCK NEWCLAIMFORM ----
jest.mock("../../components/NewClaimForm", () => {
  return function MockForm() {
    return <div>form-content</div>;
  };
});

// ---- MOCK CLAIMDETAILVIEW ----
jest.mock("../../components/ClaimDetailView", () => {
  return function MockDetail() {
    return <div>claim-detail-view</div>;
  };
});

describe("KanbanPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("abre y cierra el modal de nuevo reclamo", () => {
    render(<KanbanPage />);

    fireEvent.click(screen.getByText("open-new"));
    expect(screen.getByText("Registrar Nuevo Reclamo")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Registrar Nuevo Reclamo")).not.toBeInTheDocument();
  });

  it("abre y cierra el modal de detalle de reclamo", () => {
    render(<KanbanPage />);

    fireEvent.click(screen.getByText("open-detail"));
    expect(screen.getByText("Detalle del Reclamo")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Cerrar"));
    expect(screen.queryByText("Detalle del Reclamo")).not.toBeInTheDocument();
  });

  it("ejecuta deleteClaim y showToast al confirmar eliminación", () => {
    render(<KanbanPage />);

    fireEvent.click(screen.getByText("open-detail"));
    fireEvent.click(screen.getByText("Eliminar Reclamo"));
    fireEvent.click(screen.getByText("Confirmar Eliminación"));

    expect(mockDeleteClaim).toHaveBeenCalledWith("123");
    expect(mockShowToast).toHaveBeenCalled();
  });
});