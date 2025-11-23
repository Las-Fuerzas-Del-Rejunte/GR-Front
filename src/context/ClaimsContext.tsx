import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Claim, ClaimNote, ClaimStatus, User } from '../types/claim';
import { claimsAPI } from '../services/api';
import { useToast } from './ToastContext';

interface ClaimsContextType {
  claims: Claim[];
  loading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'auditHistory' | 'isLocked'>) => Promise<void>;
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus, user?: string, resolutionSummary?: string) => Promise<void>;
  updateClaimSubStatus: (claimId: string, newSubStatus: string, user?: string) => Promise<void>;
  addClaimNote: (claimId: string, content: string, author: string) => void;
  deleteClaim: (claimId: string) => Promise<void>;
  assignClaim: (claimId: string, users: User[] | null, assignedBy?: string) => Promise<void>;
  updateClaimPriority: (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent', user?: string) => Promise<void>;
  updateResolutionSummary: (claimId: string, summary: string, user?: string) => Promise<void>;
  getClaimById: (claimId: string) => Claim | undefined;
  searchClaims: (query: string) => Claim[];
  refreshClaims: () => Promise<void>;
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(() => {
    // Cargar desde localStorage al inicializar
    const cached = localStorage.getItem('cached_claims');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  
  // ✅ Ya no necesitamos useUsers ni enrichClaimWithUserData
  // El backend ahora devuelve agente_asignado completo

  const refreshClaims = async () => {
    setLoading(true);
    try {
      const response = await claimsAPI.getAll();
      const claimsData = response.datos;
      setClaims(claimsData);
      // Guardar en localStorage para próxima carga
      localStorage.setItem('cached_claims', JSON.stringify(claimsData));
    } catch (error) {
      console.error('Error loading claims:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron cargar los reclamos'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshClaims();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper para actualizar claims y localStorage
  const updateClaimsAndCache = (updater: (prevClaims: Claim[]) => Claim[]) => {
    setClaims(prev => {
      const updated = updater(prev);
      localStorage.setItem('cached_claims', JSON.stringify(updated));
      return updated;
    });
  };

  const addClaim = async (claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'auditHistory' | 'isLocked'>) => {
    setIsCreating(true);
    try {
      const newClaim = await claimsAPI.create(claimData);
      updateClaimsAndCache(prev => [newClaim, ...prev]);
      showToast({
        type: 'success',
        title: 'Reclamo creado',
        message: 'El reclamo se ha creado correctamente'
      });
    } catch (error) {
      console.error('Error creating claim:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo crear el reclamo'
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateClaimStatus = async (claimId: string, newStatus: ClaimStatus, _user?: string, resolutionSummary?: string) => {
    setIsUpdating(true);
    try {
      const updatedClaim = await claimsAPI.updateStatus(claimId, newStatus, undefined, resolutionSummary);
      updateClaimsAndCache(prev => prev.map(claim => claim.id === claimId ? updatedClaim : claim));
      showToast({
        type: 'success',
        title: 'Estado actualizado',
        message: `El estado se ha cambiado a "${updatedClaim.statusName || newStatus}"`
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

  const updateClaimSubStatus = async (claimId: string, newSubStatus: string, _user?: string) => {
    setIsUpdating(true);
    try {
      const updatedClaim = await claimsAPI.update(claimId, { subStatus: newSubStatus });
      
      updateClaimsAndCache(prev => prev.map(claim => 
        claim.id === claimId ? updatedClaim : claim
      ));
      
      showToast({
        type: 'success',
        title: 'Sub-estado actualizado',
        message: 'Progreso interno actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating substatus:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el sub-estado'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateResolutionSummary = async (claimId: string, summary: string, _user?: string) => {
    setIsUpdating(true);
    try {
      const updatedClaim = await claimsAPI.update(claimId, { resolutionSummary: summary });
      setClaims(prev => prev.map(claim => claim.id === claimId ? updatedClaim : claim));
      showToast({
        type: 'success',
        title: 'Resumen agregado',
        message: 'El resumen de resolución se ha guardado'
      });
    } catch (error) {
      console.error('Error updating resolution:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo guardar el resumen'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const addClaimNote = (claimId: string, content: string, author: string) => {
    const newNote: ClaimNote = {
      id: `note-${Date.now()}`,
      claimId,
      content,
      author,
      createdAt: new Date()
    };

    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        return {
          ...claim,
          notes: [...(claim.notes || []), newNote],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const deleteClaim = async (claimId: string) => {
    setIsDeleting(true);
    try {
      await claimsAPI.delete(claimId);
      updateClaimsAndCache(prev => prev.filter(claim => claim.id !== claimId));
      showToast({
        type: 'success',
        title: 'Reclamo eliminado',
        message: 'El reclamo se ha eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting claim:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el reclamo'
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const assignClaim = async (claimId: string, users: User[] | null, _assignedBy?: string) => {
    setIsUpdating(true);
    try {
      const agentId = users && users.length > 0 ? users[0].id : null;
      
      // ✅ Usar el endpoint correcto de asignación
      const updatedClaim = await claimsAPI.assign(claimId, agentId);
      
      // ✅ Backend ahora devuelve agente_asignado completo, no necesita enriquecimiento
      updateClaimsAndCache(prev => prev.map(claim => claim.id === claimId ? updatedClaim : claim));
      
      showToast({
        type: 'success',
        title: users ? 'Reclamo asignado' : 'Asignación removida',
        message: users ? `Reclamo asignado a ${users[0].name}` : 'La asignación se ha removido'
      });
    } catch (error) {
      console.error('❌ Error assigning claim:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo asignar el reclamo'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const updateClaimPriority = async (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent', _user?: string) => {
    setIsUpdating(true);
    try {
      const updatedClaim = await claimsAPI.update(claimId, { priority });
      setClaims(prev => prev.map(claim => claim.id === claimId ? updatedClaim : claim));
      showToast({
        type: 'success',
        title: 'Prioridad actualizada',
        message: `La prioridad se ha cambiado a "${priority}"`
      });
    } catch (error) {
      console.error('Error updating priority:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar la prioridad'
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const getClaimById = (claimId: string): Claim | undefined => {
    return claims.find(claim => claim.id === claimId);
  };

  const searchClaims = (query: string): Claim[] => {
    const lowercaseQuery = query.toLowerCase();
    return claims.filter(claim =>
      claim.subject.toLowerCase().includes(lowercaseQuery) ||
      claim.description.toLowerCase().includes(lowercaseQuery) ||
      claim.id.toLowerCase().includes(lowercaseQuery) ||
      claim.customerName?.toLowerCase().includes(lowercaseQuery) ||
      claim.contactInfo?.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <ClaimsContext.Provider value={{
      claims,
      loading,
      isCreating,
      isUpdating,
      isDeleting,
      addClaim,
      updateClaimStatus,
      updateClaimSubStatus,
      addClaimNote,
      deleteClaim,
      assignClaim,
      updateClaimPriority,
      updateResolutionSummary,
      getClaimById,
      searchClaims,
      refreshClaims
    }}>
      {children}
    </ClaimsContext.Provider>
  );
};

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};
