'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { CircleDollarSign, TrendingUp, UserPlus, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AreaChartCardsProps {
  claimsData: any[];
  totalOpen: number;
  newToday: number;
  resolvedLastWeek: number;
  statuses: any[];
}

const AreaChartCards = ({ claimsData, totalOpen, newToday, resolvedLastWeek, statuses }: AreaChartCardsProps) => {
  // Calcular datos para los últimos 7 días
  const calculateLast7Days = () => {
    const data = [];
    const today = new Date();
    const resolvedStatus = statuses.find(s => s.name.toLowerCase().includes('resuel'));
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      // Reclamos abiertos al final del día (acumulativo)
      const openCount = claimsData.filter(c => {
        const claimDate = new Date(c.createdAt);
        return claimDate <= dayEnd && 
               (resolvedStatus ? c.status !== resolvedStatus.name : true);
      }).length;
      
      // Reclamos resueltos en ese día
      const resolvedInDay = claimsData.filter(c => {
        const updatedDate = new Date(c.updatedAt);
        return updatedDate >= date && updatedDate <= dayEnd && 
               (resolvedStatus ? c.status === resolvedStatus.name : false);
      }).length;
      
      // Nuevos reclamos en ese día
      const newInDay = claimsData.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate >= date && createdDate <= dayEnd;
      }).length;
      
      data.push({ date, openCount, resolvedInDay, newInDay });
    }
    
    return data;
  };

  const dailyData = calculateLast7Days();

  const businessCards = [
    {
      title: 'Reclamos Abiertos',
      period: 'Últimos 7 días',
      value: totalOpen.toString(),
      data: dailyData.map(d => ({ value: d.openCount })),
      color: 'var(--color-blue-500)',
      icon: AlertCircle,
      gradientId: 'openGradient',
    },
    {
      title: 'Nuevos Hoy',
      period: 'Últimos 7 días',
      value: newToday.toString(),
      data: dailyData.map(d => ({ value: d.newInDay })),
      color: 'var(--color-amber-500)',
      icon: TrendingUp,
      gradientId: 'newGradient',
    },
    {
      title: 'Resueltos (7 días)',
      period: 'Últimos 7 días',
      value: resolvedLastWeek.toString(),
      data: dailyData.map(d => ({ value: d.resolvedInDay })),
      color: 'var(--color-emerald-500)',
      icon: CheckCircle2,
      gradientId: 'resolvedGradient',
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {businessCards.map((card, i) => {
          const Icon = card.icon;

          return (
            <Card key={i}>
              <CardContent className="space-y-5">
                {/* Header with icon and title */}
                <div className="flex items-center gap-2">
                  <Icon className="size-5" style={{ color: card.color }} />
                  <span className="text-base font-semibold">{card.title}</span>
                </div>

                <div className="flex items-end gap-2.5 justify-between">
                  {/* Details */}
                  <div className="flex flex-col gap-1">
                    {/* Period */}
                    <div className="text-sm text-neutral-600 whitespace-nowrap">{card.period}</div>

                    {/* Value */}
                    <div className="text-3xl font-bold text-neutral-900 tracking-tight">{card.value}</div>
                  </div>

                  {/* Chart */}
                  <div className="max-w-40 h-16 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={card.data}
                        margin={{
                          top: 5,
                          right: 5,
                          left: 5,
                          bottom: 5,
                        }}
                      >
                        <defs>
                          <linearGradient id={card.gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={card.color} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={card.color} stopOpacity={0.05} />
                          </linearGradient>
                          <filter id={`dotShadow${i}`} x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.5)" />
                          </filter>
                        </defs>

                        <Tooltip
                          cursor={{ stroke: card.color, strokeWidth: 1, strokeDasharray: '2 2' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const value = payload[0].value as number;
                              return (
                                <div className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg p-2 pointer-events-none">
                                  <p className="text-sm font-semibold text-neutral-900">{value}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        {/* Area with gradient and enhanced shadow */}
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={card.color}
                          fill={`url(#${card.gradientId})`}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: card.color,
                            stroke: 'white',
                            strokeWidth: 2,
                            filter: `url(#dotShadow${i})`,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AreaChartCards;

