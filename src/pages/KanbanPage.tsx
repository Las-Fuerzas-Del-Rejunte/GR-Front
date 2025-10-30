import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import Modal from '../components/ui/Modal';
import NewClaimForm from '../components/NewClaimForm';
import ClaimDetailView from '../components/ClaimDetailView';

const KanbanPage = () => {
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);

  const handleCloseNewClaim = () => {
    setIsNewClaimOpen(false);
    setInitialStatus(null);
  };
  const handleOpenNewClaim = () => setIsNewClaimOpen(true);
  const handleCreateClaimWithStatus = (status: string) => {
    setInitialStatus(status);
    setIsNewClaimOpen(true);
  };
  const handleClaimSuccess = () => {
    setIsNewClaimOpen(false);
    setInitialStatus(null);
  };

  const handleOpenClaimDetail = (claimId: string) => {
    setSelectedClaimId(claimId);
  };

  const handleCloseClaimDetail = () => {
    setSelectedClaimId(null);
  };

  return (
    <>
      <KanbanBoard
        onOpenNewClaim={handleOpenNewClaim}
        onOpenClaimDetail={handleOpenClaimDetail}
        onCreateClaimWithStatus={handleCreateClaimWithStatus}
      />

      <Modal
        isOpen={isNewClaimOpen}
        onClose={handleCloseNewClaim}
        title="Registrar Nuevo Reclamo"
      >
        <NewClaimForm 
          onClose={handleCloseNewClaim} 
          onSuccess={handleClaimSuccess}
          initialStatus={initialStatus || undefined}
        />
      </Modal>

      <Modal
        isOpen={selectedClaimId !== null}
        onClose={handleCloseClaimDetail}
        title="Detalle del Reclamo"
      >
        {selectedClaimId && <ClaimDetailView claimId={selectedClaimId} />}
      </Modal>
    </>
  );
};

export default KanbanPage;
