import { createContext, useContext, useState, ReactNode } from 'react';
import { Claim, ClaimNote, ClaimStatus } from '../types/claim';
import { mockClaims } from '../data/mockData';

interface ClaimsContextType {
  claims: Claim[];
  addClaim: (claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => void;
  updateClaimStatus: (claimId: string, newStatus: ClaimStatus) => void;
  addClaimNote: (claimId: string, content: string, author: string) => void;
  deleteClaim: (claimId: string) => void;
  getClaimById: (claimId: string) => Claim | undefined;
  searchClaims: (query: string) => Claim[];
}

const ClaimsContext = createContext<ClaimsContextType | undefined>(undefined);

export const ClaimsProvider = ({ children }: { children: ReactNode }) => {
  const [claims, setClaims] = useState<Claim[]>(mockClaims);

  const addClaim = (claimData: Omit<Claim, 'id' | 'createdAt' | 'updatedAt' | 'notes'>) => {
    const newClaim: Claim = {
      ...claimData,
      id: `claim-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };
    setClaims(prev => [newClaim, ...prev]);
  };

  const updateClaimStatus = (claimId: string, newStatus: ClaimStatus) => {
    setClaims(prev => prev.map(claim =>
      claim.id === claimId
        ? { ...claim, status: newStatus, updatedAt: new Date() }
        : claim
    ));
  };

  const addClaimNote = (claimId: string, content: string, author: string) => {
    const newNote: ClaimNote = {
      id: `note-${Date.now()}`,
      claimId,
      content,
      author,
      createdAt: new Date()
    };

    setClaims(prev => prev.map(claim =>
      claim.id === claimId
        ? {
            ...claim,
            notes: [...claim.notes, newNote],
            updatedAt: new Date()
          }
        : claim
    ));
  };

  const deleteClaim = (claimId: string) => {
    setClaims(prev => prev.filter(claim => claim.id !== claimId));
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
