import { AuditEvent } from '../types/claim';
import { 
  FileText, 
  RefreshCw, 
  UserPlus, 
  UserMinus, 
  Users, 
  AlertCircle, 
  MessageSquare,
  Edit
} from 'lucide-react';

interface ClaimTimelineProps {
  events: AuditEvent[];
}

const ClaimTimeline = ({ events }: ClaimTimelineProps) => {
  // Ordenar eventos por fecha descendente (más reciente primero)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getEventIcon = (type: AuditEvent['type']) => {
    const iconClasses = "w-5 h-5";
    switch (type) {
      case 'created':
        return <FileText className={iconClasses} />;
      case 'status_changed':
        return <RefreshCw className={iconClasses} />;
      case 'assigned':
        return <UserPlus className={iconClasses} />;
      case 'unassigned':
        return <UserMinus className={iconClasses} />;
      case 'reassigned':
        return <Users className={iconClasses} />;
      case 'priority_changed':
        return <AlertCircle className={iconClasses} />;
      case 'note_added':
        return <MessageSquare className={iconClasses} />;
      case 'updated':
        return <Edit className={iconClasses} />;
      default:
        return <RefreshCw className={iconClasses} />;
    }
  };

  const getEventColor = (type: AuditEvent['type']) => {
    switch (type) {
      case 'created':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-500',
          text: 'text-blue-700',
          icon: 'text-blue-600'
        };
      case 'status_changed':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-500',
          text: 'text-purple-700',
          icon: 'text-purple-600'
        };
      case 'assigned':
      case 'reassigned':
        return {
          bg: 'bg-green-100',
          border: 'border-green-500',
          text: 'text-green-700',
          icon: 'text-green-600'
        };
      case 'unassigned':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-700',
          icon: 'text-gray-600'
        };
      case 'priority_changed':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-500',
          text: 'text-orange-700',
          icon: 'text-orange-600'
        };
      case 'note_added':
        return {
          bg: 'bg-indigo-100',
          border: 'border-indigo-500',
          text: 'text-indigo-700',
          icon: 'text-indigo-600'
        };
      case 'updated':
        return {
          bg: 'bg-teal-100',
          border: 'border-teal-500',
          text: 'text-teal-700',
          icon: 'text-teal-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-500',
          text: 'text-gray-700',
          icon: 'text-gray-600'
        };
    }
  };

  const getEventTitle = (event: AuditEvent): string => {
    switch (event.type) {
      case 'created':
        return 'Reclamo creado';
      case 'status_changed':
        return 'Estado actualizado';
      case 'assigned':
        return 'Reclamo asignado';
      case 'unassigned':
        return 'Asignación removida';
      case 'reassigned':
        return 'Reclamo reasignado';
      case 'priority_changed':
        return 'Prioridad modificada';
      case 'note_added':
        return 'Nota de seguimiento agregada';
      case 'updated':
        return 'Reclamo actualizado';
      default:
        return 'Evento registrado';
    }
  };

  const getEventDescription = (event: AuditEvent): string => {
    const { details } = event;
    
    switch (event.type) {
      case 'created':
        return `Reclamo iniciado por ${event.user}`;
      
      case 'status_changed':
        return `Estado cambiado de "${details.previousValue}" a "${details.newValue}"`;
      
      case 'assigned':
        if (Array.isArray(details.newValue)) {
          const names = details.newValue.map((u: any) => u.name).join(', ');
          return `Asignado a: ${names}${details.area ? ` (${details.area})` : ''}`;
        }
        return `Asignado a: ${details.newValue}${details.area ? ` (${details.area})` : ''}`;
      
      case 'unassigned':
        return 'Reclamo sin asignar';
      
      case 'reassigned':
        const prevNames = Array.isArray(details.previousValue) 
          ? details.previousValue.map((u: any) => u.name).join(', ')
          : details.previousValue || 'Sin asignar';
        const newNames = Array.isArray(details.newValue)
          ? details.newValue.map((u: any) => u.name).join(', ')
          : details.newValue;
        return `Reasignado de ${prevNames} a ${newNames}`;
      
      case 'priority_changed':
        const priorityMap: Record<string, string> = {
          urgent: 'Urgente',
          high: 'Alta',
          medium: 'Media',
          low: 'Baja'
        };
        const prev = priorityMap[details.previousValue] || details.previousValue || 'Sin prioridad';
        const curr = priorityMap[details.newValue] || details.newValue;
        return `Prioridad cambiada de "${prev}" a "${curr}"`;
      
      case 'note_added':
        return details.description || 'Se agregó una nota de seguimiento';
      
      case 'updated':
        return details.description || 'Información del reclamo actualizada';
      
      default:
        return details.description || 'Evento registrado';
    }
  };

  const getPriorityEmoji = (priority: string): string => {
    const map: Record<string, string> = {
      urgent: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return map[priority] || '';
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No hay eventos registrados</p>
        <p className="text-sm text-gray-400 mt-1">Los eventos se registrarán automáticamente</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Línea vertical de conexión */}
      <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 via-gray-200 to-transparent" />
      
      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const colors = getEventColor(event.type);
          const isFirst = index === 0;
          
          return (
            <div key={event.id} className="relative pl-16">
              {/* Icono del evento */}
              <div className={`absolute left-0 top-0 w-12 h-12 rounded-full ${colors.bg} border-4 ${colors.border} flex items-center justify-center ${colors.icon} shadow-md z-10`}>
                {getEventIcon(event.type)}
              </div>
              
              {/* Contenido del evento */}
              <div className={`${isFirst ? 'ring-2 ring-blue-400 shadow-lg' : 'shadow-sm'} bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className={`font-semibold ${colors.text} text-sm`}>
                      {getEventTitle(event)}
                    </h4>
                    <p className="text-gray-700 text-sm mt-1">
                      {getEventDescription(event)}
                    </p>
                  </div>
                  {event.type === 'priority_changed' && event.details.newValue && (
                    <span className="ml-3 text-2xl flex-shrink-0">
                      {getPriorityEmoji(event.details.newValue)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-700">{event.user}</span>
                  </div>
                  {event.details.area && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-gray-600">{event.details.area}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-gray-400">•</span>
                    <time dateTime={new Date(event.timestamp).toISOString()}>
                      {new Date(event.timestamp).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
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
