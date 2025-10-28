import { useMemo } from 'react';
import { useClaims } from '../context/ClaimsContext';
import { useStatuses } from '../context/StatusContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

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
      .slice(0, 5);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-50 to-white border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Reclamos Abiertos</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{kpis.totalOpen}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Nuevos Hoy</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{kpis.newToday}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Resueltos (7 días)</p>
              <p className="text-4xl font-bold text-neutral-900 mt-2">{kpis.resolvedLastWeek}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Distribución por Estado</h2>
          <div className="space-y-4">
            {statusDistribution.map(({ status, count, color }) => {
              const percentage = (count / maxCount) * 100;

              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-700">{status}</span>
                    <span className="text-sm font-bold text-neutral-900">{count}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${getBarColor(color)} h-3 rounded-full transition-all duration-700 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-6">Actualizaciones Recientes</h2>
          <div className="space-y-3">
            {recentClaims.map(claim => (
              <div
                key={claim.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors border border-neutral-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-xs font-mono text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">{claim.id}</span>
                    <Badge status={claim.status} />
                  </div>
                  <p className="text-sm font-medium text-neutral-900 truncate">{claim.customerName}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{claim.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
