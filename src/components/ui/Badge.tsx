import { ClaimStatus } from '../../types/claim';
import { useStatuses } from '../../context/StatusContext';

interface BadgeProps {
  status: ClaimStatus;
}

const Badge = ({ status }: BadgeProps) => {
  const { statuses } = useStatuses();

  const statusConfig = statuses.find(s => s.name === status);
  const color = statusConfig?.color || 'gray';

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    orange: 'bg-orange-100 text-orange-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    pink: 'bg-pink-100 text-pink-700',
    teal: 'bg-teal-100 text-teal-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
      {status}
    </span>
  );
};

export default Badge;
