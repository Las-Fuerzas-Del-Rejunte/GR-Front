import { Claim } from '../types/claim';
import { Calendar, MessageCircle } from 'lucide-react';

interface KanbanCardProps {
  claim: Claim;
  onClick: () => void;
}

const KanbanCard = ({ claim, onClick }: KanbanCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAuthor = () => {
    // Si hay notas, usar el autor de la primera nota
    if (claim.notes && claim.notes.length > 0) {
      return claim.notes[0].author;
    }
    // Por defecto usar el customerName
    return claim.customerName;
  };

  const author = getAuthor();
  const commentCount = claim.notes?.length || 0;

  return (
    <div
      onClick={onClick}
      className="rounded-lg p-4 cursor-pointer glass glass-hover duration-200"
    >
      {/* Título */}
      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {claim.subject}
      </h3>

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

        {/* Avatar del autor con tooltip */}
        <div className="relative group">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-xs font-semibold text-white">
              {getInitials(author)}
            </span>
          </div>
          
          {/* Tooltip mejorado */}
          <div className="absolute right-0 bottom-full mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
            <span className="font-medium">{author}</span>
            <div className="absolute bottom-0 right-4 transform translate-y-full">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
