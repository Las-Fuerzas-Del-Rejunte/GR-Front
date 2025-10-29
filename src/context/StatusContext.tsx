import { createContext, useContext, useState, ReactNode } from 'react';
import { StatusConfig } from '../types/claim';

interface StatusContextType {
  statuses: StatusConfig[];
  addStatus: (name: string, color: string) => void;
  deleteStatus: (statusId: string) => void;
  updateStatus: (statusId: string, name: string, color: string) => void;
  reorderStatuses: (startIndex: number, endIndex: number) => void;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

const defaultStatuses: StatusConfig[] = [
  { id: 'nuevo', name: 'Nuevo', color: 'blue', order: 1 },
  { id: 'en-proceso', name: 'En Proceso', color: 'amber', order: 2 },
  { id: 'esperando', name: 'Esperando Respuesta', color: 'orange', order: 3 },
  { id: 'resuelto', name: 'Resuelto', color: 'green', order: 4 }
];

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => {
    const stored = localStorage.getItem('statuses');
    return stored ? JSON.parse(stored) : defaultStatuses;
  });

  const saveStatuses = (newStatuses: StatusConfig[]) => {
    setStatuses(newStatuses);
    localStorage.setItem('statuses', JSON.stringify(newStatuses));
  };

  const addStatus = (name: string, color: string) => {
    const newStatus: StatusConfig = {
      id: `status-${Date.now()}`,
      name,
      color,
      order: statuses.length + 1
    };
    saveStatuses([...statuses, newStatus]);
  };

  const deleteStatus = (statusId: string) => {
    const filtered = statuses.filter(s => s.id !== statusId);
    saveStatuses(filtered);
  };

  const updateStatus = (statusId: string, name: string, color: string) => {
    const updated = statuses.map(s =>
      s.id === statusId ? { ...s, name, color } : s
    );
    saveStatuses(updated);
  };

  const reorderStatuses = (startIndex: number, endIndex: number) => {
    const result = Array.from(statuses);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Actualizar el orden de cada estado
    const reordered = result.map((status, index) => ({
      ...status,
      order: index + 1
    }));
    
    saveStatuses(reordered);
  };

  return (
    <StatusContext.Provider value={{
      statuses,
      addStatus,
      deleteStatus,
      updateStatus,
      reorderStatuses
    }}>
      {children}
    </StatusContext.Provider>
  );
};

export const useStatuses = () => {
  const context = useContext(StatusContext);
  if (!context) {
    throw new Error('useStatuses must be used within a StatusProvider');
  }
  return context;
};
