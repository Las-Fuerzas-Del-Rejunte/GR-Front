import { render, screen, fireEvent} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PasswordRecovery from "../../pages/PasswordRecovery";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext");

const mockRecoverPassword = jest.fn();

(useAuth as jest.Mock).mockReturnValue({
  recoverPassword: mockRecoverPassword,
});

describe("PasswordRecovery Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el campo de email y el botón", () => {
    render(
      <MemoryRouter>
        <PasswordRecovery />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    ).toBeInTheDocument();
  });

  it("muestra un mensaje de error si la recuperación falla", async () => {
    mockRecoverPassword.mockResolvedValue({
      success: false,
      message: "Correo no encontrado",
    });

    render(
      <MemoryRouter>
        <PasswordRecovery />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "x@x.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(await screen.findByText(/correo no encontrado/i)).toBeInTheDocument();
  });

  it("muestra pantalla de éxito si la recuperación es exitosa", async () => {
    mockRecoverPassword.mockResolvedValue({
      success: true,
      message: "Enviamos un correo con instrucciones",
    });

    render(
      <MemoryRouter>
        <PasswordRecovery />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "admin@sistema.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      await screen.findByText(/enviamos un correo con instrucciones/i)
    ).toBeInTheDocument();

    // Se muestra el botón verde de éxito
    expect(
      screen.getByRole("button", { name: /volver al inicio de sesión/i })
    ).toBeInTheDocument();
  });

  it("deshabilita el botón mientras carga", async () => {
    mockRecoverPassword.mockImplementation(
      () => new Promise((resolve) =>
        setTimeout(() => resolve({ success: true, message: "" }), 500)
      )
    );

    render(
      <MemoryRouter>
        <PasswordRecovery />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "a@a.com" },
    });

    const submitButton = screen.getByRole("button", {
      name: /enviar instrucciones/i,
    });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
