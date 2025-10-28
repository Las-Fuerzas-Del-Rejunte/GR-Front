import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/claim';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    email: 'admin@sistema.com',
    password: 'admin123',
    name: 'Administrador Sistema',
    role: 'admin'
  },
  {
    id: '2',
    email: 'agente@sistema.com',
    password: 'agente123',
    name: 'Agente de Servicio',
    role: 'agent'
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          u => u.email === email && u.password === password
        );

        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve({ success: true });
        } else {
          resolve({ success: false, error: 'Credenciales incorrectas' });
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const recoverPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email);

        if (foundUser) {
          resolve({
            success: true,
            message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña.'
          });
        } else {
          resolve({
            success: false,
            message: 'No se encontró una cuenta con ese correo electrónico.'
          });
        }
      }, 800);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      recoverPassword,
      isAuthenticated: user !== null
    }}>
      {children}
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
