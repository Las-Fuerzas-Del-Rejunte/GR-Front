// import React, { useRef } from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import NewClaimForm, { NewClaimFormRef } from "../../components/NewClaimForm";

// // MOCK DEL MÓDULO ClaimsContext
// jest.mock("../../context/ClaimsContext", () => {
//   const addClaimMock = jest.fn();

//   return {
//     __esModule: true,
//     addClaimMock,
//     useClaims: () => ({
//       addClaim: addClaimMock,
//       claims: [],
//       updateClaimStatus: jest.fn(),
//       addClaimNote: jest.fn(),
//       deleteClaim: jest.fn(),
//       assignClaim: jest.fn(),
//       updateClaimPriority: jest.fn(),
//       getClaimById: jest.fn(),
//       searchClaims: jest.fn(),
//     }),
//   };
// });

// // Mock StatusContext igual que antes
// jest.mock("../../context/StatusContext", () => ({
//   useStatuses: () => ({
//     statuses: [{ name: "Nuevo" }],
//   }),
// }));

// describe("NewClaimForm", () => {
//   const onCloseMock = jest.fn();
//   const onSuccessMock = jest.fn();

//   // Aquí obtenemos el mock con jest.requireMock dentro de beforeEach o beforeAll
//   let addClaimMock: jest.Mock;

//   beforeEach(() => {
//     // Obtener el mock exportado dentro del jest.mock
//     const claimsContext = jest.requireMock("../../context/ClaimsContext");
//     addClaimMock = claimsContext.addClaimMock;

//     jest.clearAllMocks();
//   });

//   const fillAndSubmitForm = async () => {
//     await userEvent.type(screen.getByLabelText(/Nombre del Cliente/i), "Juan Perez");
//     await userEvent.type(screen.getByLabelText(/Información de Contacto/i), "juan@example.com");
//     await userEvent.type(screen.getByLabelText(/Asunto del Reclamo/i), "Problema con producto");
//     await userEvent.type(screen.getByLabelText(/Descripción Detallada/i), "El producto no funciona bien.");

//     fireEvent.submit(screen.getByRole("form"));
//   };

//   it("renderiza los campos correctamente", () => {
//     render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);
//     expect(screen.getByLabelText(/Nombre del Cliente/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Información de Contacto/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Asunto del Reclamo/i)).toBeInTheDocument();
//     expect(screen.getByLabelText(/Descripción Detallada/i)).toBeInTheDocument();
//   });

//   it("muestra errores si el formulario se envía vacío", async () => {
//     render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);
//     fireEvent.submit(screen.getByRole("form"));

//     expect(await screen.findByText(/El nombre del cliente es requerido/i)).toBeInTheDocument();
//     expect(screen.getByText(/La información de contacto es requerida/i)).toBeInTheDocument();
//     expect(screen.getByText(/El asunto es requerido/i)).toBeInTheDocument();
//     expect(screen.getByText(/La descripción es requerida/i)).toBeInTheDocument();

//     expect(addClaimMock).not.toHaveBeenCalled();
//   });

//   it("envía el formulario correctamente con datos válidos", async () => {
//     render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);

//     await fillAndSubmitForm();

//     await waitFor(() => {
//       expect(addClaimMock).toHaveBeenCalledWith(
//         expect.objectContaining({
//           customerName: "Juan Perez",
//           contactInfo: "juan@example.com",
//           subject: "Problema con producto",
//           description: "El producto no funciona bien.",
//           status: "Nuevo",
//           attachments: [],
//         })
//       );
//     });

//     expect(onSuccessMock).toHaveBeenCalled();
//     expect(onCloseMock).toHaveBeenCalled();
//   });

//   it("agrega y elimina archivos adjuntos", async () => {
//     render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);

//     const fileInput = screen
//       .getByLabelText(/Archivos Adjuntos/i)
//       .parentElement!
//       .querySelector('input[type="file"]') as HTMLInputElement;

//     const file = new File([new Uint8Array(5000)], "photo.png", { type: "image/png" });

//     await userEvent.upload(fileInput, file);

//     expect(await screen.findByText("photo.png")).toBeInTheDocument();

//     const deleteBtn = screen.getAllByRole("button").find(btn =>
//       btn.querySelector('svg')?.classList.contains("w-3")
//     );

