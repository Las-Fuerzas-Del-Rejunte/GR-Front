import { useMemo } from 'react';
import { Claim, ClaimType, ClaimArea, CLAIM_TYPE_LABELS, CLAIM_AREA_LABELS } from '../types/claim';

interface StatisticsFilters {
  customerId?: string;
  projectId?: string;
  area?: ClaimArea;
  status?: string;
  type?: ClaimType;
  dateFrom?: Date;
  dateTo?: Date;
}

interface MonthlyStats {
  month: string;
  total: number;
  resolved: number;
  inProgress: number;
}

interface TypeStats {
  type: ClaimType;
  count: number;
  averageResolutionTime: number; // en días
  percentage: number;
}

interface AreaStats {
  area: ClaimArea;
  count: number;
  percentage: number;
}

interface WorkloadStats {
  userId: string;
  userName: string;
  totalClaims: number;
  inProgress: number;
  resolved: number;
}

interface Statistics {
  totalClaims: number;
  totalResolved: number;
  totalInProgress: number;
  monthlyStats: MonthlyStats[];
  typeStats: TypeStats[];
  areaStats: AreaStats[];
  workloadStats: WorkloadStats[];
  averageResolutionTime: number;
  averageResolutionTimeByType: Record<ClaimType, number>;
  claimsByMonth: MonthlyStats[];
}

