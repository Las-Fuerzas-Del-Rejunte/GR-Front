import { StatusConfig, StatusTransition, SubStatus } from '../types/claim';

// Definición de sub-estados para cada estado principal
const subStatusesNuevo: SubStatus[] = [
  { id: 'pendiente-asignacion', name: 'Pendiente de Asignación', order: 1 },
  { id: 'en-revision', name: 'En Revisión Inicial', order: 2 }
];

const subStatusesEnProceso: SubStatus[] = [
  { id: 'iniciado', name: 'Iniciado', order: 1 },
  { id: 'esperando-cliente', name: 'Esperando Material del Cliente', order: 2 },
  { id: 'en-desarrollo', name: 'Solución en Desarrollo', order: 3 },
  { id: 'pendiente-qa', name: 'Pendiente de QA', order: 4 },
  { id: 'esperando-aprobacion', name: 'Esperando Aprobación', order: 5 }
];

const subStatusesEsperando: SubStatus[] = [
  { id: 'esperando-info-cliente', name: 'Esperando Información del Cliente', order: 1 },
  { id: 'esperando-area-externa', name: 'Esperando Área Externa', order: 2 },
  { id: 'esperando-proveedor', name: 'Esperando Proveedor', order: 3 }
];

const subStatusesResuelto: SubStatus[] = [
  { id: 'solucionado', name: 'Solucionado', order: 1 },
  { id: 'cerrado-satisfactorio', name: 'Cerrado Satisfactoriamente', order: 2 },
  { id: 'no-procede', name: 'No Procede', order: 3 }
];

// Configuración de estados con sus permisos y reglas
export const statesMachineConfig: StatusConfig[] = [
  {
    id: 'nuevo',
    name: 'Nuevo',
    color: 'blue',
    order: 1,
    description: 'Reclamo recién creado, pendiente de asignación o revisión inicial',
    area: 'Recepción',
    subStatuses: subStatusesNuevo,
    permissions: {
      canEdit: true,
      canReassign: true,
      canAddNote: true,
      canChangeStatus: true,
      canAddInternalComment: true,
      canClose: false,
      requiresResolutionSummary: false,
      isLocked: false
    }
  },
  {
    id: 'en-proceso',
    name: 'En Proceso',
    color: 'amber',
    order: 2,
    description: 'Reclamo en proceso de resolución, con trabajo activo',
    area: 'Soporte Técnico / Atención al Cliente',
    subStatuses: subStatusesEnProceso,
    permissions: {
      canEdit: true,
      canReassign: true,              // Permite reasignar a otra área
      canAddNote: true,
      canChangeStatus: true,
      canAddInternalComment: true,    // Habilitado para coordinación interna
      canClose: false,
      requiresResolutionSummary: false,
      isLocked: false
    }
  },
  {
    id: 'esperando',
    name: 'Esperando Respuesta',
    color: 'orange',
    order: 3,
    description: 'Reclamo en espera de información externa o del cliente',
    area: 'En Espera',
    subStatuses: subStatusesEsperando,
    permissions: {
      canEdit: true,
      canReassign: true,
      canAddNote: true,
      canChangeStatus: true,
      canAddInternalComment: true,
      canClose: false,
      requiresResolutionSummary: false,
      isLocked: false
    }
  },
  {
    id: 'resuelto',
    name: 'Resuelto',
    color: 'green',
    order: 4,
    description: 'Reclamo resuelto y cerrado. Información bloqueada para auditoría',
    area: 'Cerrado',
    subStatuses: subStatusesResuelto,
    permissions: {
      canEdit: false,                 // Bloqueado para preservar auditoría
      canReassign: false,
      canAddNote: true,               // Solo lectura de notas
      canChangeStatus: false,         // No se puede cambiar de estado
      canAddInternalComment: false,
      canClose: true,
      requiresResolutionSummary: true, // Requiere resumen de resolución
      isLocked: true                  // Estado bloqueado
    }
  }
];

// Definición de transiciones válidas entre estados
export const statusTransitions: StatusTransition[] = [
  // Desde Nuevo
  {
    from: 'nuevo',
    to: 'en-proceso',
    requiredRole: ['agent', 'manager', 'admin'],
    message: 'El reclamo comenzará a ser procesado'
  },
  {
    from: 'nuevo',
    to: 'esperando',
    requiredRole: ['agent', 'manager', 'admin'],
    message: 'El reclamo quedará en espera de información'
  },
  
  // Desde En Proceso
  {
    from: 'en-proceso',
    to: 'esperando',
    requiredRole: ['agent', 'manager', 'admin'],
    message: 'El reclamo quedará en espera'
  },
  {
    from: 'en-proceso',
    to: 'resuelto',
    requiredRole: ['agent', 'manager', 'admin'],
    requiresConfirmation: true,
    message: '⚠️ Al marcar como resuelto, el reclamo se bloqueará y no podrá ser editado. Se requiere un resumen de resolución.'
  },
  
  // Desde Esperando
  {
    from: 'esperando',
    to: 'en-proceso',
    requiredRole: ['agent', 'manager', 'admin'],
    message: 'El reclamo volverá a proceso activo'
  },
  {
    from: 'esperando',
    to: 'resuelto',
    requiredRole: ['agent', 'manager', 'admin'],
    requiresConfirmation: true,
    message: '⚠️ Al marcar como resuelto, el reclamo se bloqueará y no podrá ser editado. Se requiere un resumen de resolución.'
  },
  
  // No hay transiciones desde Resuelto (estado final)
];

// Función para obtener la configuración de un estado
export const getStatusConfig = (statusId: string): StatusConfig | undefined => {
  return statesMachineConfig.find(s => s.id === statusId || s.name === statusId);
};

// Función para verificar si una transición es válida
export const isValidTransition = (from: string, to: string, userRole?: string): boolean => {
  const transition = statusTransitions.find(t => 
    (t.from === from || getStatusConfig(from)?.id === t.from) && 
    (t.to === to || getStatusConfig(to)?.id === t.to)
  );
  
  if (!transition) return false;
  
  if (transition.requiredRole && userRole) {
    return transition.requiredRole.includes(userRole);
  }
  
  return true;
};

// Función para obtener transiciones disponibles desde un estado
export const getAvailableTransitions = (currentStatus: string, userRole?: string): StatusTransition[] => {
  const currentConfig = getStatusConfig(currentStatus);
  if (!currentConfig) return [];
  
  return statusTransitions.filter(t => {
    const isFromCurrent = t.from === currentConfig.id;
    const hasRole = !t.requiredRole || !userRole || t.requiredRole.includes(userRole);
    return isFromCurrent && hasRole;
  });
};

// Función para obtener sub-estados de un estado
export const getSubStatuses = (statusId: string): SubStatus[] => {
  const config = getStatusConfig(statusId);
  return config?.subStatuses || [];
};

// Función para verificar permisos en un estado
export const canPerformAction = (
  statusId: string, 
  action: keyof StatusConfig['permissions']
): boolean => {
  const config = getStatusConfig(statusId);
  return config?.permissions[action] ?? false;
};
