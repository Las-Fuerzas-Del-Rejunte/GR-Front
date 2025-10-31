import { Claim } from '../types/claim';
import { Calendar, MessageCircle, User } from 'lucide-react';

interface KanbanCardProps {
  claim: Claim;
  onClick: () => void;
}

const KanbanCard = ({ claim, onClick }: KanbanCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const commentCount = claim.notes?.length || 0;
  
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      onClick={onClick}
      className="rounded-lg p-4 cursor-pointer glass glass-hover duration-200"
    >
      {/* Header con prioridad */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 flex-1">
          {claim.subject}
        </h3>
        {claim.priority && (
          <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 flex-shrink-0 ${getPriorityColor(claim.priority)}`}>
            {claim.priority === 'urgent' ? 'Urgente' : 
             claim.priority === 'high' ? 'Alta' :
             claim.priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        )}
      </div>

      {/* Descripción corta */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-1">
        {claim.description}
      </p>

      {/* Footer con metadata */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {/* Fecha */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {new Date(claim.createdAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short'
              })}
            </span>
          </div>

          {/* Comentarios/Seguimiento */}
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">{commentCount}</span>
          </div>
        </div>

        {/* Avatar/es de la persona asignada con tooltip */}
        <div className="relative group">
          {claim.assignedTo && claim.assignedTo.length > 0 ? (
            <>
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-semibold text-white">
                    {getInitials(claim.assignedTo[0].name)}
                  </span>
                </div>
                {claim.assignedTo.length > 1 && (
                  <div className="absolute -right-2 -bottom-2 w-5 h-5 rounded-full bg-gray-800 text-white text-[10px] flex items-center justify-center shadow">
                    +{claim.assignedTo.length - 1}
                  </div>
                )}
              </div>
              {/* Tooltip con todos los asignados */}
              <div className="absolute right-0 bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                <span className="font-medium">
                  {claim.assignedTo.map(u => u.name).join(', ')}
                </span>
                <div className="absolute bottom-0 right-4 transform translate-y-full">
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs text-gray-500">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
