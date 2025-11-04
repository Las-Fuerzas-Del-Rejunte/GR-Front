import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StatusProvider } from './context/StatusContext';
import { ClaimsProvider } from './context/ClaimsContext';
import { UsersProvider } from './context/UsersContext';
import { ToastProvider } from './context/ToastContext';
import { CustomersProvider } from './context/CustomersContext';
import { ProjectsProvider } from './context/ProjectsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import PasswordRecovery from './pages/PasswordRecovery';
import Dashboard from './pages/Dashboard';
import KanbanPage from './pages/KanbanPage';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Customers from './pages/Customers';
import Projects from './pages/Projects';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StatusProvider>
          <UsersProvider>
            <CustomersProvider>
              <ProjectsProvider>
                <ClaimsProvider>
                  <ToastProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/recuperar-password" element={<PasswordRecovery />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                <Route index element={<Dashboard />} />
                <Route path="kanban" element={<KanbanPage />} />
                <Route path="estadisticas" element={<Statistics />} />
                <Route path="clientes" element={<Customers />} />
                <Route path="proyectos" element={<Projects />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="configuracion" element={<Settings />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
                  </ToastProvider>
                </ClaimsProvider>
              </ProjectsProvider>
            </CustomersProvider>
          </UsersProvider>
        </StatusProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