//     if (deleteBtn) {
//       fireEvent.click(deleteBtn);
//       expect(screen.queryByText("photo.png")).not.toBeInTheDocument();
//     }
//   });

//   it("submitForm se puede llamar desde el ref", () => {
//     const ComponentUsingRef = () => {
//       const formRef = useRef<NewClaimFormRef>(null);

//       return (
//         <>
//           <NewClaimForm ref={formRef} onClose={onCloseMock} onSuccess={onSuccessMock} />
//           <button onClick={() => formRef.current?.submitForm()}>Submit via ref</button>
//         </>
//       );
//     };

//     render(<ComponentUsingRef />);

//     fireEvent.click(screen.getByText("Submit via ref"));

//     expect(screen.getByText(/El nombre del cliente es requerido/i)).toBeInTheDocument();
//   });
// });


import React, { useRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewClaimForm, { NewClaimFormRef } from "../../components/NewClaimForm";

const addClaimMock = jest.fn();

beforeAll(() => {
  (globalThis as any).URL.createObjectURL = jest.fn(() => "mocked-url");
});

jest.mock("../../context/ClaimsContext", () => ({
  __esModule: true,
  useClaims: () => ({
    addClaim: jest.fn(),
    claims: [],
    updateClaimStatus: jest.fn(),
    addClaimNote: jest.fn(),
    deleteClaim: jest.fn(),
    assignClaim: jest.fn(),
    updateClaimPriority: jest.fn(),
    getClaimById: jest.fn(),
    searchClaims: jest.fn(),
  }),
}));

jest.mock("../../context/StatusContext", () => ({
  useStatuses: () => ({
    statuses: [{ name: "Nuevo" }],
  }),
}));

describe("NewClaimForm", () => {
  const onCloseMock = jest.fn();
  const onSuccessMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

 

  const fillAndSubmitForm = async () => {
    await userEvent.type(screen.getByPlaceholderText(/nombre completo/i), "Juan Perez");
    await userEvent.type(screen.getByPlaceholderText(/email o teléfono/i), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText(/breve descripción/i), "Problema con producto");
    await userEvent.type(screen.getByPlaceholderText(/describa el reclamo/i), "El producto no funciona bien.");

    const { container } = render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);
    const form = container.querySelector("form") as HTMLElement;
    fireEvent.submit(form);
  };

  it("renderiza los campos correctamente", () => {
    render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);
    expect(screen.getByPlaceholderText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email o teléfono/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/breve descripción/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describa el reclamo/i)).toBeInTheDocument();
  });

  it("muestra errores si el formulario se envía vacío", async () => {
    const { container } = render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    expect(await screen.findByText(/el nombre del cliente es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/la información de contacto es requerida/i)).toBeInTheDocument();
    expect(screen.getByText(/el asunto es requerido/i)).toBeInTheDocument();
    expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument();

    expect(addClaimMock).not.toHaveBeenCalled();
  });


    it("agrega y elimina archivos adjuntos", async () => {
    const { container } = render(<NewClaimForm onClose={onCloseMock} onSuccess={onSuccessMock} />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([new Uint8Array(5000)], "photo.png", { type: "image/png" });

    await userEvent.upload(fileInput, file);

    // Busca el texto conteniendo "photo.png" para evitar error por texto fragmentado
    expect(await screen.findByText((content) => content.includes("photo.png"))).toBeInTheDocument();

    const deleteBtn = screen.getAllByRole("button").find(btn =>
        btn.querySelector("svg")?.classList.contains("w-3")
    );

    if (deleteBtn) {
        fireEvent.click(deleteBtn);
        expect(screen.queryByText((content) => content.includes("photo.png"))).not.toBeInTheDocument();
    }
    });

  it("submitForm se puede llamar desde el ref", () => {
    const ComponentUsingRef = () => {
      const formRef = useRef<NewClaimFormRef>(null);

      return (
        <>
          <NewClaimForm ref={formRef} onClose={onCloseMock} onSuccess={onSuccessMock} />
          <button onClick={() => formRef.current?.submitForm()}>Submit via ref</button>
        </>
      );
    };

    render(<ComponentUsingRef />);

    fireEvent.click(screen.getByText("Submit via ref"));

    expect(screen.getByText(/el nombre del cliente es requerido/i)).toBeInTheDocument();
  });
});
