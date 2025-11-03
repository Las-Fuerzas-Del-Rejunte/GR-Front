export type ClaimStatus = string;

// Sub-estados que proporcionan granularidad dentro de un estado principal
export interface SubStatus {
  id: string;
  name: string;
  description?: string;
  order: number;
}

// Permisos y reglas para cada estado
export interface StatusPermissions {
  canEdit: boolean;              // Puede editar el reclamo
  canReassign: boolean;          // Puede reasignar
  canAddNote: boolean;           // Puede agregar notas
  canChangeStatus: boolean;      // Puede cambiar de estado
  canAddInternalComment: boolean; // Puede agregar comentarios internos
  canClose: boolean;             // Puede cerrar el reclamo
  requiresResolutionSummary: boolean; // Requiere resumen de resolución
  isLocked: boolean;             // Estado bloqueado (no modificable)
}

// Transición válida entre estados
export interface StatusTransition {
  from: string;                  // Estado origen
  to: string;                    // Estado destino
  requiredRole?: string[];       // Roles que pueden hacer esta transición
  requiresConfirmation?: boolean; // Requiere confirmación del usuario
  message?: string;              // Mensaje al hacer la transición
}

export interface StatusConfig {
  id: string;
  name: string;
  color: string;
  order: number;
  description?: string;
  subStatuses?: SubStatus[];     // Sub-estados dentro de este estado
  permissions: StatusPermissions; // Permisos específicos del estado
  area?: string;                 // Área responsable (Ventas, Soporte, etc.)
}

export type AuditEventType = 
  | 'created'
  | 'status_changed'
  | 'substatus_changed'
  | 'assigned'
  | 'unassigned'
  | 'reassigned'
  | 'priority_changed'
  | 'note_added'
  | 'updated'
  | 'locked'
  | 'unlocked'
  | 'resolution_added';

export interface AuditEvent {
  id: string;
  claimId: string;
  type: AuditEventType;
  timestamp: Date;
  user: string;
  userId?: string;
  details: {
    previousValue?: any;
    newValue?: any;
    description?: string;
    area?: string;
  };
}

export interface Claim {
  id: string;
  subject: string;
  customerName: string;
  contactInfo: string;
  description: string;
  status: ClaimStatus;
  subStatus?: string;            // Sub-estado actual dentro del estado principal
  assignedTo?: User[] | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  notes: ClaimNote[];
  auditHistory: AuditEvent[];
  resolutionSummary?: string;    // Resumen de resolución (requerido en estado "Resuelto")
  isLocked?: boolean;            // Indica si el reclamo está bloqueado para edición
}

export interface ClaimNote {
  id: string;
  claimId: string;
  content: string;
  author: string;
  createdAt: Date;
}

export interface KPIData {
  totalOpen: number;
  newToday: number;
  resolvedLastWeek: number;
}

export interface StatusDistribution {
  status: ClaimStatus;
  count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  department?: string;
  position?: string;
}
