import { Claim } from '../types/claim';
import Badge from './ui/Badge';

interface KanbanCardProps {
  claim: Claim;
  onClick: () => void;
}

const KanbanCard = ({ claim, onClick }: KanbanCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-gray-500">{claim.id}</span>
        <Badge status={claim.status} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {claim.subject}
      </h3>
      <p className="text-sm text-gray-600 mb-3">
        {claim.customerName}
      </p>
      <div className="text-xs text-gray-500">
        {new Date(claim.updatedAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};

export default KanbanCard;
