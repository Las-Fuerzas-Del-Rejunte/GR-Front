import { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, Lock, Info, Loader2 } from 'lucide-react';
import { useStatuses } from '../context/StatusContext';
import { useClaims } from '../context/ClaimsContext';
import { Claim } from '../types/claim';
import Button from './ui/Button';
import TextArea from './ui/TextArea';
import Modal from './ui/Modal';

interface StatusManagerProps {
  claim: Claim;
}

const StatusManager = ({ claim }: StatusManagerProps) => {
  const { getStatusConfig, getSubStatuses, canPerformAction, getAvailableTransitions, loadSubStatuses } = useStatuses();
  const { updateClaimStatus, updateClaimSubStatus, isUpdating } = useClaims();
  
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSubStatusMenu, setShowSubStatusMenu] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [resolutionSummary, setResolutionSummary] = useState(claim.resolutionSummary || '');
  
  const statusMenuRef = useRef<HTMLDivElement | null>(null);
  const subStatusMenuRef = useRef<HTMLDivElement | null>(null);

  // Usar statusName si está disponible, sino usar status (UUID)
  const statusKey = claim.statusName || claim.status;
  const currentStatusConfig = getStatusConfig(statusKey);
  const currentSubStatuses = getSubStatuses(claim.status); // ✅ Usar UUID directamente
  const availableTransitions = getAvailableTransitions(statusKey, 'agent'); // TODO: obtener role del usuario actual

  // 🐛 DEBUG: Verificar qué retorna getSubStatuses
  console.log('🔍 Verificando getSubStatuses:', {
    claimStatus: claim.status.substring(0, 8),
    claimStatusName: claim.statusName,
    currentSubStatuses_length: currentSubStatuses.length,
    currentSubStatuses_ids: currentSubStatuses.map(s => s.id.substring(0, 8))
  });

  // Cargar sub-estados desde el backend cuando se monta o cambia el estado
  useEffect(() => {
    if (claim.status) {
      console.log('🔄 StatusManager - Cargando sub-estados para:', claim.status.substring(0, 8));
      loadSubStatuses(claim.status);
    }
  }, [claim.status]); // ✅ Removido loadSubStatuses de dependencias

  // Log para debug: mostrar sub-estados disponibles (solo cuando cambian)
  useEffect(() => {
    if (currentSubStatuses.length > 0) {
      const selected = currentSubStatuses.find(s => s.id === claim.subStatus);
      console.log('🎯 Sub-estados disponibles:', {
        claimStatus: claim.status.substring(0, 8),
        claimStatusName: claim.statusName,
        totalSubStatuses: currentSubStatuses.length,
        subStatusList: currentSubStatuses.map(s => ({ id: s.id.substring(0, 8), name: s.name })),
        claimSubStatus: claim.subStatus?.substring(0, 8) || 'null',
        selectedSubStatus: selected?.name || '❌ NO ENCONTRADO'
      });
    }
  }, [currentSubStatuses.length, claim.subStatus]); // ✅ Solo cuando cambia la cantidad o el subStatus

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStatusMenu && statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
      if (showSubStatusMenu && subStatusMenuRef.current && !subStatusMenuRef.current.contains(event.target as Node)) {
        setShowSubStatusMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStatusMenu, showSubStatusMenu]);

  const handleStatusChange = (newStatusId: string) => {
    const targetConfig = getStatusConfig(newStatusId);
    if (!targetConfig) return;

    // Si requiere confirmación o resumen de resolución, mostrar modal
    const transition = availableTransitions.find(t => t.to === newStatusId);
    if (transition?.requiresConfirmation || targetConfig.permissions.requiresResolutionSummary) {
      setPendingStatus(newStatusId);
      setShowResolutionModal(true);
      setShowStatusMenu(false);
      return;
    }

    // Cambiar estado directamente
    updateClaimStatus(claim.id, targetConfig.name, 'Agente de Servicio');
    setShowStatusMenu(false);
  };

  const handleConfirmStatusChange = () => {
    if (!pendingStatus) return;

    const targetConfig = getStatusConfig(pendingStatus);
    if (!targetConfig) return;

    if (targetConfig.permissions.requiresResolutionSummary && !resolutionSummary.trim()) {
      return; // El botón ya está deshabilitado, pero por seguridad
    }

    updateClaimStatus(claim.id, targetConfig.name, 'Agente de Servicio', resolutionSummary);
    setShowResolutionModal(false);
    setPendingStatus(null);
    setResolutionSummary('');
  };

  const handleSubStatusChange = (subStatusId: string) => {
    updateClaimSubStatus(claim.id, subStatusId, 'Agente de Servicio');
    setShowSubStatusMenu(false);
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

  const canChangeStatus = canPerformAction(statusKey, 'canChangeStatus');
  const isLocked = claim.isLocked || currentStatusConfig?.permissions.isLocked;

  return (
    <div className="space-y-4">
      {/* Indicador de bloqueo */}
      {isLocked && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Lock className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900">Reclamo Bloqueado</p>
            <p className="text-xs text-red-700">Este reclamo está cerrado y bloqueado para preservar la auditoría.</p>
          </div>
        </div>
      )}

      {/* Información del estado actual */}
      {currentStatusConfig?.description && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">{currentStatusConfig.name}</p>
            <p className="text-xs text-blue-700 mt-1">{currentStatusConfig.description}</p>
            {currentStatusConfig.area && (
              <p className="text-xs text-blue-600 mt-1">Área: {currentStatusConfig.area}</p>
            )}
          </div>
        </div>
      )}

      {/* Selector de Estado Principal */}
      <div>
        <label className="text-sm font-semibold text-gray-700 mb-2 block">
          Estado del Reclamo
          {!canChangeStatus && <span className="ml-2 text-xs text-red-600">(No modificable)</span>}
        </label>
        
        {canChangeStatus ? (
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              disabled={isLocked}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getSelectedClasses(currentStatusConfig?.color || 'gray').dot}`} />
                <span className="font-semibold text-gray-900">{claim.statusName || claim.status}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-200 ${showStatusMenu ? 'rotate-180' : ''}`} />
            </button>

            {showStatusMenu && (
              <div ref={statusMenuRef} className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-80 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {availableTransitions.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-500 text-center">
                      No hay transiciones disponibles desde este estado
                    </div>
                  ) : (
                    availableTransitions.map(transition => {
                      const targetStatus = getStatusConfig(transition.to);
                      if (!targetStatus) return null;

                      const colors = getSelectedClasses(targetStatus.color);
                      const isCurrentStatus = targetStatus.name === claim.status;

                      return (
                        <button
                          key={transition.to}
                          onClick={() => handleStatusChange(transition.to)}
                          disabled={isCurrentStatus}
                          className={`w-full px-4 py-3 rounded-md text-left transition-colors flex items-center justify-between ${
                            isCurrentStatus
                              ? `${colors.bg} ring-2 ${colors.border} cursor-not-allowed`
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                              <span className="text-sm font-semibold text-gray-900">{targetStatus.name}</span>
                            </div>
                            {transition.message && (
                              <p className="text-xs text-gray-600 ml-5">{transition.message}</p>
                            )}
                          </div>
                          {transition.requiresConfirmation && (
                            <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`w-full px-4 py-3 border-2 rounded-lg ${getSelectedClasses(currentStatusConfig?.color || 'gray').border} ${getSelectedClasses(currentStatusConfig?.color || 'gray').bg}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getSelectedClasses(currentStatusConfig?.color || 'gray').dot}`} />
              <span className="font-semibold text-gray-900">{claim.statusName || claim.status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Selector de Sub-Estado */}
      {currentSubStatuses.length > 0 && !isLocked && (
        <div className="relative z-10">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Progreso Interno (Sub-Estado)
          </label>
          <div className="relative">
            <button
              onClick={() => setShowSubStatusMenu(!showSubStatusMenu)}
              disabled={isUpdating}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-all duration-200 text-left flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="font-medium text-gray-600">Actualizando...</span>
                </div>
              ) : (
                <span className="font-medium text-gray-900">
                  {(() => {
                    if (!claim.subStatus) return 'Seleccionar progreso...';
                    
                    const selected = currentSubStatuses.find(s => s.id === claim.subStatus);
                    
                    // Debug log
                    if (!selected) {
                      console.warn('⚠️ Sub-estado no encontrado en lista:', {
                        claimSubStatus: claim.subStatus?.substring(0, 8),
                        availableIds: currentSubStatuses.map(s => s.id.substring(0, 8)),
                        availableNames: currentSubStatuses.map(s => s.name)
                      });
                    }
                    
                    return selected?.name || 'Seleccionar progreso...';
                  })()}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-all duration-200 ${showSubStatusMenu ? 'rotate-180' : ''}`} />
            </button>

            {showSubStatusMenu && (
              <div ref={subStatusMenuRef} className="absolute z-[9999] mt-2 w-full bg-white rounded-lg shadow-2xl border border-gray-200 max-h-64 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {currentSubStatuses.map(subStatus => {
                    const isActive = claim.subStatus === subStatus.id;
                    return (
                      <button
                        key={subStatus.id}
                        onClick={() => handleSubStatusChange(subStatus.id)}
                        className={`w-full px-3 py-2 rounded-md text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-purple-50 ring-2 ring-purple-500 font-semibold text-purple-900'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {subStatus.name}
                        {subStatus.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{subStatus.description}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            El sub-estado proporciona mayor detalle sobre el progreso dentro del estado actual
          </p>
        </div>
      )}

      {/* Resumen de Resolución (si existe) */}
      {claim.resolutionSummary && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 mb-2">✅ Resumen de Resolución</h4>
          <p className="text-sm text-green-800 whitespace-pre-wrap">{claim.resolutionSummary}</p>
        </div>
      )}

      {/* Modal para confirmar cambio de estado o agregar resumen */}
      <Modal
        isOpen={showResolutionModal}
        onClose={() => {
          setShowResolutionModal(false);
          setPendingStatus(null);
        }}
        title={`Cambiar a ${getStatusConfig(pendingStatus || '')?.name}`}
      >
        <div className="space-y-4">
          {pendingStatus && getStatusConfig(pendingStatus)?.permissions.requiresResolutionSummary && (
            <>
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-orange-900">⚠️ Atención</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Al marcar como resuelto, el reclamo se bloqueará automáticamente y no podrá ser editado para preservar la auditoría.
                    Debe proporcionar un resumen detallado de cómo se resolvió el reclamo.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                  Resumen de Resolución *
                </label>
                <TextArea
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Describa detalladamente cómo se resolvió el reclamo, qué acciones se tomaron y cuál fue el resultado final..."
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este resumen quedará registrado permanentemente en el historial del reclamo
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              onClick={() => {
                setShowResolutionModal(false);
                setPendingStatus(null);
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={!!(pendingStatus && getStatusConfig(pendingStatus)?.permissions.requiresResolutionSummary && !resolutionSummary.trim())}
            >
              Confirmar Cambio
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StatusManager;
