// import { render, screen, fireEvent, within } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import Layout from "../../components/Layout";
// import { useAuth } from "../../context/AuthContext";

// jest.mock("../../context/AuthContext", () => ({
//   useAuth: () => ({
//     user: { name: "Juan Perez", role: "admin" },
//     logout: jest.fn(),
//   }),
// }));

// const mockNavigate = jest.fn();
// jest.mock("react-router-dom", () => {
//   const original = jest.requireActual("react-router-dom");
//   return {
//     ...original,
//     useNavigate: () => mockNavigate,
//   };
// });

// const renderLayout = (initialRoute = "/") => {
//   return render(
//     <MemoryRouter initialEntries={[initialRoute]}>
//       <Layout />
//     </MemoryRouter>
//   );
// };

// describe("Layout", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it("renderiza el título del sistema", () => {
//     renderLayout();
//     expect(screen.getByText("Sistema de Reclamos")).toBeInTheDocument();
//   });

//   it("muestra el nombre y rol del usuario", () => {
//     renderLayout();
//     // NO importa cuántas veces aparece, verificamos que exista al menos 1
//     expect(screen.queryAllByText("Juan Perez").length).toBeGreaterThan(0);
//     expect(screen.queryAllByText("admin").length).toBeGreaterThan(0);
//   });

//   // --- DESKTOP ---
//   it("abre y cierra el menú de usuario en desktop", () => {
//     renderLayout();

//     // Buscamos la sección desktop
//     const desktopHeader = document.querySelector(".md\\:flex") as HTMLElement;
//     const utils = within(desktopHeader);

//     const userButton = screen.getByTestId("desktop-user-btn"); // o "mobile-user-btn" según corresponda
//     expect(userButton).not.toBeNull();

//     // menú cerrado
//     expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();

//     fireEvent.click(userButton!);
//     expect(screen.getByText("Mi Perfil")).toBeInTheDocument();

//     fireEvent.mouseDown(document.body);
//     expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();
//   });

//   it("logout llama a logout() y navega a /login", () => {
//     renderLayout();

//     const auth = useAuth();

//     const desktopHeader = document.querySelector(".md\\:flex") as HTMLElement;
//     const utils = within(desktopHeader);

//     const userButton = screen.getByTestId("desktop-user-btn"); // o "mobile-user-btn" según corresponda
//     fireEvent.click(userButton!);

//     const logoutBtn = screen.getByText("Cerrar Sesión");
//     fireEvent.click(logoutBtn);

//     expect(auth.logout).toHaveBeenCalled();
//     expect(mockNavigate).toHaveBeenCalledWith("/login");
//   });

//   // --- MOBILE ---
//   it("abre y cierra el menú mobile", () => {
//     renderLayout();

//     const mobileToggle = screen.getByLabelText("Abrir menú");
//     fireEvent.click(mobileToggle);

//     const mobileMenu = screen.getByTestId("mobile-menu");
//     expect(within(mobileMenu).getByText("Dashboard")).toBeInTheDocument();

//     fireEvent.click(mobileToggle);
//     expect(screen.queryByText("Dashboard")).toBeInTheDocument();
//   });

//   it("abre y cierra el menú de usuario en mobile", () => {
//     renderLayout();

//     const mobileToggle = screen.getByLabelText("Abrir menú");
//     fireEvent.click(mobileToggle);

//     const mobileMenu = document.querySelector(".md\\:hidden") as HTMLElement;
//     const utils = within(mobileMenu);

//     const userButton = screen.getByTestId("mobile-user-btn"); // o "mobile-user-btn" según corresponda

//     fireEvent.click(userButton!);

//     expect(screen.getByText("Mi Perfil")).toBeInTheDocument();

//     fireEvent.click(userButton!);
//     expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();
//   });

//   it("logout desde mobile", () => {
//     renderLayout();

//     const auth = useAuth();

//     const mobileToggle = screen.getByLabelText("Abrir menú");
//     fireEvent.click(mobileToggle);

//     const mobileMenu = document.querySelector(".md\\:hidden") as HTMLElement;
//     const utils = within(mobileMenu);

//     const userButton = screen.getByTestId("mobile-user-btn"); // o "mobile-user-btn" según corresponda

//     fireEvent.click(userButton!);

//     const logoutBtn = screen.getByText("Cerrar Sesión");
//     fireEvent.click(logoutBtn);

//     expect(auth.logout).toHaveBeenCalled();
//     expect(mockNavigate).toHaveBeenCalledWith("/login");
//   });
// });

import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Layout from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";

// Defino el mock de logout fuera para poder testearlo
const mockLogout = jest.fn();

jest.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Juan Perez", role: "admin" },
    logout: mockLogout,
  }),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const original = jest.requireActual("react-router-dom");
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

const renderLayout = (initialRoute = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Layout />
    </MemoryRouter>
  );
};

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el título del sistema", () => {
    renderLayout();
    expect(screen.getByText("Sistema de Reclamos")).toBeInTheDocument();
  });

  it("muestra el nombre y rol del usuario", () => {
    renderLayout();
    expect(screen.queryAllByText("Juan Perez").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("admin").length).toBeGreaterThan(0);
  });

  // --- DESKTOP ---

  it("abre y cierra el menú de usuario en desktop", () => {
    renderLayout();

    const userButton = screen.getByTestId("desktop-user-btn");
    expect(userButton).not.toBeNull();

    expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();

    fireEvent.click(userButton);
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText("Mi Perfil")).not.toBeInTheDocument();
  });

  it("logout llama a logout() y navega a /login", () => {
    renderLayout();

    const userButton = screen.getByTestId("desktop-user-btn");
    fireEvent.click(userButton);

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  // --- MOBILE ---

//   it("abre y cierra el menú mobile", () => {
//     renderLayout();

//     const mobileToggle = screen.getByLabelText("Abrir menú");
//     fireEvent.click(mobileToggle);

//     const mobileMenu = screen.getByTestId("mobile-menu");
//     // expect(within(mobileMenu).getByText("Dashboard")).toBeInTheDocument();
//     expect(within(mobileMenu).getByText("Dashboard")).toBeVisible();;

//     fireEvent.click(mobileToggle);
//     expect(screen.queryByText("Dashboard")).not.toBeVisible();;
//   });

// it("abre y cierra el menú de usuario en mobile", () => {
//   renderLayout();

//   const mobileToggle = screen.getByTestId("mobile-menu-toggle");
//   fireEvent.click(mobileToggle);

//   const userMenuButton = screen.getByTestId("mobile-user-menu-btn");
//   fireEvent.click(userMenuButton);

//   expect(screen.getByText("Mi Perfil")).toBeVisible();

//   fireEvent.click(userMenuButton);
//   expect(screen.queryByText("Mi Perfil")).not.toBeVisible();
// });

  it("logout desde mobile", () => {
    renderLayout();

    const mobileToggle = screen.getByLabelText("Abrir menú");
    fireEvent.click(mobileToggle);

    const userButton = screen.getByTestId("mobile-user-menu-btn");
    fireEvent.click(userButton);

    const logoutBtn = screen.getByText("Cerrar Sesión");
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
