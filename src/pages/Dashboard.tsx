import { useMemo, useState, useEffect } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AreaChartCards from '../components/AreaChartCards';
import { Info } from 'lucide-react';
import { Claim } from '../types/claim';

const Dashboard = () => {
  const { claims } = useClaims();
  const { statuses } = useStatuses();

  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const resolvedStatus = statuses.find(s => s.name.toLowerCase().includes('resuel'));
    const totalOpen = resolvedStatus
      ? claims.filter(c => c.status !== resolvedStatus.name).length
      : claims.length;

    const newToday = claims.filter(c => {
      const claimDate = new Date(c.createdAt);
      claimDate.setHours(0, 0, 0, 0);
      return claimDate.getTime() === today.getTime();
    }).length;

    const resolvedLastWeek = resolvedStatus
      ? claims.filter(c =>
          c.status === resolvedStatus.name && new Date(c.updatedAt) >= sevenDaysAgo
        ).length
      : 0;

    return { totalOpen, newToday, resolvedLastWeek };
  }, [claims, statuses]);

  const statusDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};

    statuses.forEach(status => {
      distribution[status.name] = 0;
    });

    claims.forEach(claim => {
      if (distribution[claim.status] !== undefined) {
        distribution[claim.status]++;
      }
    });

    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      color: statuses.find(s => s.name === status)?.color || 'gray'
    }));
  }, [claims, statuses]);

  const recentClaims = useMemo(() => {
    return [...claims]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  }, [claims]);

  const maxCount = Math.max(...statusDistribution.map(s => s.count), 1);

  const getBarColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-primary-500',
      amber: 'bg-amber-500',
      orange: 'bg-orange-500',
      green: 'bg-emerald-500',
      red: 'bg-accent-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500',
      gray: 'bg-neutral-500'
    };
    return colorMap[color] || 'bg-neutral-500';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-600 mt-1">Resumen general del sistema</p>
      </div>

      {/* KPI Cards con gráficos */}
      <AreaChartCards 
        claimsData={claims} 
        totalOpen={kpis.totalOpen}
        newToday={kpis.newToday}
        resolvedLastWeek={kpis.resolvedLastWeek}
        statuses={statuses}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="p-6 lg:col-span-9">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Distribución por Estado</h2>
            <InfoTip title="Cantidad de reclamos por estado actual, relativo al máximo del periodo." />
          </div>
          <AnimatedStatusBars items={statusDistribution} maxCount={maxCount} getBarColor={getBarColor} />
        </Card>

        <Card className="p-6 lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Actualizaciones Recientes</h2>
            <InfoTip title="Últimos reclamos actualizados, ordenados por fecha de modificación." />
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto nice-scroll">
            {recentClaims.map((claim, index) => (
              <RecentClaimCard key={claim.id} claim={claim} index={index} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

// --- Barras animadas de distribución de estados ---
function AnimatedStatusBars({
  items,
  maxCount,
  getBarColor,
}: {
  items: { status: string; count: number; color: string }[];
  maxCount: number;
  getBarColor: (c: string) => string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-4">
      {items.map(({ status, count, color }, index) => {
        const percentage = (count / maxCount) * 100;
        return (
          <div
            key={status}
            className={`transition-all duration-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">{status}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                {count}
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`${getBarColor(color)} h-3 rounded-full shadow-sm transition-all duration-700 ease-out`}
                style={{ width: mounted ? `${percentage}%` : '0%' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Componente auxiliar para tarjetas de actualizaciones recientes ---

function RecentClaimCard({ claim, index }: { claim: Claim; index: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación escalonada: cada elemento aparece 100ms después del anterior
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return new Date(date).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <div
      className={`flex items-center justify-between p-4 bg-gradient-to-br from-white via-neutral-50/50 to-white rounded-xl hover:from-blue-50/30 hover:via-neutral-50/70 hover:to-blue-50/30 transition-all duration-300 border border-neutral-200 shadow-sm hover:shadow-md cursor-pointer transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-4 scale-95'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-xs font-mono text-neutral-500 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 px-2 py-0.5 rounded animate-pulse">
            {claim.id}
          </span>
          <Badge status={claim.status} />
        </div>
        <p className="text-sm font-medium text-neutral-900 truncate">{claim.customerName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <p className="text-xs text-neutral-500">{claim.subject}</p>
          <span className="text-xs text-blue-600 font-medium animate-pulse">
            • {formatRelativeTime(claim.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

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
