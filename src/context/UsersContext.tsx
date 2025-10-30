import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/claim';

interface UsersContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// Usuarios mock para el sistema
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@sistema.com',
    name: 'Administrador Sistema',
    role: 'admin',
    department: 'Administración',
    position: 'Administrador'
  },
  {
    id: '2',
    email: 'agente@sistema.com',
    name: 'Agente de Servicio',
    role: 'agent',
    department: 'Atención al Cliente',
    position: 'Agente Senior'
  },
  {
    id: '3',
    email: 'maria.gonzalez@sistema.com',
    name: 'María González',
    role: 'agent',
    department: 'Atención al Cliente',
    position: 'Agente'
  },
  {
    id: '4',
    email: 'carlos.rodriguez@sistema.com',
    name: 'Carlos Rodriguez',
    role: 'agent',
    department: 'Soporte Técnico',
    position: 'Técnico Senior'
  },
  {
    id: '5',
    email: 'laura.martinez@sistema.com',
    name: 'Laura Martínez',
    role: 'manager',
    department: 'Gestión',
    position: 'Gerente de Servicio'
  }
];

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : mockUsers;
  });

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`
    };
    saveUsers([...users, newUser]);
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    const updated = users.map(user =>
      user.id === userId ? { ...user, ...userData } : user
    );
    saveUsers(updated);
  };

  const deleteUser = (userId: string) => {
    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  return (
    <UsersContext.Provider value={{
      users,
      addUser,
      updateUser,
      deleteUser,
      getUserById
    }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
};
