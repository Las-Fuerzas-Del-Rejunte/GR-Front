import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/claim';
import { authAPI, handleAPIError } from '../services/api';
import { Loader } from '../components/ui/Loader';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario actual al iniciar
  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = localStorage.getItem('access_token');
      const cachedUser = localStorage.getItem('current_user');
      
      if (token) {
        // Si existe usuario en caché, usarlo inmediatamente
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
            setLoading(false);
            
            // Validar token en background (sin bloquear la UI)
            // Solo actualiza si hay cambios o el token expiró
            authAPI.getCurrentUser()
              .then(response => {
                setUser(response.usuario);
                localStorage.setItem('current_user', JSON.stringify(response.usuario));
              })
              .catch(error => {
                console.error('Error refreshing user:', error);
                // Si el token expiró, limpiar y redirigir al login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('current_user');
                setUser(null);
              });
          } catch (error) {
            console.error('Error parsing cached user:', error);
            // Si hay error parseando, llamar a la API
            try {
              const response = await authAPI.getCurrentUser();
              setUser(response.usuario);
            } catch (apiError) {
              console.error('Error loading user:', apiError);
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('current_user');
            }
            setLoading(false);
          }
        } else {
          // No hay caché, llamar a la API
          try {
            const response = await authAPI.getCurrentUser();
            setUser(response.usuario);
          } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('current_user');
          }
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Llamar a la API de login (ya guarda el token y usuario en localStorage)
      const response = await authAPI.login(email, password);
      
      // Usar el usuario de la respuesta del login
      setUser(response.usuario);
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleAPIError(error);
      return { 
        success: false, 
        error: errorMessage === 'Request failed with status code 401' 
          ? 'Credenciales incorrectas' 
          : errorMessage 
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    // Limpiar todos los cachés al cerrar sesión
    localStorage.removeItem('cached_claims');
    localStorage.removeItem('cached_statuses');
    localStorage.removeItem('cached_users');
  };

  const recoverPassword = async (_email: string): Promise<{ success: boolean; message: string }> => {
    // TODO: Implementar recuperación de contraseña en el backend
    // await authAPI.forgotPassword(email);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña.'
        });
      }, 800);
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      recoverPassword,
      updateUser,
      isAuthenticated: user !== null,
      loading
    }}>
      {loading ? (
        <Loader variant="gradient" message="Verificando autenticación..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
