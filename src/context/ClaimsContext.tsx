import { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimNote, ClaimStatus, User, ClaimType, Severity, ClaimArea, ClaimHistoryEntry, ClaimHistoryAction, ClaimFeedback, ClaimResolution } from '../types/claim';
import { mockClaims } from '../data/mockData';
import { useAuth } from './AuthContext';

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => void;
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
  addClaimNote: (claimId: string, content: string, author: string, isInternal?: boolean) => void;
  deleteClaim: (claimId: string) => void;
  assignClaim: (claimId: string, users: User[] | null) => void;
  updateClaimPriority: (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  updateClaimType: (claimId: string, type: ClaimType) => void;
  updateClaimSeverity: (claimId: string, severity: Severity) => void;
  assignClaimToArea: (claimId: string, area: ClaimArea | null) => void;
  closeClaim: (claimId: string, resolution: ClaimResolution) => void;
  reopenClaim: (claimId: string) => void;
  addClaimFeedback: (claimId: string, feedback: Omit<ClaimFeedback, 'id' | 'claimId' | 'submittedAt'>) => void;
  getClaimById: (claimId: string) => Claim | undefined;
  getClaimsByProjectId: (projectId: string) => Claim[];
  getClaimsByCustomerId: (customerId: string) => Claim[];
  getClaimHistory: (claimId: string) => ClaimHistoryEntry[];
  searchClaims: (query: string) => Claim[];
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const { user } = useAuth();

  // Helper para crear entrada de historial
  const createHistoryEntry = (
    action: ClaimHistoryAction,
    previousValue?: string,
    newValue?: string,
    description?: string,
    metadata?: Record<string, any>
  ): ClaimHistoryEntry => {
    return {
      id: `history-${Date.now()}-${Math.random()}`,
      claimId: '', // Se completará al agregar
      action,
      userId: user?.id,
      userName: user?.name || 'Sistema',
      previousValue,
      newValue,
      description,
      metadata,
      createdAt: new Date()
    };
  };

  const addClaim = (claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => {
    const newClaim: Claim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
      history: [{
        id: `history-${Date.now()}`,
        claimId: `claim-${Date.now()}`,
        action: 'created',
        userId: user?.id,
        userName: user?.name || 'Sistema',
        description: `Reclamo creado: ${claimData.subject}`,
        createdAt: new Date()
      }]
    };
    setClaims(prev => [newClaim, ...prev]);
  };

  const updateClaimStatus = (claimId: string, newStatus: ClaimStatus) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousStatus = claim.status;
        const historyEntry = createHistoryEntry(
          'status_changed',
          previousStatus,
          newStatus,
          `Estado cambiado de "${previousStatus}" a "${newStatus}"`
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          status: newStatus,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const addClaimNote = (claimId: string, content: string, author: string, isInternal: boolean = false) => {
    const newNote: ClaimNote = {
      id: `note-${Date.now()}`,
      claimId,
      content,
      author,
      authorId: user?.id,
      isInternal,
      createdAt: new Date()
    };

    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const historyEntry = createHistoryEntry(
          'note_added',
          undefined,
          undefined,
          isInternal ? 'Nota interna agregada' : 'Nota agregada',
          { isInternal }
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          notes: [...claim.notes, newNote],
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const deleteClaim = (claimId: string) => {
    setClaims(prev => prev.filter(claim => claim.id !== claimId));
  };

  const assignClaim = (claimId: string, users: User[] | null) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousUsers = claim.assignedTo || [];
        const previousNames = previousUsers.map(u => u.name).join(', ') || 'Sin asignar';
        const newNames = users?.map(u => u.name).join(', ') || 'Sin asignar';
        
        const historyEntry = createHistoryEntry(
          'assigned_to_user',
          previousNames,
          newNames,
          `Asignación cambiada: ${previousNames} → ${newNames}`,
          { 
            previousUserIds: previousUsers.map(u => u.id),
            newUserIds: users?.map(u => u.id) || []
          }
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          assignedTo: users,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const updateClaimPriority = (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousPriority = claim.priority || 'medium';
        const historyEntry = createHistoryEntry(
          'priority_changed',
          previousPriority,
          priority,
          `Prioridad cambiada de "${previousPriority}" a "${priority}"`
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          priority,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const updateClaimType = (claimId: string, type: ClaimType) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousType = claim.type || 'other';
        const historyEntry = createHistoryEntry(
          'type_changed',
          previousType,
          type,
          `Tipo de reclamo cambiado`
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          type,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const updateClaimSeverity = (claimId: string, severity: Severity) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousSeverity = claim.severity || 'medium';
        const historyEntry = createHistoryEntry(
          'severity_changed',
          previousSeverity,
          severity,
          `Nivel de criticidad cambiado de "${previousSeverity}" a "${severity}"`
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          severity,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const assignClaimToArea = (claimId: string, area: ClaimArea | null) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousArea = claim.assignedToArea || null;
        const history = claim.assignedAreasHistory || [];
        const newHistory = area && (!history.length || history[history.length - 1] !== area)
          ? [...history, area]
          : history;
        
        const historyEntry = createHistoryEntry(
          'assigned_to_area',
          previousArea || 'Sin asignar',
          area || 'Sin asignar',
          `Reasignado a área: ${previousArea || 'Sin asignar'} → ${area || 'Sin asignar'}`,
          { previousArea, newArea: area }
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          assignedToArea: area,
          assignedAreasHistory: newHistory,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const closeClaim = (claimId: string, resolution: ClaimResolution) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const historyEntry = createHistoryEntry(
          'closed',
          claim.status,
          'Cerrado',
          `Reclamo cerrado: ${resolution.summary}`,
          { resolution }
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          status: 'Resuelto',
          resolution,
          closedAt: new Date(),
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const reopenClaim = (claimId: string) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const historyEntry = createHistoryEntry(
          'reopened',
          'Cerrado',
          claim.status,
          'Reclamo reabierto'
        );
        historyEntry.claimId = claimId;
        
        return {
          ...claim,
          resolution: undefined,
          closedAt: undefined,
          history: [...(claim.history || []), historyEntry],
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const addClaimFeedback = (claimId: string, feedback: Omit<ClaimFeedback, 'id' | 'claimId' | 'submittedAt'>) => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const newFeedback: ClaimFeedback = {
          ...feedback,
          id: `feedback-${Date.now()}`,
          claimId,
          submittedAt: new Date()
        };
        
        return {
          ...claim,
          feedback: newFeedback,
          updatedAt: new Date()
        };
      }
      return claim;
    }));
  };

  const getClaimById = (claimId: string) => {
    return claims.find(claim => claim.id === claimId);
  };

  const getClaimsByProjectId = (projectId: string) => {
    return claims.filter(claim => claim.projectId === projectId);
  };

  const getClaimsByCustomerId = (customerId: string) => {
    return claims.filter(claim => claim.customerId === customerId);
  };

  const getClaimHistory = (claimId: string) => {
    const claim = getClaimById(claimId);
    return claim?.history || [];
  };

  const searchClaims = (query: string) => {
    if (!query.trim()) return claims;

    const lowerQuery = query.toLowerCase();
    return claims.filter(claim =>
      claim.id.toLowerCase().includes(lowerQuery) ||
      claim.subject.toLowerCase().includes(lowerQuery) ||
      claim.customerName.toLowerCase().includes(lowerQuery) ||
      claim.description.toLowerCase().includes(lowerQuery)
    );
  };

  return (
    <ClaimsContext.Provider value={{
      claims,
      addClaim,
      updateClaimStatus,
      addClaimNote,
      deleteClaim,
      assignClaim,
      updateClaimPriority,
      updateClaimType,
      updateClaimSeverity,
      assignClaimToArea,
      closeClaim,
      reopenClaim,
      addClaimFeedback,
      getClaimById,
      getClaimsByProjectId,
      getClaimsByCustomerId,
      getClaimHistory,
      searchClaims
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
