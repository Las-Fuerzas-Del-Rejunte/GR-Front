import { useState, useRef } from 'react';
import KanbanBoard from './KanbanBoard';
import Modal from '../components/ui/Modal';
import NewClaimForm, { NewClaimFormRef } from '../components/NewClaimForm';
import ClaimDetailView from '../components/ClaimDetailView';
import Button from '../components/ui/Button';
import { useClaims } from '../context/ClaimsContext';
import { useToast } from '../context/ToastContext';
import { Trash2 } from 'lucide-react';

const KanbanPage = () => {
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const formRef = useRef<NewClaimFormRef>(null);
  const { deleteClaim } = useClaims();
  const { showToast } = useToast();

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

  const handleSubmitForm = () => {
    formRef.current?.submitForm();
  };

  const handleDeleteClaim = () => {
    if (selectedClaimId) {
      deleteClaim(selectedClaimId);
      showToast({
        type: 'success',
        title: 'Reclamo eliminado',
        message: 'El reclamo ha sido eliminado correctamente'
      });
      setIsDeleteModalOpen(false);
      setSelectedClaimId(null);
    }
  };

  const newClaimFooter = (
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={handleCloseNewClaim}>
        Cancelar
      </Button>
      <Button onClick={handleSubmitForm}>
        Guardar Reclamo
      </Button>
    </div>
  );

  const claimDetailFooter = selectedClaimId ? (
    <div className="flex gap-3">
      <Button onClick={handleCloseClaimDetail}>
        Cerrar
      </Button>
      <Button 
        variant="secondary" 
        onClick={() => setIsDeleteModalOpen(true)}
        style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
        className="ml-auto"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar Reclamo
      </Button>
    </div>
  ) : null;

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
        footer={newClaimFooter}
      >
        <NewClaimForm 
          ref={formRef}
          onClose={handleCloseNewClaim} 
          onSuccess={handleClaimSuccess}
          initialStatus={initialStatus || undefined}
        />
      </Modal>

      <Modal
        isOpen={selectedClaimId !== null}
        onClose={handleCloseClaimDetail}
        title="Detalle del Reclamo"
        footer={claimDetailFooter}
      >
        {selectedClaimId && <ClaimDetailView claimId={selectedClaimId} />}
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Reclamo"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDeleteClaim} style={{ backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}>
              Confirmar Eliminación
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <p className="text-gray-700">
            ¿Estás seguro de que deseas eliminar este reclamo? Esta acción no se puede deshacer.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default KanbanPage;
