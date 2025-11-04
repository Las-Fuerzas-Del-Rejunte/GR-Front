import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { useUsers } from '../context/UsersContext';
import { useCustomers } from '../context/CustomersContext';
import { useProjects } from '../context/ProjectsContext';
import { useAuth } from '../context/AuthContext';
import { ClaimStatus, ClaimType, Severity, ClaimArea, CLAIM_TYPE_LABELS, SEVERITY_LABELS, CLAIM_AREA_LABELS, ClaimResolution } from '../types/claim';
import Badge from './ui/Badge';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import Card from './ui/Card';
import Modal from './ui/Modal';
import ClaimTimeline from './ClaimTimeline';
import { User, Mail, Calendar, Clock, MessageSquare, ChevronDown, Building2, FolderOpen, AlertTriangle, Target, FileText, Image as ImageIcon, Video as VideoIcon, Lock, Star, CheckCircle, XCircle, History } from 'lucide-react';

interface ClaimDetailViewProps {
  claimId: string;
}

const ClaimDetailView = ({ claimId }: ClaimDetailViewProps) => {
  const { 
    getClaimById, 
    updateClaimStatus, 
    addClaimNote, 
    assignClaim, 
    updateClaimPriority,
    updateClaimType,
    updateClaimSeverity,
    assignClaimToArea,
    closeClaim,
    reopenClaim,
    addClaimFeedback,
    getClaimHistory
  } = useClaims();
  const { statuses } = useStatuses();
  const { users } = useUsers();
  const { getCustomerById } = useCustomers();
  const { getProjectById } = useProjects();
  const { user } = useAuth();
  const claim = getClaimById(claimId);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showSeverityMenu, setShowSeverityMenu] = useState(false);
  const [showAreaMenu, setShowAreaMenu] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [assignQuery, setAssignQuery] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const assignMenuRef = useRef<HTMLDivElement | null>(null);
  const priorityMenuRef = useRef<HTMLDivElement | null>(null);
  const typeMenuRef = useRef<HTMLDivElement | null>(null);
  const severityMenuRef = useRef<HTMLDivElement | null>(null);
  const areaMenuRef = useRef<HTMLDivElement | null>(null);

  const customer = claim?.customerId ? getCustomerById(claim.customerId) : null;
  const project = claim?.projectId ? getProjectById(claim.projectId) : null;
  const history = claim ? getClaimHistory(claimId) : [];
  const isClosed = claim?.status === 'Resuelto' || claim?.closedAt;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAssignMenu && assignMenuRef.current && !assignMenuRef.current.contains(event.target as Node)) {
        setShowAssignMenu(false);
        setAssignQuery('');
      }
      if (showPriorityMenu && priorityMenuRef.current && !priorityMenuRef.current.contains(event.target as Node)) {
        setShowPriorityMenu(false);
      }
      if (showTypeMenu && typeMenuRef.current && !typeMenuRef.current.contains(event.target as Node)) {
        setShowTypeMenu(false);
      }
      if (showSeverityMenu && severityMenuRef.current && !severityMenuRef.current.contains(event.target as Node)) {
        setShowSeverityMenu(false);
      }
      if (showAreaMenu && areaMenuRef.current && !areaMenuRef.current.contains(event.target as Node)) {
        setShowAreaMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAssignMenu, showPriorityMenu, showTypeMenu, showSeverityMenu, showAreaMenu]);

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

    addClaimNote(claimId, newNote, user?.name || 'Usuario', isInternalNote);
    setNewNote('');
    setIsInternalNote(false);
  };

  const handleCloseClaim = () => {
    if (!resolutionSummary.trim()) return;

    const resolution: ClaimResolution = {
      summary: resolutionSummary,
      resolvedBy: user?.name || 'Usuario',
      resolvedById: user?.id,
      resolvedAt: new Date(),
      resolutionNotes: resolutionNotes.trim() || undefined
    };

    closeClaim(claimId, resolution);
    setShowCloseModal(false);
    setResolutionSummary('');
    setResolutionNotes('');
  };

  const handleSubmitFeedback = () => {
    if (feedbackRating === 0) return;

    addClaimFeedback(claimId, {
      rating: feedbackRating,
      comment: feedbackComment.trim() || undefined,
      submittedBy: claim?.customerName || 'Cliente'
    });

    setShowFeedbackModal(false);
    setFeedbackRating(0);
    setFeedbackComment('');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h3>
          <div className="space-y-3">
            {customer && (
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  {customer.company && (
                    <p className="text-xs text-gray-500">{customer.company}</p>
                  )}
                </div>
              </div>
            )}
            {project && (
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Proyecto</p>
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-gray-500">{project.description}</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Nombre de Contacto</p>
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

            {/* Tipo de Reclamo */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Tipo de Reclamo</label>
              <div className="relative" ref={typeMenuRef}>
                <button
                  onClick={() => {
                    setShowTypeMenu(!showTypeMenu);
                    setShowPriorityMenu(false);
                    setShowSeverityMenu(false);
                    setShowAreaMenu(false);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{CLAIM_TYPE_LABELS[claim.type || 'other']}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showTypeMenu ? 'rotate-180' : ''}`} />
                </button>
                {showTypeMenu && (
                  <div className="absolute z-[70] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
                    {Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          updateClaimType(claimId, value as ClaimType);
                          setShowTypeMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                          claim.type === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-900">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Severidad (Criticidad) */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Nivel de Criticidad</label>
              <div className="relative" ref={severityMenuRef}>
                <button
                  onClick={() => {
                    setShowSeverityMenu(!showSeverityMenu);
                    setShowTypeMenu(false);
                    setShowPriorityMenu(false);
                    setShowAreaMenu(false);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">{SEVERITY_LABELS[claim.severity || 'medium']}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showSeverityMenu ? 'rotate-180' : ''}`} />
                </button>
                {showSeverityMenu && (
                  <div className="absolute z-[70] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
                    {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          updateClaimSeverity(claimId, value as Severity);
                          setShowSeverityMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                          claim.severity === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-900">{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Asignación por Área */}
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block">Asignar a Área</label>
              <div className="relative" ref={areaMenuRef}>
                <button
                  onClick={() => {
                    setShowAreaMenu(!showAreaMenu);
                    setShowTypeMenu(false);
                    setShowSeverityMenu(false);
                    setShowPriorityMenu(false);
                  }}
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {claim.assignedToArea ? CLAIM_AREA_LABELS[claim.assignedToArea] : 'Sin asignar'}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showAreaMenu ? 'rotate-180' : ''}`} />
                </button>
                {showAreaMenu && (
                  <div className="absolute z-[70] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 p-2 space-y-1">
                    <button
                      onClick={() => {
                        assignClaimToArea(claimId, null);
                        setShowAreaMenu(false);
                      }}
                      className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                        !claim.assignedToArea ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <span className="text-sm font-semibold text-gray-900">Sin asignar</span>
                    </button>
                    {Object.entries(CLAIM_AREA_LABELS).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => {
                          assignClaimToArea(claimId, value as ClaimArea);
                          setShowAreaMenu(false);
                        }}
                        className={`w-full px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                          claim.assignedToArea === value ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-900">{label}</span>
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Descripción del Reclamo</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{claim.description}</p>
      </Card>

      {/* Archivos Adjuntos */}
      {claim.attachments && claim.attachments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Archivos Adjuntos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {claim.attachments.map((attachment) => (
              <div key={attachment.id} className="relative bg-gradient-to-br from-white to-neutral-50 rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {attachment.type.startsWith('image/') ? (
                  <div className="aspect-video bg-gradient-to-br from-neutral-50 to-white flex items-center justify-center">
                    {attachment.url ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-50 to-purple-100/50 flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-purple-500" />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {attachment.type.startsWith('image/') ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : (
                      <VideoIcon className="w-4 h-4 text-purple-500" />
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  {attachment.uploadedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(attachment.uploadedAt).toLocaleDateString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Línea de Tiempo / Trazabilidad Completa */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Trazabilidad Completa</h3>
          </div>
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showTimeline ? 'Ocultar' : 'Ver línea de tiempo'}
          </button>
        </div>
        
        {showTimeline && history.length > 0 && (
          <div className="mb-6">
            <ClaimTimeline history={history} />
          </div>
        )}

        {(!showTimeline || history.length === 0) && (
          <div className="text-center py-8 text-sm text-gray-500">
            {history.length === 0 
              ? 'No hay historial registrado aún'
              : 'Haz clic en "Ver línea de tiempo" para ver el historial completo'}
          </div>
        )}
      </Card>

      {/* Resolución del Reclamo (si está cerrado) */}
      {isClosed && claim?.resolution && (
        <Card className="p-6 border-2 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-semibold text-emerald-900">Reclamo Resuelto</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Resumen de Resolución</p>
              <p className="text-sm font-medium text-gray-900">{claim.resolution.summary}</p>
            </div>
            {claim.resolution.resolutionNotes && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Notas Adicionales</p>
                <p className="text-sm text-gray-700">{claim.resolution.resolutionNotes}</p>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-emerald-200">
              <div>
                <p className="text-xs text-gray-600">Resuelto por</p>
                <p className="text-sm font-medium text-gray-900">{claim.resolution.resolvedBy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Fecha de cierre</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(claim.resolution.resolvedAt).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {!claim?.feedback && (
              <div className="pt-3 border-t border-emerald-200">
                <Button onClick={() => setShowFeedbackModal(true)} variant="secondary" size="sm">
                  Agregar Retroalimentación del Cliente
                </Button>
              </div>
            )}
            {claim?.status === 'Resuelto' && (
              <div className="pt-3 border-t border-emerald-200">
                <Button onClick={() => reopenClaim(claimId)} variant="secondary" size="sm">
                  Reabrir Reclamo
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Retroalimentación del Cliente */}
      {claim?.feedback && (
        <Card className="p-6 border-2 border-yellow-200 bg-yellow-50/30">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Retroalimentación del Cliente</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-2">Calificación</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Star
                    key={rating}
                    className={`w-5 h-5 ${
                      rating <= claim.feedback.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {claim.feedback.rating}/5
                </span>
              </div>
            </div>
            {claim.feedback.comment && (
              <div>
                <p className="text-xs text-gray-600 mb-1">Comentario</p>
                <p className="text-sm text-gray-700">{claim.feedback.comment}</p>
              </div>
            )}
            <div className="text-xs text-gray-500">
              {new Date(claim.feedback.submittedAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Notas y Comentarios */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notas y Comentarios</h3>
        </div>

        <div className="space-y-4 mb-6">
          {claim.notes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No hay notas de seguimiento aún
            </p>
          ) : (
            <div className="space-y-4">
              {claim.notes.map(note => (
                <div
                  key={note.id}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    note.isInternal
                      ? 'border-purple-500 bg-purple-50/50'
                      : 'border-blue-500 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{note.author}</span>
                      {note.isInternal && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          <Lock className="w-3 h-3" />
                          Interna
                        </span>
                      )}
                    </div>
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
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="internalNote"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="internalNote" className="text-sm text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Nota interna (solo visible para el equipo)
            </label>
          </div>
          <TextArea
            placeholder={isInternalNote ? "Escriba una nota interna para el equipo..." : "Escriba una nota de seguimiento..."}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleAddNote} disabled={!newNote.trim()}>
              {isInternalNote ? 'Añadir Nota Interna' : 'Añadir Nota'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Acciones Finales */}
      {!isClosed && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acciones</h3>
              <p className="text-sm text-gray-600">Cerrar el reclamo cuando esté completamente resuelto</p>
            </div>
            <Button onClick={() => setShowCloseModal(true)}>
              Cerrar Reclamo
            </Button>
          </div>
        </Card>
      )}

      {/* Modal para Cerrar Reclamo */}
      {showCloseModal && (
        <Modal
          isOpen={showCloseModal}
          onClose={() => {
            setShowCloseModal(false);
            setResolutionSummary('');
            setResolutionNotes('');
          }}
          title="Cerrar Reclamo"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resumen de Resolución *
              </label>
              <TextArea
                placeholder="Describe brevemente cómo se resolvió el reclamo..."
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <TextArea
                placeholder="Información adicional sobre la resolución..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCloseModal(false);
                  setResolutionSummary('');
                  setResolutionNotes('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCloseClaim} disabled={!resolutionSummary.trim()}>
                Cerrar Reclamo
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal para Retroalimentación del Cliente */}
      {showFeedbackModal && (
        <Modal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackRating(0);
            setFeedbackComment('');
          }}
          title="Retroalimentación del Cliente"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Calificación *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackRating(rating)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      rating <= feedbackRating
                        ? 'bg-yellow-500 text-white scale-110'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${rating <= feedbackRating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario (Opcional)
              </label>
              <TextArea
                placeholder="¿Cómo fue tu experiencia con el servicio?"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackRating(0);
                  setFeedbackComment('');
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmitFeedback} disabled={feedbackRating === 0}>
                Enviar Retroalimentación
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClaimDetailView;
