import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types/claim';
import { usersAPI } from '../services/api';
import { useToast } from './ToastContext';

interface UsersContextType {
  users: User[];
  loading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addUser: (user: Omit<User, 'id'> & { password: string }) => Promise<void>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  getUserById: (userId: string) => User | undefined;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => {
    // Cargar desde localStorage al inicializar
    const cached = localStorage.getItem('cached_users');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const refreshUsers = async () => {
    setLoading(true);
    try {
      // Solicitar todos los usuarios (limite maximo es 100 segun API)
      const response = await usersAPI.getAll({ limite: 100 });
      const usersData = response.datos;
      
      // Si hay más de 100 usuarios, necesitamos cargar todas las páginas
      if (response.paginacion.total > 100) {
        const totalPages = response.paginacion.total_paginas;
        const allUsers = [...usersData];
        
        for (let page = 2; page <= totalPages; page++) {
          const pageResponse = await usersAPI.getAll({ limite: 100, pagina: page });
          allUsers.push(...pageResponse.datos);
        }
        
        setUsers(allUsers);
        localStorage.setItem('cached_users', JSON.stringify(allUsers));
      } else {
        setUsers(usersData);
        localStorage.setItem('cached_users', JSON.stringify(usersData));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los usuarios'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper para actualizar users y localStorage
  const updateUsersAndCache = (updater: (prevUsers: User[]) => User[]) => {
    setUsers(prev => {
      const updated = updater(prev);
      localStorage.setItem('cached_users', JSON.stringify(updated));
      return updated;
    });
  };

  const addUser = async (userData: Omit<User, 'id'> & { password: string }) => {
    setIsCreating(true);
    try {
      const newUser = await usersAPI.create(userData);
      updateUsersAndCache(prev => [...prev, newUser]);
      showToast({
        type: 'success',
        title: 'Usuario creado',
        message: 'El usuario se ha creado correctamente'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear el usuario'
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>) => {
    setIsUpdating(true);
    try {
      const updatedUser = await usersAPI.update(userId, userData);
      updateUsersAndCache(prev => prev.map(user => user.id === userId ? updatedUser : user));
      showToast({
        type: 'success',
        title: 'Usuario actualizado',
        message: 'El usuario se ha actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el usuario'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsDeleting(true);
    try {
      await usersAPI.delete(userId);
      updateUsersAndCache(prev => prev.filter(u => u.id !== userId));
      showToast({
        type: 'success',
        title: 'Usuario eliminado',
        message: 'El usuario se ha eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el usuario'
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  return (
    <UsersContext.Provider value={{
      users,
      loading,
      isCreating,
      isUpdating,
      isDeleting,
      addUser,
      updateUser,
      deleteUser,
      getUserById,
      refreshUsers
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
