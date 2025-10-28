import { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import Modal from '../components/ui/Modal';
import NewClaimForm from '../components/NewClaimForm';
import ClaimDetailView from '../components/ClaimDetailView';

const KanbanPage = () => {
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const handleCloseNewClaim = () => setIsNewClaimOpen(false);
  const handleOpenNewClaim = () => setIsNewClaimOpen(true);
  const handleClaimSuccess = () => {
    setIsNewClaimOpen(false);
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
      />

      <Modal
        isOpen={isNewClaimOpen}
        onClose={handleCloseNewClaim}
        title="Registrar Nuevo Reclamo"
      >
        <NewClaimForm onClose={handleCloseNewClaim} onSuccess={handleClaimSuccess} />
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
