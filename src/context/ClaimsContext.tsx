import { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimNote, ClaimStatus, User, AuditEvent } from '../types/claim';
import { mockClaims } from '../data/mockData';

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'auditHistory'>) => void;
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus, user?: string) => void;
  addClaimNote: (claimId: string, content: string, author: string) => void;
  deleteClaim: (claimId: string) => void;
  assignClaim: (claimId: string, users: User[] | null, assignedBy?: string) => void;
  updateClaimPriority: (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent', user?: string) => void;
  getClaimById: (claimId: string) => Claim | undefined;
  searchClaims: (query: string) => Claim[];
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);

  // Función auxiliar para crear eventos de auditoría
  const createAuditEvent = (
    claimId: string,
    type: AuditEvent['type'],
    user: string,
    details: AuditEvent['details']
  ): AuditEvent => {
    return {
      id: `audit-${Date.now()}-${Math.random()}`,
      claimId,
      type,
      timestamp: new Date(),
      user,
      details
    };
  };

  const addClaim = (claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'auditHistory'>) => {
    const now = new Date();
    const newClaimId = `claim-${Date.now()}`;
    
    const creationEvent = createAuditEvent(
      newClaimId,
      'created',
      'Sistema',
      {
        description: 'Reclamo creado en el sistema',
        area: claimData.assignedTo?.[0]?.department || 'Sin área'
      }
    );

    const newClaim: Claim = {
      ...claimData,
      id: newClaimId,
      createdAt: now,
      updatedAt: now,
      notes: [],
      auditHistory: [creationEvent]
    };
    setClaims(prev => [newClaim, ...prev]);
  };

  const updateClaimStatus = (claimId: string, newStatus: ClaimStatus, user: string = 'Agente de Servicio') => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const statusEvent = createAuditEvent(
          claimId,
          'status_changed',
          user,
          {
            previousValue: claim.status,
            newValue: newStatus,
            area: claim.assignedTo?.[0]?.department || 'Sin área'
          }
        );

        return {
          ...claim,
          status: newStatus,
          updatedAt: new Date(),
          auditHistory: [...claim.auditHistory, statusEvent]
        };
      }
      return claim;
    }));
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
        const noteEvent = createAuditEvent(
          claimId,
          'note_added',
          author,
          {
            description: content.length > 50 ? `${content.substring(0, 50)}...` : content,
            area: claim.assignedTo?.[0]?.department || 'Sin área'
          }
        );

        return {
          ...claim,
          notes: [...claim.notes, newNote],
          updatedAt: new Date(),
          auditHistory: [...claim.auditHistory, noteEvent]
        };
      }
      return claim;
    }));
  };

  const deleteClaim = (claimId: string) => {
    setClaims(prev => prev.filter(claim => claim.id !== claimId));
  };

  const assignClaim = (claimId: string, users: User[] | null, assignedBy: string = 'Supervisor') => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const previousAssigned = claim.assignedTo;
        let eventType: AuditEvent['type'] = 'assigned';
        
        if (!users || users.length === 0) {
          eventType = 'unassigned';
        } else if (previousAssigned && previousAssigned.length > 0) {
          eventType = 'reassigned';
        }

        const assignEvent = createAuditEvent(
          claimId,
          eventType,
          assignedBy,
          {
            previousValue: previousAssigned,
            newValue: users,
            area: users?.[0]?.department || 'Sin área'
          }
        );

        return {
          ...claim,
          assignedTo: users,
          updatedAt: new Date(),
          auditHistory: [...claim.auditHistory, assignEvent]
        };
      }
      return claim;
    }));
  };

  const updateClaimPriority = (claimId: string, priority: 'low' | 'medium' | 'high' | 'urgent', user: string = 'Agente de Servicio') => {
    setClaims(prev => prev.map(claim => {
      if (claim.id === claimId) {
        const priorityEvent = createAuditEvent(
          claimId,
          'priority_changed',
          user,
          {
            previousValue: claim.priority,
            newValue: priority,
            area: claim.assignedTo?.[0]?.department || 'Sin área'
          }
        );

        return {
          ...claim,
          priority,
          updatedAt: new Date(),
          auditHistory: [...claim.auditHistory, priorityEvent]
        };
      }
      return claim;
    }));
  };

  const getClaimById = (claimId: string) => {
    return claims.find(claim => claim.id === claimId);
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
      getClaimById,
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
