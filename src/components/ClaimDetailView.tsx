import { useState, useEffect, useRef } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { useUsers } from '../context/UsersContext';
import { ClaimStatus } from '../types/claim';
import Badge from './ui/Badge';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import Card from './ui/Card';
import { User, Mail, Calendar, Clock, MessageSquare, ChevronDown, AlertTriangle } from 'lucide-react';

interface ClaimDetailViewProps {
  claimId: string;
}

const ClaimDetailView = ({ claimId }: ClaimDetailViewProps) => {
  const { getClaimById, updateClaimStatus, addClaimNote, assignClaim, updateClaimPriority } = useClaims();
  const { statuses } = useStatuses();
  const { users } = useUsers();
  const claim = getClaimById(claimId);
  const [newNote, setNewNote] = useState('');
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  
  const assignMenuRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (assignMenuRef.current && !assignMenuRef.current.contains(event.target as Node)) {
        setShowAssignMenu(false);
      }
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getSelectedClasses = (color: string) => {
    const map: Record<string, { border: string; bg: string; dot: string }> = {
      blue: { border: 'border-blue-500', bg: 'bg-blue-50', dot: 'bg-blue-500' },
      amber: { border: 'border-amber-500', bg: 'bg-amber-50', dot: 'bg-amber-500' },
      orange: { border: 'border-orange-500', bg: 'bg-orange-50', dot: 'bg-orange-500' },
      green: { border: 'border-emerald-500', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
      red: { border: 'border-rose-500', bg: 'bg-rose-50', dot: 'bg-rose-500' },
      purple: { border: 'border-purple-500', bg: 'bg-purple-50', dot: 'bg-purple-500' },
      pink: { border: 'border-pink-500', bg: 'bg-pink-50', dot: 'bg-pink-500' },
      teal: { border: 'border-teal-500', bg: 'bg-teal-50', dot: 'bg-teal-500' },
      gray: { border: 'border-neutral-500', bg: 'bg-neutral-50', dot: 'bg-neutral-500' }
    };
    return map[color] || map.gray;
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignación y Prioridad</h3>
          <div className="space-y-4">
            {/* Persona asignada */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Asignado a</label>
              <div className="relative" ref={assignMenuRef}>
                <button
                  onClick={() => {
                    setShowAssignMenu(!showAssignMenu);
                    setShowPriorityMenu(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  {claim.assignedTo ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {claim.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{claim.assignedTo.name}</p>
                        {claim.assignedTo.position && (
                          <p className="text-xs text-gray-500 truncate">{claim.assignedTo.position}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-500">Seleccionar persona...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showAssignMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú de selección de usuarios */}
                {showAssignMenu && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          assignClaim(claimId, null);
                          setShowAssignMenu(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-md text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${!claim.assignedTo ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                      >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Sin asignar</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 p-2 space-y-1">
                      {users.map(user => (
                        <button
                          key={user.id}
                          onClick={() => {
                            assignClaim(claimId, user);
                            setShowAssignMenu(false);
                          }}
                          className={`w-full px-3 py-2.5 rounded-md text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${claim.assignedTo?.id === user.id ? 'bg-blue-50 border-2 border-blue-200' : ''}`}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                            {user.position && (
                              <p className="text-xs text-gray-500 truncate">{user.position}</p>
                            )}
                          </div>
                          {claim.assignedTo?.id === user.id && (
                            <div className="flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Prioridad */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Prioridad</label>
              <div className="relative" ref={priorityMenuRef}>
                <button
                  onClick={() => {
                    setShowPriorityMenu(!showPriorityMenu);
                    setShowAssignMenu(false);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {claim.priority === 'urgent' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    {claim.priority === 'high' && <AlertTriangle className="w-5 h-5 text-orange-600" />}
                    {claim.priority === 'medium' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                    {claim.priority === 'low' && <AlertTriangle className="w-5 h-5 text-green-600" />}
                    {!claim.priority && <AlertTriangle className="w-5 h-5 text-gray-400" />}
                    
                    <span className={`text-sm font-semibold ${
                      claim.priority === 'urgent' ? 'text-red-700' :
                      claim.priority === 'high' ? 'text-orange-700' :
                      claim.priority === 'medium' ? 'text-yellow-700' :
                      claim.priority === 'low' ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {claim.priority === 'urgent' ? '🔴 Urgente' :
                       claim.priority === 'high' ? '🟠 Alta' :
                       claim.priority === 'medium' ? '🟡 Media' :
                       claim.priority === 'low' ? '🟢 Baja' : 'Seleccionar prioridad...'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showPriorityMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Menú de prioridad */}
                {showPriorityMenu && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {[
                      { value: 'urgent', label: 'Urgente', color: 'text-red-700', bgHover: 'hover:bg-red-50', icon: '🔴', borderColor: 'border-red-200' },
                      { value: 'high', label: 'Alta', color: 'text-orange-700', bgHover: 'hover:bg-orange-50', icon: '🟠', borderColor: 'border-orange-200' },
                      { value: 'medium', label: 'Media', color: 'text-yellow-700', bgHover: 'hover:bg-yellow-50', icon: '🟡', borderColor: 'border-yellow-200' },
                      { value: 'low', label: 'Baja', color: 'text-green-700', bgHover: 'hover:bg-green-50', icon: '🟢', borderColor: 'border-green-200' }
                    ].map(priority => (
                      <button
                        key={priority.value}
                        onClick={() => {
                          updateClaimPriority(claimId, priority.value as any);
                          setShowPriorityMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-left ${priority.bgHover} transition-colors flex items-center gap-3 ${claim.priority === priority.value ? `bg-${priority.value === 'urgent' ? 'red' : priority.value === 'high' ? 'orange' : priority.value === 'medium' ? 'yellow' : 'green'}-50 border-l-4 ${priority.borderColor}` : 'border-l-4 border-transparent'}`}
                      >
                        <span className="text-lg">{priority.icon}</span>
                        <span className={`text-sm font-semibold ${priority.color}`}>{priority.label}</span>
                        {claim.priority === priority.value && (
                          <div className="ml-auto flex-shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Reclamo</h3>
          <div className="space-y-2">
            {statuses.map(status => {
              const isActive = claim.status === status.name;
              const color = getSelectedClasses(status.color);
              return (
                <button
                  key={status.id}
                  onClick={() => handleStatusChange(status.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? `${color.border} ${color.bg}`
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{status.name}</span>
                    {isActive && (
                      <div className={`w-2 h-2 rounded-full ${color.dot}`} />
                    )}
                  </div>
                </button>
              );
            })}
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
