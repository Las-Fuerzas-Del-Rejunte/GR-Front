import { ClaimHistoryEntry, ClaimHistoryAction, CLAIM_AREA_LABELS } from '../types/claim';
import { Clock, User, ArrowRight, CheckCircle, XCircle, AlertCircle, FileText, Target, MessageSquare, Star } from 'lucide-react';

interface ClaimTimelineProps {
  history: ClaimHistoryEntry[];
}

const ACTION_LABELS: Record<ClaimHistoryAction, string> = {
  created: 'Reclamo creado',
  status_changed: 'Estado cambiado',
  assigned_to_area: 'Reasignado a área',
  assigned_to_user: 'Asignado a usuario',
  priority_changed: 'Prioridad cambiada',
  severity_changed: 'Criticidad cambiada',
  type_changed: 'Tipo cambiado',
  note_added: 'Nota agregada',
  attachment_added: 'Adjunto agregado',
  closed: 'Reclamo cerrado',
  reopened: 'Reclamo reabierto'
};

const ACTION_ICONS: Record<ClaimHistoryAction, typeof Clock> = {
  created: CheckCircle,
  status_changed: AlertCircle,
  assigned_to_area: Target,
  assigned_to_user: User,
  priority_changed: AlertCircle,
  severity_changed: AlertCircle,
  type_changed: FileText,
  note_added: MessageSquare,
  attachment_added: FileText,
  closed: CheckCircle,
  reopened: XCircle
};

const ACTION_COLORS: Record<ClaimHistoryAction, string> = {
  created: 'text-blue-600 bg-blue-50 border-blue-200',
  status_changed: 'text-purple-600 bg-purple-50 border-purple-200',
  assigned_to_area: 'text-orange-600 bg-orange-50 border-orange-200',
  assigned_to_user: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  priority_changed: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  severity_changed: 'text-red-600 bg-red-50 border-red-200',
  type_changed: 'text-gray-600 bg-gray-50 border-gray-200',
  note_added: 'text-green-600 bg-green-50 border-green-200',
  attachment_added: 'text-teal-600 bg-teal-50 border-teal-200',
  closed: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  reopened: 'text-rose-600 bg-rose-50 border-rose-200'
};

export const ClaimTimeline = ({ history }: ClaimTimelineProps) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No hay historial registrado aún</p>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-200" />
      
      <div className="space-y-6">
        {sortedHistory.map((entry, index) => {
          const Icon = ACTION_ICONS[entry.action];
          const colorClasses = ACTION_COLORS[entry.action];
          
          return (
            <div key={entry.id} className="relative flex items-start gap-4">
              {/* Círculo con icono */}
              <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${colorClasses} border-2 flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Contenido */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {ACTION_LABELS[entry.action]}
                      </h4>
                      {entry.userName && (
                        <span className="text-xs text-gray-500">por {entry.userName}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {entry.description && (
                    <p className="text-sm text-gray-700 mb-2">{entry.description}</p>
                  )}
                  
                  {/* Cambios de valor */}
                  {(entry.previousValue || entry.newValue) && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
                      {entry.previousValue && (
                        <span className="px-2 py-1 bg-gray-100 rounded">{entry.previousValue}</span>
                      )}
                      {entry.previousValue && entry.newValue && (
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      )}
                      {entry.newValue && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                          {entry.newValue}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Metadata adicional */}
                  {entry.metadata?.newArea && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">Área:</span>{' '}
                      {CLAIM_AREA_LABELS[entry.metadata.newArea as keyof typeof CLAIM_AREA_LABELS] || entry.metadata.newArea}
                    </div>
                  )}
                  
                  {entry.metadata?.newUserIds && Array.isArray(entry.metadata.newUserIds) && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">Usuarios asignados:</span>{' '}
                      {entry.metadata.newUserIds.length} usuario(s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClaimTimeline;

