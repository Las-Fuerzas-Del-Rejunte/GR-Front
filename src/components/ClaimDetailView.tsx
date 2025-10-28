import { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { ClaimStatus } from '../types/claim';
import Badge from './ui/Badge';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import Card from './ui/Card';
import { User, Mail, Calendar, Clock, MessageSquare } from 'lucide-react';

interface ClaimDetailViewProps {
  claimId: string;
}

const ClaimDetailView = ({ claimId }: ClaimDetailViewProps) => {
  const { getClaimById, updateClaimStatus, addClaimNote } = useClaims();
  const { statuses } = useStatuses();
  const claim = getClaimById(claimId);
  const [newNote, setNewNote] = useState('');

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Reclamo no encontrado</p>
      </div>
    );
  }

  const handleStatusChange = (newStatus: ClaimStatus) => {
    updateClaimStatus(claimId, newStatus);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    addClaimNote(claimId, newNote, 'Agente de Servicio');
    setNewNote('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-sm font-mono text-gray-500">{claim.id}</span>
            <Badge status={claim.status} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{claim.subject}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Cliente</p>
                <p className="text-sm font-medium text-gray-900">{claim.customerName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Contacto</p>
                <p className="text-sm font-medium text-gray-900">{claim.contactInfo}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Creación</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(claim.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Última Actualización</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(claim.updatedAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Reclamo</h3>
          <div className="space-y-2">
            {statuses.map(status => (
              <button
                key={status.id}
                onClick={() => handleStatusChange(status.name)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  claim.status === status.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{status.name}</span>
                  {claim.status === status.name && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Reclamo</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{claim.description}</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Historial y Seguimiento</h3>
        </div>

        <div className="space-y-4 mb-6">
          {claim.notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay notas de seguimiento aún
            </p>
          ) : (
            <div className="space-y-4">
              {claim.notes.map(note => (
                <div key={note.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">{note.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <TextArea
            placeholder="Escriba una nota de seguimiento..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              Añadir Seguimiento
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ClaimDetailView;
