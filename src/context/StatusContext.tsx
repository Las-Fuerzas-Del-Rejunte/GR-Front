import { createContext, useContext, useState, ReactNode } from 'react';
import { StatusConfig, SubStatus } from '../types/claim';
import { statesMachineConfig, getStatusConfig, getSubStatuses, canPerformAction, getAvailableTransitions, isValidTransition } from '../config/stateMachine';
import { StatusTransition } from '../types/claim';

interface StatusContextType {
  statuses: StatusConfig[];
  addStatus: (name: string, color: string) => void;
  deleteStatus: (statusId: string) => void;
  updateStatus: (statusId: string, nameOrUpdates: string | Partial<StatusConfig>, color?: string) => void;
  reorderStatuses: (startIndex: number, endIndex: number) => void;
  getStatusConfig: (statusId: string) => StatusConfig | undefined;
  getSubStatuses: (statusId: string) => SubStatus[];
  canPerformAction: (statusId: string, action: keyof StatusConfig['permissions']) => boolean;
  getAvailableTransitions: (currentStatus: string, userRole?: string) => StatusTransition[];
  isValidTransition: (from: string, to: string, userRole?: string) => boolean;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  // Usar la configuración de la máquina de estados como base
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => {
    const stored = localStorage.getItem('statuses');
    return stored ? JSON.parse(stored) : statesMachineConfig;
  });

  const saveStatuses = (newStatuses: StatusConfig[]) => {
    setStatuses(newStatuses);
    localStorage.setItem('statuses', JSON.stringify(newStatuses));
  };

  // Nota: addStatus, deleteStatus y updateStatus están limitados porque los estados
  // ahora son funcionales con reglas. En producción, estos métodos deberían ser más restrictivos.
  const addStatus = (name: string, color: string) => {
    const newStatus: StatusConfig = {
      id: `status-${Date.now()}`,
      name,
      color,
      order: statuses.length + 1,
      permissions: {
        canEdit: true,
        canReassign: true,
        canAddNote: true,
        canChangeStatus: true,
        canAddInternalComment: true,
        canClose: false,
        requiresResolutionSummary: false,
        isLocked: false
      }
    };
    saveStatuses([...statuses, newStatus]);
  };

  const deleteStatus = (statusId: string) => {
    const filtered = statuses.filter(s => s.id !== statusId);
    saveStatuses(filtered);
  };

  const updateStatus = (statusId: string, nameOrUpdates: string | Partial<StatusConfig>, color?: string) => {
    const updated = statuses.map(s => {
      if (s.id === statusId) {
        // Si se pasa un objeto, hacer merge completo
        if (typeof nameOrUpdates === 'object') {
          return { ...s, ...nameOrUpdates };
        }
        // Si se pasa string, es el nombre (compatibilidad con código anterior)
        return { ...s, name: nameOrUpdates, color: color || s.color };
      }
      return s;
    });
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
      reorderStatuses,
      getStatusConfig,
      getSubStatuses,
      canPerformAction,
      getAvailableTransitions,
      isValidTransition
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
