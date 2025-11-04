import { useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useCustomers } from '../context/CustomersContext';
import { useProjects } from '../context/ProjectsContext';
import { useStatuses } from '../context/StatusContext';
import { ClaimType, ClaimArea, CLAIM_TYPE_LABELS, CLAIM_AREA_LABELS } from '../types/claim';
import Button from './ui/Button';
import Card from './ui/Card';
import { Filter, X, Calendar, ChevronDown } from 'lucide-react';
import { StatisticsFilters } from '../hooks/useStatistics';

interface ReportsFiltersProps {
  onFiltersChange: (filters: StatisticsFilters) => void;
  currentFilters: StatisticsFilters;
}

export const ReportsFilters = ({ onFiltersChange, currentFilters }: ReportsFiltersProps) => {
  const { claims } = useClaims();
  const { customers } = useCustomers();
  const { projects } = useProjects();
  const { statuses } = useStatuses();
  
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<StatisticsFilters>(currentFilters);

  const handleFilterChange = (key: keyof StatisticsFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: StatisticsFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  // Obtener clientes únicos de los reclamos
  const uniqueCustomers = Array.from(new Set((claims || []).map(c => c.customerId)))
    .map(id => customers.find(c => c.id === id))
    .filter(Boolean);

  // Obtener proyectos únicos de los reclamos
  const uniqueProjects = Array.from(new Set((claims || []).map(c => c.projectId)))
    .map(id => projects.find(p => p.id === id))
    .filter(Boolean);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Reportes</h3>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Filtro por Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              value={localFilters.customerId || ''}
              onChange={(e) => handleFilterChange('customerId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los clientes</option>
              {uniqueCustomers.map(customer => (
                <option key={customer!.id} value={customer!.id}>
                  {customer!.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select
              value={localFilters.projectId || ''}
              onChange={(e) => handleFilterChange('projectId', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los proyectos</option>
              {uniqueProjects.map(project => (
                <option key={project!.id} value={project!.id}>
                  {project!.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Área</label>
            <select
              value={localFilters.area || ''}
              onChange={(e) => handleFilterChange('area', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas las áreas</option>
              {Object.entries(CLAIM_AREA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={localFilters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {statuses.map(status => (
                <option key={status.id} value={status.name}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reclamo</label>
            <select
              value={localFilters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
            <input
              type="date"
              value={localFilters.dateFrom ? new Date(localFilters.dateFrom).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtro por Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={localFilters.dateTo ? new Date(localFilters.dateTo).toISOString().split('T')[0] : ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Botón Aplicar */}
          <div className="flex items-end">
            <Button onClick={handleApplyFilters} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {currentFilters.customerId && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Cliente: {customers.find(c => c.id === currentFilters.customerId)?.name}
              </span>
            )}
            {currentFilters.projectId && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Proyecto: {projects.find(p => p.id === currentFilters.projectId)?.name}
              </span>
            )}
            {currentFilters.area && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Área: {CLAIM_AREA_LABELS[currentFilters.area]}
              </span>
            )}
            {currentFilters.status && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Estado: {currentFilters.status}
              </span>
            )}
            {currentFilters.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Tipo: {CLAIM_TYPE_LABELS[currentFilters.type]}
              </span>
            )}
            {currentFilters.dateFrom && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Desde: {new Date(currentFilters.dateFrom).toLocaleDateString('es-AR')}
              </span>
            )}
            {currentFilters.dateTo && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Hasta: {new Date(currentFilters.dateTo).toLocaleDateString('es-AR')}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ReportsFilters;

