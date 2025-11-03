import { useEffect, useRef, useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useUsers } from '../context/UsersContext';
import Badge from './ui/Badge';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import Card from './ui/Card';
import ClaimTimeline from './ClaimTimeline';
import StatusManager from './StatusManager';
import { User, Mail, Calendar, Clock, MessageSquare, ChevronDown, History } from 'lucide-react';

interface ClaimDetailViewProps {
  claimId: string;
}

const ClaimDetailView = ({ claimId }: ClaimDetailViewProps) => {
  const { getClaimById, addClaimNote, assignClaim, updateClaimPriority } = useClaims();
  const { users } = useUsers();
  const claim = getClaimById(claimId);
  const [newNote, setNewNote] = useState('');
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [assignQuery, setAssignQuery] = useState('');
  const assignMenuRef = useRef<HTMLDivElement | null>(null);
  const priorityMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAssignMenu && assignMenuRef.current && !assignMenuRef.current.contains(event.target as Node)) {
        setShowAssignMenu(false);
        setAssignQuery('');
      }
      if (showPriorityMenu && priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssignMenu, showPriorityMenu]);

  if (!claim) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Reclamo no encontrado</p>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Card para asignación y prioridad */}
        <Card className={`p-6 ${showAssignMenu || showPriorityMenu ? 'relative z-[60]' : ''}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignación y Prioridad</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {/* Persona asignada */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Asignado a</label>
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !showAssignMenu;
                    setShowAssignMenu(next);
                    if (!next) setAssignQuery('');
                    setShowPriorityMenu(false);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  {claim.assignedTo && claim.assignedTo.length > 0 ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {claim.assignedTo[0].name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{claim.assignedTo.length === 1 ? claim.assignedTo[0].name : `${claim.assignedTo[0].name} +${claim.assignedTo.length - 1}`}</p>
                        {claim.assignedTo.length === 1 && claim.assignedTo[0].position && (
                          <p className="text-xs text-gray-500 truncate">{claim.assignedTo[0].position}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Asignar...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 flex-shrink-0 ml-2 ${showAssignMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú de selección de usuarios (dropdown) */}
                {showAssignMenu && (
                  <div ref={assignMenuRef} className="absolute z-[70] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full mb-2 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={assignQuery}
                        onChange={(e) => setAssignQuery(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          assignClaim(claimId, null);
                        }}
                        className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${!claim.assignedTo || claim.assignedTo.length === 0 ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Sin asignar</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 p-2 space-y-1">
                      {users
                        .filter(u => {
                          const q = assignQuery.trim().toLowerCase();
                          return q ? u.name.toLowerCase().includes(q) || (u.position || '').toLowerCase().includes(q) : true;
                        })
                        .map(user => {
                          const selected = !!claim.assignedTo?.some(u => u.id === user.id);
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                const current = claim.assignedTo || [];
                                let next: typeof current = [];
                                if (selected) {
                                  next = current.filter(u => u.id !== user.id);
                                } else {
                                  next = [...current, user];
                                }
                                assignClaim(claimId, next.length > 0 ? next : null);
                              }}
                              className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${selected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                            >
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                                <span className="text-xs font-bold text-white">
                                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                {user.position && (
                                  <p className="text-xs text-gray-600">{user.position}</p>
                                )}
                              </div>
                              {selected && (
                                <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Prioridad</label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowPriorityMenu(!showPriorityMenu);
                    setShowAssignMenu(false);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  {claim.priority ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl flex-shrink-0">
                        {claim.priority === 'urgent' ? '🔴' :
                         claim.priority === 'high' ? '🟠' :
                         claim.priority === 'medium' ? '🟡' :
                         claim.priority === 'low' ? '🟢' : ''}
                      </span>
                      <span className={`text-sm font-semibold ${
                        claim.priority === 'urgent' ? 'text-red-700' :
                        claim.priority === 'high' ? 'text-orange-700' :
                        claim.priority === 'medium' ? 'text-yellow-700' :
                        claim.priority === 'low' ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {claim.priority === 'urgent' ? 'Urgente' :
                         claim.priority === 'high' ? 'Alta' :
                         claim.priority === 'medium' ? 'Media' :
                         claim.priority === 'low' ? 'Baja' : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Prioridad...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 flex-shrink-0 ml-2 ${showPriorityMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú de prioridad (dropdown) */}
                {showPriorityMenu && (
                  <div ref={priorityMenuRef} className="absolute z-[70] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
                    {[
                      { value: 'urgent', label: 'Urgente', emoji: '🔴', color: 'text-red-700', bgColor: 'bg-red-50', ringColor: 'ring-red-500' },
                      { value: 'high', label: 'Alta', emoji: '🟠', color: 'text-orange-700', bgColor: 'bg-orange-50', ringColor: 'ring-orange-500' },
                      { value: 'medium', label: 'Media', emoji: '🟡', color: 'text-yellow-700', bgColor: 'bg-yellow-50', ringColor: 'ring-yellow-500' },
                      { value: 'low', label: 'Baja', emoji: '🟢', color: 'text-green-700', bgColor: 'bg-green-50', ringColor: 'ring-green-500' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        onClick={() => {
                          updateClaimPriority(claimId, priority.value as any);
                          setShowPriorityMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-md text-left flex items-center gap-3 transition-colors ${
                          claim.priority === priority.value 
                            ? `${priority.bgColor} ring-2 ${priority.ringColor}` 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{priority.emoji}</span>
                        <span className={`text-sm font-semibold flex-1 ${priority.color}`}>{priority.label}</span>
                        {claim.priority === priority.value && (
                          <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Estado y Flujo</h3>
        <StatusManager claim={claim} />
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Reclamo</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{claim.description}</p>
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Historial de Auditoría y Trazabilidad</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Seguimiento completo del recorrido del reclamo desde su creación hasta el estado actual. 
          Se registran automáticamente todas las acciones, cambios de estado, asignaciones y áreas por las que transitó.
        </p>
        <ClaimTimeline events={claim.auditHistory} />
      </Card>

      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notas de Seguimiento</h3>
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
