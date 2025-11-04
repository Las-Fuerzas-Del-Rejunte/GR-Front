import { useMemo, useState } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import { useStatistics, StatisticsFilters } from '../hooks/useStatistics';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ReportsFilters from '../components/ReportsFilters';
import { CustomBarChart } from '../components/charts/BarChart';
import { CustomPieChart } from '../components/charts/PieChart';
import { CustomLineChart } from '../components/charts/LineChart';
import { exportToCSV, exportStatisticsToCSV } from '../utils/exportUtils';
import { Info, Download, BarChart3, PieChart, TrendingUp, Users, Clock, FileText } from 'lucide-react';
import { CLAIM_TYPE_LABELS, CLAIM_AREA_LABELS } from '../types/claim';

const Statistics = () => {
  const { claims } = useClaims();
  const { statuses } = useStatuses();
  const [filters, setFilters] = useState<StatisticsFilters>({});
  
  const statistics = useStatistics(claims || [], filters);

  const filteredClaims = useMemo(() => {
    let filtered = [...(claims || [])];
    if (filters.customerId) filtered = filtered.filter(c => c.customerId === filters.customerId);
    if (filters.projectId) filtered = filtered.filter(c => c.projectId === filters.projectId);
    if (filters.area) filtered = filtered.filter(c => c.assignedToArea === filters.area);
    if (filters.status) filtered = filtered.filter(c => c.status === filters.status);
    if (filters.type) filtered = filtered.filter(c => c.type === filters.type);
    if (filters.dateFrom) filtered = filtered.filter(c => new Date(c.createdAt) >= filters.dateFrom!);
    if (filters.dateTo) filtered = filtered.filter(c => new Date(c.createdAt) <= filters.dateTo!);
    return filtered;
  }, [claims, filters]);

  const handleExportData = () => {
    exportToCSV(filteredClaims, `reporte-reclamos-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportStatistics = () => {
    if (!statistics) return;
    
    exportStatisticsToCSV({
      monthlyStats: statistics.monthlyStats || [],
      typeStats: (statistics.typeStats || []).map(s => ({
        type: CLAIM_TYPE_LABELS[s.type] || s.type,
        count: s.count,
        averageResolutionTime: s.averageResolutionTime,
        percentage: s.percentage
      })),
      areaStats: (statistics.areaStats || []).map(s => ({
        area: CLAIM_AREA_LABELS[s.area] || s.area,
        count: s.count,
        percentage: s.percentage
      })),
      workloadStats: statistics.workloadStats || []
    }, `estadisticas-reclamos-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Preparar datos para gráficos
  const typeChartData = (statistics?.typeStats || []).slice(0, 10).map(stat => ({
    name: CLAIM_TYPE_LABELS[stat.type] || stat.type,
    value: stat.count,
    color: '#3b82f6'
  }));

  const areaChartData = (statistics?.areaStats || []).slice(0, 10).map(stat => ({
    name: CLAIM_AREA_LABELS[stat.area] || stat.area,
    value: stat.count,
    color: '#10b981'
  }));

  const monthlyLineData = (statistics?.claimsByMonth || []).map(stat => ({
    name: stat.month,
    total: stat.total || 0,
    resolved: stat.resolved || 0,
    inProgress: stat.inProgress || 0
  }));

  const workloadChartData = (statistics?.workloadStats || []).slice(0, 10).map(stat => ({
    name: stat.userName,
    value: stat.totalClaims
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Estadísticas y Reportes</h1>
          <p className="text-sm text-neutral-600 mt-1">Análisis completo de reclamos y estadísticas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExportStatistics}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Estadísticas
          </Button>
          <Button variant="secondary" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ReportsFilters onFiltersChange={setFilters} currentFilters={filters} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Reclamos</p>
              <p className="text-3xl font-bold text-gray-900">{statistics?.totalClaims || 0}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Resueltos</p>
              <p className="text-3xl font-bold text-green-600">{statistics?.totalResolved || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En Progreso</p>
              <p className="text-3xl font-bold text-amber-600">{statistics?.totalInProgress || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tiempo Promedio</p>
              <p className="text-3xl font-bold text-purple-600">
                {(statistics?.averageResolutionTime || 0).toFixed(1)} días
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de líneas - Reclamos por mes */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-neutral-900">Reclamos por Mes</h2>
            </div>
            <InfoTip title="Evolución de reclamos recibidos, resueltos y en progreso por mes." />
          </div>
          <CustomLineChart
            data={monthlyLineData}
            dataKeys={[
              { key: 'total', color: '#3b82f6', name: 'Total' },
              { key: 'resolved', color: '#10b981', name: 'Resueltos' },
              { key: 'inProgress', color: '#f59e0b', name: 'En Progreso' }
            ]}
            height={300}
          />
        </Card>

        {/* Gráfico de torta - Tipos de reclamos más comunes */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-neutral-900">Tipos de Reclamos</h2>
            </div>
            <InfoTip title="Distribución de reclamos según su tipo." />
          </div>
          <CustomPieChart data={typeChartData} height={300} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Tipos más comunes */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-neutral-900">Tipos Más Comunes</h2>
            </div>
            <InfoTip title="Cantidad de reclamos por tipo de reclamo." />
          </div>
          <CustomBarChart data={typeChartData} color="#3b82f6" height={300} />
        </Card>

        {/* Gráfico de barras - Áreas */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-neutral-900">Carga por Área</h2>
            </div>
            <InfoTip title="Distribución de reclamos asignados por área." />
          </div>
          <CustomBarChart data={areaChartData} color="#10b981" height={300} />
        </Card>
      </div>

      {/* Carga de trabajo por responsable */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-neutral-900">Carga de Trabajo por Responsable</h2>
          </div>
          <InfoTip title="Distribución de reclamos asignados por responsable." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {(statistics?.workloadStats || []).slice(0, 9).map(stat => (
            <div key={stat.userId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">{stat.userName}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">{stat.totalClaims}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">En Progreso:</span>
                  <span className="font-medium text-amber-600">{stat.inProgress}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Resueltos:</span>
                  <span className="font-medium text-green-600">{stat.resolved}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {(statistics?.workloadStats || []).length > 0 && (
          <CustomBarChart data={workloadChartData} color="#8b5cf6" height={250} />
        )}
      </Card>

      {/* Tiempo promedio por tipo */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-neutral-900">Tiempo Promedio de Resolución por Tipo</h2>
          </div>
          <InfoTip title="Tiempo promedio en días para resolver reclamos según su tipo." />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(statistics?.typeStats || []).map(stat => (
            <div key={stat.type} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                {CLAIM_TYPE_LABELS[stat.type]}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-medium text-gray-900">{stat.count}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Tiempo Promedio:</span>
                  <span className="font-medium text-purple-600">
                    {stat.averageResolutionTime.toFixed(1)} días
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Porcentaje:</span>
                  <span className="font-medium text-blue-600">{stat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// --- Componente auxiliar InfoTip ---
function InfoTip({ title }: { title: string }) {
  return (
    <span className="relative inline-flex items-center group">
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200 group-hover:bg-neutral-200 transition-colors">
        <Info className="w-3.5 h-3.5" />
      </span>
      <div className="pointer-events-none absolute right-0 top-full mt-2 w-64 p-3 rounded-lg border border-neutral-200 shadow-lg bg-white/90 backdrop-blur-md opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-10">
        <p className="text-xs leading-relaxed text-neutral-700">{title}</p>
      </div>
    </span>
  );
}

export default Statistics;

