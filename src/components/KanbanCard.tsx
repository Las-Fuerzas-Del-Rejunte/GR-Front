import { Claim } from '../types/claim';
import Badge from './ui/Badge';
import { User, Clock, FileText } from 'lucide-react';

interface KanbanCardProps {
  claim: Claim;
  onClick: () => void;
}

const KanbanCard = ({ claim, onClick }: KanbanCardProps) => {
  return (
    <div
      onClick={onClick}
      className="rounded-lg p-4 cursor-pointer glass glass-hover duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-mono text-gray-500 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-2 py-1 rounded">{claim.id}</span>
        <Badge status={claim.status} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 flex items-start gap-2">
        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        {claim.subject}
      </h3>
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <User className="w-4 h-4 text-gray-400" />
        <span>{claim.customerName}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Clock className="w-3 h-3" />
        <span>
          {new Date(claim.updatedAt).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    </div>
  );
};

export default KanbanCard;
