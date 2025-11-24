import { renderHook, act } from '@testing-library/react';
import { UsersProvider, useUsers } from '../../context/UsersContext';
import { describe, it, expect, beforeEach} from '@jest/globals';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UsersProvider>{children}</UsersProvider>
);

//Pruebas de la clase
describe('UsersContext', () => {
    beforeEach(() => {
      localStorage.clear();
    });
    
    it('carga usuarios desde localStorage si existen', () => {
      const customUsers = [
        { id: 'x1', name: 'Test User', email: 'test@test.com', role: 'agent', department: 'IT', position: 'Tester' }
      ];
    
      localStorage.setItem('users', JSON.stringify(customUsers));
    
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0].id).toBe('x1');
    });
    
    it('addUser agrega un nuevo usuario', () => {
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      act(() => {
        result.current.addUser({
          name: 'Nuevo Usuario',
          email: 'nuevo@test.com',
          role: 'agent',
          department: 'Soporte',
          position: 'Junior'
        });
      });
    
      expect(result.current.users.length).toBe(6); // 5 mock + 1 nuevo
      const added = result.current.users.find(u => u.email === 'nuevo@test.com');
      expect(added).toBeDefined();
    });
    
    it('updateUser actualiza correctamente un usuario', () => {
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      const targetId = result.current.users[0].id;
    
      act(() => {
        result.current.updateUser(targetId, { name: 'Nombre Actualizado' });
      });
    
      const updated = result.current.users.find(u => u.id === targetId);
      expect(updated?.name).toBe('Nombre Actualizado');
    });
    
    it('deleteUser elimina el usuario correctamente', () => {
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      const initialCount = result.current.users.length;
      const deleteId = result.current.users[0].id;
    
      act(() => {
        result.current.deleteUser(deleteId);
      });
    
      expect(result.current.users.length).toBe(initialCount - 1);
      expect(result.current.users.find(u => u.id === deleteId)).toBeUndefined();
    });
    
    it('getUserById devuelve el usuario correcto', () => {
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      const target = result.current.users[1];
      const found = result.current.getUserById(target.id);
    
      expect(found).toEqual(target);
    });
    
    it('getUserById devuelve undefined si no existe', () => {
      const { result } = renderHook(() => useUsers(), { wrapper });
    
      const found = result.current.getUserById('no-existe');
      expect(found).toBeUndefined();
    });
});