export const useStatistics = (claims: Claim[], filters?: StatisticsFilters): Statistics => {
  return useMemo(() => {
    // Aplicar filtros
    let filteredClaims = [...claims];

    if (filters) {
      if (filters.customerId) {
        filteredClaims = filteredClaims.filter(c => c.customerId === filters.customerId);
      }
      if (filters.projectId) {
        filteredClaims = filteredClaims.filter(c => c.projectId === filters.projectId);
      }
      if (filters.area) {
        filteredClaims = filteredClaims.filter(c => c.assignedToArea === filters.area);
      }
      if (filters.status) {
        filteredClaims = filteredClaims.filter(c => c.status === filters.status);
      }
      if (filters.type) {
        filteredClaims = filteredClaims.filter(c => c.type === filters.type);
      }
      if (filters.dateFrom) {
        filteredClaims = filteredClaims.filter(c => new Date(c.createdAt) >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        filteredClaims = filteredClaims.filter(c => new Date(c.createdAt) <= filters.dateTo!);
      }
    }

    const totalClaims = filteredClaims.length;
    const totalResolved = filteredClaims.filter(c => c.status === 'Resuelto' || c.closedAt).length;
    const totalInProgress = filteredClaims.filter(c => c.status !== 'Resuelto' && !c.closedAt).length;

    // Estadísticas mensuales
    const monthlyStatsMap = new Map<string, { total: number; resolved: number; inProgress: number }>();
    
    filteredClaims.forEach(claim => {
      const date = new Date(claim.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      
      if (!monthlyStatsMap.has(monthKey)) {
        monthlyStatsMap.set(monthKey, { total: 0, resolved: 0, inProgress: 0 });
      }
      
      const stats = monthlyStatsMap.get(monthKey)!;
      stats.total++;
      
      if (claim.status === 'Resuelto' || claim.closedAt) {
        stats.resolved++;
      } else {
        stats.inProgress++;
      }
    });

    const monthlyStats: MonthlyStats[] = Array.from(monthlyStatsMap.entries())
      .map(([key, stats]) => {
        const [year, month] = key.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return {
          month: date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
          ...stats
        };
      })
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    // Estadísticas por tipo
    const typeMap = new Map<ClaimType, { count: number; totalResolutionTime: number; resolvedCount: number }>();
    
    filteredClaims.forEach(claim => {
      if (!typeMap.has(claim.type)) {
        typeMap.set(claim.type, { count: 0, totalResolutionTime: 0, resolvedCount: 0 });
      }
      
      const stats = typeMap.get(claim.type)!;
      stats.count++;
      
      if (claim.closedAt && claim.createdAt) {
        const resolutionTime = (new Date(claim.closedAt).getTime() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        stats.totalResolutionTime += resolutionTime;
        stats.resolvedCount++;
      }
    });

    const typeStats: TypeStats[] = Array.from(typeMap.entries())
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        averageResolutionTime: stats.resolvedCount > 0 ? stats.totalResolutionTime / stats.resolvedCount : 0,
        percentage: totalClaims > 0 ? (stats.count / totalClaims) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Estadísticas por área
    const areaMap = new Map<ClaimArea | null, number>();
    
    filteredClaims.forEach(claim => {
      const area = claim.assignedToArea || null;
      areaMap.set(area, (areaMap.get(area) || 0) + 1);
    });

    const areaStats: AreaStats[] = Array.from(areaMap.entries())
      .filter(([area]) => area !== null)
      .map(([area, count]) => ({
        area: area as ClaimArea,
        count,
        percentage: totalClaims > 0 ? (count / totalClaims) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Carga de trabajo por responsable
    const workloadMap = new Map<string, { userName: string; totalClaims: number; inProgress: number; resolved: number }>();
    
    filteredClaims.forEach(claim => {
      const assignedUsers = claim.assignedTo || [];
      
      if (assignedUsers.length === 0) {
        const key = 'unassigned';
        if (!workloadMap.has(key)) {
          workloadMap.set(key, { userName: 'Sin asignar', totalClaims: 0, inProgress: 0, resolved: 0 });
        }
        const stats = workloadMap.get(key)!;
        stats.totalClaims++;
        if (claim.status === 'Resuelto' || claim.closedAt) {
          stats.resolved++;
        } else {
          stats.inProgress++;
        }
      } else {
        assignedUsers.forEach(user => {
          if (!workloadMap.has(user.id)) {
            workloadMap.set(user.id, { userName: user.name, totalClaims: 0, inProgress: 0, resolved: 0 });
          }
          const stats = workloadMap.get(user.id)!;
          stats.totalClaims++;
          if (claim.status === 'Resuelto' || claim.closedAt) {
            stats.resolved++;
          } else {
            stats.inProgress++;
          }
        });
      }
    });

    const workloadStats: WorkloadStats[] = Array.from(workloadMap.entries())
      .map(([userId, stats]) => ({
        userId,
        userName: stats.userName,
        totalClaims: stats.totalClaims,
        inProgress: stats.inProgress,
        resolved: stats.resolved
      }))
      .sort((a, b) => b.totalClaims - a.totalClaims);

    // Tiempo promedio de resolución
    const resolvedClaims = filteredClaims.filter(c => c.closedAt && c.createdAt);
    const totalResolutionTime = resolvedClaims.reduce((sum, claim) => {
      const resolutionTime = (new Date(claim.closedAt!).getTime() - new Date(claim.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return sum + resolutionTime;
    }, 0);
    const averageResolutionTime = resolvedClaims.length > 0 ? totalResolutionTime / resolvedClaims.length : 0;

    // Tiempo promedio por tipo
    const averageResolutionTimeByType: Record<ClaimType, number> = {} as Record<ClaimType, number>;
    typeStats.forEach(stat => {
      averageResolutionTimeByType[stat.type] = stat.averageResolutionTime;
    });

    // Reclamos por mes (últimos 12 meses)
    const last12Months: MonthlyStats[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
      
      const stats = monthlyStatsMap.get(monthKey) || { total: 0, resolved: 0, inProgress: 0 };
      last12Months.push({
        month: monthName,
        ...stats
      });
    }

    return {
      totalClaims,
      totalResolved,
      totalInProgress,
      monthlyStats,
      typeStats,
      areaStats,
      workloadStats,
      averageResolutionTime,
      averageResolutionTimeByType,
      claimsByMonth: last12Months
    };
  }, [claims, filters]);
};

export type { StatisticsFilters, MonthlyStats, TypeStats, AreaStats, WorkloadStats, Statistics };

