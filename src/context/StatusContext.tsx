import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { StatusConfig, SubStatus } from '../types/claim';
import { statesMachineConfig, getStatusConfig, getSubStatuses, canPerformAction, getAvailableTransitions, isValidTransition } from '../config/stateMachine';
import { StatusTransition } from '../types/claim';
import { statusConfigsAPI } from '../services/api';
import { useToast } from './ToastContext';

interface SubStatusBackend {
  id: string;
  nombre: string;
  descripcion?: string;
  posicion_orden: number;
  estado_id: string;
}

interface StatusContextType {
  statuses: StatusConfig[];
  loading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addStatus: (name: string, color: string) => Promise<void>;
  deleteStatus: (statusId: string) => Promise<void>;
  updateStatus: (statusId: string, nameOrUpdates: string | Partial<StatusConfig>, color?: string) => Promise<void>;
  reorderStatuses: (startIndex: number, endIndex: number) => void;
  getStatusConfig: (statusId: string) => StatusConfig | undefined;
  getSubStatuses: (statusId: string) => SubStatus[];
  loadSubStatuses: (statusId: string) => Promise<void>;
  canPerformAction: (statusId: string, action: keyof StatusConfig['permissions']) => boolean;
  getAvailableTransitions: (currentStatus: string, userRole?: string) => StatusTransition[];
  isValidTransition: (from: string, to: string, userRole?: string) => boolean;
  refreshStatuses: () => Promise<void>;
}

const StatusContext = createContext<StatusContextType | undefined>(undefined);

export const StatusProvider = ({ children }: { children: ReactNode }) => {
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => {
    // Cargar desde localStorage o usar configuración por defecto
    const cached = localStorage.getItem('cached_statuses');
    return cached ? JSON.parse(cached) : statesMachineConfig;
  });
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const refreshStatuses = async () => {
    setLoading(true);
    try {
      const data = await statusConfigsAPI.getAll();
      const statusData = data.length > 0 ? data : statesMachineConfig;
      setStatuses(statusData);
      // Guardar en localStorage
      localStorage.setItem('cached_statuses', JSON.stringify(statusData));
    } catch (error) {
      console.error('Error loading status configs:', error);
      // En caso de error, usar la configuración local
      setStatuses(statesMachineConfig);
      showToast({
        type: 'warning',
        title: 'Usando configuración local',
        message: 'No se pudo cargar la configuración de estados del servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatuses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper para actualizar statuses y localStorage
  const updateStatusesAndCache = (updater: (prevStatuses: StatusConfig[]) => StatusConfig[]) => {
    setStatuses(prev => {
      const updated = updater(prev);
      localStorage.setItem('cached_statuses', JSON.stringify(updated));
      return updated;
    });
  };

  const addStatus = async (name: string, color: string) => {
    setIsCreating(true);
    try {
      const newStatusData: Omit<StatusConfig, 'id'> = {
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
      const newStatus = await statusConfigsAPI.create(newStatusData);
      updateStatusesAndCache(prev => [...prev, newStatus]);
      showToast({
        type: 'success',
        title: 'Estado creado',
        message: 'El estado se ha creado correctamente'
      });
    } catch (error) {
      console.error('Error creating status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear el estado'
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const deleteStatus = async (statusId: string) => {
    setIsDeleting(true);
    try {
      await statusConfigsAPI.delete(statusId);
      updateStatusesAndCache(prev => prev.filter(s => s.id !== statusId));
      showToast({
        type: 'success',
        title: 'Estado eliminado',
        message: 'El estado se ha eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el estado'
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const updateStatus = async (statusId: string, nameOrUpdates: string | Partial<StatusConfig>, color?: string) => {
    setIsUpdating(true);
    try {
      let updateData: Partial<StatusConfig>;
      
      if (typeof nameOrUpdates === 'object') {
        updateData = nameOrUpdates;
      } else {
        updateData = { name: nameOrUpdates, color: color };
      }
      
      const updatedStatus = await statusConfigsAPI.update(statusId, updateData);
      updateStatusesAndCache(prev => prev.map(s => s.id === statusId ? updatedStatus : s));
      showToast({
        type: 'success',
        title: 'Estado actualizado',
        message: 'El estado se ha actualizado correctamente'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el estado'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
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
    
    setStatuses(reordered);
  };

  // Cargar sub-estados desde el backend para un estado específico
  const loadSubStatuses = useCallback(async (statusId: string) => {
    try {
      // Buscar el estado por ID o por nombre
      const status = statuses.find(s => s.id === statusId || s.name === statusId);
      if (!status || !status.id) {
        console.warn('⚠️ Estado no encontrado:', statusId);
        return;
      }

      // Verificar si ya tiene sub-estados cargados para evitar peticiones innecesarias
      if (status.subStatuses && status.subStatuses.length > 0) {
        console.log('✅ Sub-estados ya cargados en cache para', status.name);
        return;
      }

      console.log('🔍 Cargando sub-estados para estado:', { id: status.id, name: status.name });

      // Obtener sub-estados desde el backend
      const response: SubStatusBackend[] = await statusConfigsAPI.getSubStatusesByEstado(status.id);
      
      console.log('📦 Sub-estados recibidos del backend:', response);

      // Mapear sub-estados del backend al formato frontend
      const mappedSubStatuses: SubStatus[] = response.map(sub => ({
        id: sub.id, // UUID del backend
        name: sub.nombre,
        description: sub.descripcion,
        order: sub.posicion_orden
      }));

      // Actualizar el estado con los sub-estados
      updateStatusesAndCache(prev => prev.map(s => 
        s.id === status.id ? { ...s, subStatuses: mappedSubStatuses } : s
      ));
      
      console.log('✅ Sub-estados guardados en cache:', {
        statusId: status.id.substring(0, 8),
        statusName: status.name,
        subStatusCount: mappedSubStatuses.length,
        subStatuses: mappedSubStatuses.map(ss => ({ id: ss.id.substring(0, 8), name: ss.name }))
      });
    } catch (error) {
      console.error('❌ Error loading sub-statuses:', error);
      // Fallback: usar sub-estados locales
      const localSubStatuses = getSubStatuses(statusId);
      console.log('📦 Usando sub-estados locales:', localSubStatuses);
    }
  }, [statuses]); // ✅ Ahora con useCallback y dependencias correctas

  // ✅ Función dinámica para obtener sub-estados del cache
  const getDynamicSubStatuses = useCallback((statusId: string): SubStatus[] => {
    // Buscar el estado por ID o por nombre
    const status = statuses.find(s => s.id === statusId || s.name === statusId);
    
    console.log('🔎 getDynamicSubStatuses buscando:', {
      statusId: statusId.substring(0, 8),
      statusFound: !!status,
      statusName: status?.name,
      hasSubStatuses: !!status?.subStatuses,
      subStatusesLength: status?.subStatuses?.length || 0
    });

    if (!status || !status.subStatuses) {
      return [];
    }

    return status.subStatuses;
  }, [statuses]);

  return (
    <StatusContext.Provider value={{
      statuses,
      loading,
      isCreating,
      isUpdating,
      isDeleting,
      addStatus,
      deleteStatus,
      updateStatus,
      reorderStatuses,
      getStatusConfig,
      getSubStatuses: getDynamicSubStatuses, // ✅ Usar función dinámica en lugar de la estática
      loadSubStatuses,
      canPerformAction,
      getAvailableTransitions,
      isValidTransition,
      refreshStatuses
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
