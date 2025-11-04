import { Claim } from '../types/claim';
import { CLAIM_TYPE_LABELS, CLAIM_AREA_LABELS, SEVERITY_LABELS } from '../types/claim';

// Exportar a CSV
export const exportToCSV = (claims: Claim[], filename: string = 'reporte-reclamos.csv') => {
  const headers = [
    'ID',
    'Asunto',
    'Cliente',
    'Contacto',
    'Tipo',
    'Estado',
    'Prioridad',
    'Severidad',
    'Área',
    'Asignado a',
    'Fecha Creación',
    'Fecha Actualización',
    'Fecha Cierre',
    'Proyecto',
    'Descripción'
  ];

  const rows = claims.map(claim => [
    claim.id,
    claim.subject,
    claim.customerName,
    claim.contactInfo,
    CLAIM_TYPE_LABELS[claim.type] || claim.type,
    claim.status,
    claim.priority,
    SEVERITY_LABELS[claim.severity] || claim.severity,
    claim.assignedToArea ? CLAIM_AREA_LABELS[claim.assignedToArea] : 'Sin asignar',
    claim.assignedTo?.map(u => u.name).join(', ') || 'Sin asignar',
    new Date(claim.createdAt).toLocaleDateString('es-AR'),
    new Date(claim.updatedAt).toLocaleDateString('es-AR'),
    claim.closedAt ? new Date(claim.closedAt).toLocaleDateString('es-AR') : '',
    claim.projectId || '',
    claim.description.replace(/"/g, '""') // Escapar comillas para CSV
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Agregar BOM para UTF-8 en Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar a Excel (formato XLSX simple usando CSV con extensión .xlsx)
export const exportToExcel = (claims: Claim[], filename: string = 'reporte-reclamos.xlsx') => {
  // Por ahora usamos CSV con extensión .xlsx, en producción se podría usar una librería como xlsx
  exportToCSV(claims, filename.replace('.xlsx', '.csv'));
};

// Exportar estadísticas a CSV
export const exportStatisticsToCSV = (
  statistics: {
    monthlyStats: { month: string; total: number; resolved: number; inProgress: number }[];
    typeStats: { type: string; count: number; averageResolutionTime: number; percentage: number }[];
    areaStats: { area: string; count: number; percentage: number }[];
    workloadStats: { userName: string; totalClaims: number; inProgress: number; resolved: number }[];
  },
  filename: string = 'estadisticas-reclamos.csv'
) => {
  const csvContent: string[] = [];

  // Estadísticas mensuales
  csvContent.push('ESTADÍSTICAS MENSUALES');
  csvContent.push('Mes,Total,Resueltos,En Progreso');
  statistics.monthlyStats.forEach(stat => {
    csvContent.push(`"${stat.month}",${stat.total},${stat.resolved},${stat.inProgress}`);
  });

  csvContent.push('');
  csvContent.push('ESTADÍSTICAS POR TIPO');
  csvContent.push('Tipo,Cantidad,Tiempo Promedio (días),Porcentaje');
  statistics.typeStats.forEach(stat => {
    csvContent.push(`"${stat.type}",${stat.count},${stat.averageResolutionTime.toFixed(2)},${stat.percentage.toFixed(2)}%`);
  });

  csvContent.push('');
  csvContent.push('ESTADÍSTICAS POR ÁREA');
  csvContent.push('Área,Cantidad,Porcentaje');
  statistics.areaStats.forEach(stat => {
    csvContent.push(`"${stat.area}",${stat.count},${stat.percentage.toFixed(2)}%`);
  });

  csvContent.push('');
  csvContent.push('CARGA DE TRABAJO POR RESPONSABLE');
  csvContent.push('Responsable,Total,En Progreso,Resueltos');
  statistics.workloadStats.forEach(stat => {
    csvContent.push(`"${stat.userName}",${stat.totalClaims},${stat.inProgress},${stat.resolved}`);
  });

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

