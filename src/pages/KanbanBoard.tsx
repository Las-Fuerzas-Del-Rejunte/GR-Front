import { useState, useMemo, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult, DragUpdate, DragStart } from '@hello-pangea/dnd';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { useAuth } from '../context/AuthContext';
import { ClaimStatus } from '../types/claim';
import KanbanCard from '../components/KanbanCard';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Search, Filter, ChevronDown, Plus } from 'lucide-react';

interface KanbanBoardProps {
  onOpenNewClaim: () => void;
  onOpenClaimDetail: (claimId: string) => void;
  onCreateClaimWithStatus?: (status: string) => void;
}

const KanbanBoard = ({ onOpenNewClaim, onOpenClaimDetail, onCreateClaimWithStatus }: KanbanBoardProps) => {
  const { claims, updateClaimStatus, searchClaims, loading, isUpdating } = useClaims();
  const { statuses, reorderStatuses } = useStatuses();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<ClaimStatus[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const [draggedClaimId, setDraggedClaimId] = useState<string | null>(null);
  const [dragDestination, setDragDestination] = useState<{ droppableId: string; index: number } | null>(null);

  // Verificar si el usuario es viewer (solo lectura)
  const isViewer = user?.role === 'viewer';

  const filteredClaims = useMemo(() => {
    let result = searchQuery ? searchClaims(searchQuery) : claims;

    if (selectedStatuses.length > 0) {
      result = result.filter(claim => selectedStatuses.includes(claim.status as ClaimStatus));
    }

    return result;
  }, [claims, searchQuery, selectedStatuses, searchClaims]);

  const claimsByStatus = useMemo(() => {
    const grouped: Record<string, typeof claims> = {};

    // Inicializar grupos por nombre de estado
    statuses.forEach(status => {
      grouped[status.name] = [];
    });

    // Crear un mapa de UUID → nombre de estado
    const statusIdToName = new Map<string, string>();
    statuses.forEach(status => {
      statusIdToName.set(status.id, status.name);
    });

    // Agrupar claims por estado usando el UUID para buscar el nombre
    filteredClaims.forEach(claim => {
      const statusName = statusIdToName.get(claim.status);
      if (statusName && grouped[statusName]) {
        grouped[statusName].push(claim);
      }
    });

    return grouped;
  }, [filteredClaims, statuses]);

  const handleDragStart = (start: DragStart) => {
    // Prevenir drag si es viewer
    if (isViewer) return;
    setDraggedClaimId(start.draggableId);
  };

  const handleDragUpdate = (update: DragUpdate) => {
    // Prevenir drag si es viewer
    if (isViewer) return;
    if (update.destination) {
      setDragDestination({
        droppableId: update.destination.droppableId,
        index: update.destination.index
      });
    } else {
      setDragDestination(null);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    setDraggedClaimId(null);
    setDragDestination(null);

    // Prevenir cualquier acción si es viewer
    if (isViewer) return;

    if (!destination) return;

    // Si estamos arrastrando una columna
    if (type === 'column') {
      reorderStatuses(source.index, destination.index);
      return;
    }

    // Si estamos arrastrando una tarjeta
    // destination.droppableId contiene el nombre del estado
    // Necesitamos encontrar el UUID del estado
    const statusName = destination.droppableId;
    const targetStatus = statuses.find(s => s.name === statusName);
    
    if (targetStatus) {
      // updateClaimStatus espera el UUID del estado
      updateClaimStatus(draggableId, targetStatus.id as ClaimStatus);
    }
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

  const getDotColor = (color: string) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-500',
      amber: 'bg-amber-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500',
      gray: 'bg-gray-500'
    };
    return map[color] || 'bg-gray-500';
  };

  // Componente para el preview de drop (similar al botón de agregar)
  const DropPreview = () => (
    <div className="p-3 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50/50 opacity-60 animate-pulse">
      <div className="flex items-center justify-center gap-2 text-blue-700">
        <Plus className="w-4 h-4" />
        <span className="text-sm font-medium">Soltar aquí</span>
      </div>
    </div>
  );

  const selectedStatusObjects = statuses.filter(s => selectedStatuses.includes(s.name as ClaimStatus));

  const toggleStatus = (statusName: string) => {
    setSelectedStatuses(prev => {
      const exists = prev.includes(statusName as ClaimStatus);
      if (exists) return prev.filter(s => s !== statusName);
      return [...prev, statusName as ClaimStatus];
    });
  };
  const clearStatuses = () => setSelectedStatuses([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isFilterOpen) return;
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFilterOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isFilterOpen]);

  return (
    <div className="space-y-6">
      {/* Overlay sutil cuando se está actualizando */}
      {isUpdating && (
        <div className="fixed top-20 right-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Actualizando...</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reclamos</h1>
          <p className="text-sm text-gray-600 mt-1">
            {isViewer ? 'Vista de solo lectura' : 'Tablero Kanban interactivo'}
          </p>
        </div>
        {!isViewer && (
          <Button onClick={onOpenNewClaim} size="lg">
            Nuevo reclamo
          </Button>
        )}
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
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 w-64 pl-3 pr-9 py-2.5 bg-white/95 border border-blue-200 rounded-full text-sm text-gray-800 shadow-sm hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {selectedStatusObjects.length === 0 ? (
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />
              ) : (
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${getDotColor(selectedStatusObjects[0].color)}`} />
              )}
              <span className="truncate">
                {selectedStatusObjects.length === 0
                  ? 'Todos los estados'
                  : selectedStatusObjects.length === 1
                    ? selectedStatusObjects[0].name
                    : `${selectedStatusObjects.length} estados seleccionados`}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3" />
            </button>

            {isFilterOpen && (
              <div className="absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                <div className="p-2 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Filtrar por estado</span>
                  <button className="text-xs text-blue-600 hover:underline" onClick={clearStatuses}>Limpiar</button>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 text-left"
                    onClick={() => clearStatuses()}
                  >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-gray-400" />
                    Todos los estados
                    {selectedStatusObjects.length === 0 && <span className="ml-auto text-xs text-gray-500">(activo)</span>}
                  </button>
                  {statuses.map((status) => {
                    const checked = selectedStatuses.includes(status.name as ClaimStatus);
                    return (
                      <button
                        key={status.id}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 text-left"
                        onClick={() => toggleStatus(status.name)}
                      >
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${getDotColor(status.color)}`} />
                        {status.name}
                        {checked && <span className="ml-auto text-xs text-blue-600">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DragDropContext onDragStart={handleDragStart} onDragUpdate={handleDragUpdate} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto pb-4">
          <Droppable droppableId="all-columns" direction="horizontal" type="column">
            {(provided) => (
              <div 
                className="flex gap-6 min-w-min"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {statuses.map((status, index) => (
                  <Draggable key={status.id} draggableId={status.id} index={index} isDragDisabled={isViewer}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex flex-col w-80 flex-shrink-0 ${snapshot.isDragging ? 'opacity-70 rotate-2' : ''}`}
                      >
                        <div 
                          {...provided.dragHandleProps}
                          className={`rounded-t-lg border-t-4 ${getColumnColors(status.color)} px-4 py-3 ${isViewer ? 'cursor-default' : 'cursor-move'}`}
                        >
                          <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">{status.name}</h2>
                            <span className="text-sm font-medium text-gray-600 bg-white px-2 py-0.5 rounded-full">
                              {claimsByStatus[status.name]?.length || 0}
                            </span>
                          </div>
                        </div>

                        <Droppable droppableId={status.name} type="card">
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex-1 bg-gradient-to-b from-white via-neutral-50/30 to-white rounded-b-lg p-4 space-y-3 min-h-[500px] transition-all duration-200 ${snapshot.isDraggingOver ? 'bg-gradient-to-b from-blue-50/50 via-blue-100/40 to-blue-50/50' : ''}`}
                            >
                              {/* Mostrar skeletons mientras está cargando */}
                              {loading && <SkeletonCard count={2} />}
                              
                              {/* Mostrar claims cuando ya están cargados */}
                              {!loading && (claimsByStatus[status.name] || []).map((claim, index) => {
                                const showPlaceholderBefore = dragDestination 
                                  && dragDestination.droppableId === status.name 
                                  && dragDestination.index === index 
                                  && draggedClaimId;
                                
                                return (
                                  <div key={claim.id}>
                                    {showPlaceholderBefore && (
                                      <div className="mb-3">
                                        <DropPreview />
                                      </div>
                                    )}
                                    <Draggable draggableId={claim.id} index={index} isDragDisabled={isViewer}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={snapshot.isDragging ? 'opacity-50 rotate-2' : ''}
                                        >
                                          <KanbanCard
                                            claim={claim}
                                            onClick={() => onOpenClaimDetail(claim.id)}
                                          />
                                        </div>
                                      )}
                                    </Draggable>
                                  </div>
                                );
                              })}
                              
                              {/* Mostrar preview al final si el destino es la última posición */}
                              {!loading && dragDestination 
                                && dragDestination.droppableId === status.name 
                                && dragDestination.index === (claimsByStatus[status.name] || []).length
                                && draggedClaimId && (
                                  <DropPreview />
                                )}
                              
                              {/* Botón para agregar nuevo reclamo - solo visible cuando no está cargando y no es viewer */}
                              {!loading && !isViewer && (
                                <button
                                  onClick={() => onCreateClaimWithStatus ? onCreateClaimWithStatus(status.name) : onOpenNewClaim()}
                                  className="w-full mt-2 p-3 rounded-lg border-2 border-dashed border-neutral-300 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 flex items-center justify-center gap-2 text-neutral-600 hover:text-blue-600 group"
                                >
                                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  <span className="text-sm font-medium">Agregar reclamo</span>
                                </button>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
