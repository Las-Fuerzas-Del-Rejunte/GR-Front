import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { ClaimStatus } from '../types/claim';
import KanbanCard from '../components/KanbanCard';
import Button from '../components/ui/Button';
import { Plus, Search, Filter } from 'lucide-react';

interface KanbanBoardProps {
  onOpenNewClaim: () => void;
  onOpenClaimDetail: (claimId: string) => void;
}

const KanbanBoard = ({ onOpenNewClaim, onOpenClaimDetail }: KanbanBoardProps) => {
  const { claims, updateClaimStatus, searchClaims } = useClaims();
  const { statuses } = useStatuses();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClaimStatus | 'all'>('all');

  const filteredClaims = useMemo(() => {
    let result = searchQuery ? searchClaims(searchQuery) : claims;

    if (filterStatus !== 'all') {
      result = result.filter(claim => claim.status === filterStatus);
    }

    return result;
  }, [claims, searchQuery, filterStatus, searchClaims]);

  const claimsByStatus = useMemo(() => {
    const grouped: Record<string, typeof claims> = {};

    statuses.forEach(status => {
      grouped[status.name] = [];
    });

    filteredClaims.forEach(claim => {
      if (grouped[claim.status]) {
        grouped[claim.status].push(claim);
      }
    });

    return grouped;
  }, [filteredClaims, statuses]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, draggableId } = result;

    if (!destination) return;

    const newStatus = destination.droppableId as ClaimStatus;
    updateClaimStatus(draggableId, newStatus);
  };

  const getColumnColors = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-300 bg-blue-50',
      amber: 'border-amber-300 bg-amber-50',
      orange: 'border-orange-300 bg-orange-50',
      green: 'border-green-300 bg-green-50',
      red: 'border-red-300 bg-red-50',
      purple: 'border-purple-300 bg-purple-50',
      pink: 'border-pink-300 bg-pink-50',
      teal: 'border-teal-300 bg-teal-50',
      gray: 'border-gray-300 bg-gray-50'
    };
    return colorMap[color] || 'border-gray-300 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vista de Reclamos</h1>
          <p className="text-sm text-gray-600 mt-1">Tablero Kanban interactivo</p>
        </div>
        <Button onClick={onOpenNewClaim} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Registrar Nuevo Reclamo
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, asunto, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ClaimStatus | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            {statuses.map(status => (
              <option key={status.id} value={status.name}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`grid gap-6 ${statuses.length <= 4 ? `grid-cols-1 md:grid-cols-2 lg:grid-cols-${statuses.length}` : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {statuses.map(status => (
            <div key={status.id} className="flex flex-col">
              <div className={`rounded-t-lg border-t-4 ${getColumnColors(status.color)} px-4 py-3`}>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">{status.name}</h2>
                  <span className="text-sm font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full">
                    {claimsByStatus[status.name]?.length || 0}
                  </span>
                </div>
              </div>

              <Droppable droppableId={status.name}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-100 rounded-b-lg p-4 space-y-3 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-gray-200' : ''
                    }`}
                  >
                    {(claimsByStatus[status.name] || []).map((claim, index) => (
                      <Draggable key={claim.id} draggableId={claim.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <KanbanCard
                              claim={claim}
                              onClick={() => onOpenClaimDetail(claim.id)}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
