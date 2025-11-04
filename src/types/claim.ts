export type ClaimStatus = string;

export interface StatusConfig {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Tipos para MongoDB - Claims
export type ClaimType = 
  | 'technical_issue'
  | 'billing'
  | 'delivery'
  | 'product_quality'
  | 'service_complaint'
  | 'feature_request'
  | 'other';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ClaimArea = 
  | 'soporte_tecnico'
  | 'ventas'
  | 'facturacion'
  | 'logistica'
  | 'desarrollo'
  | 'atencion_cliente'
  | 'otro';

export interface ClaimAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string; // URL del archivo en el servidor
  uploadedAt: Date;
}

export interface Claim {
  _id?: string; // MongoDB ObjectId
  id: string;
  projectId: string; // Referencia al proyecto
  customerId: string; // Referencia al cliente (para acceso rápido)
  subject: string;
  customerName: string; // Mantener para compatibilidad y búsqueda rápida
  contactInfo: string;
  description: string;
  type: ClaimType; // Tipo de reclamo
  status: ClaimStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  severity: Severity; // Nivel de criticidad
  assignedTo?: User[] | null;
  assignedToArea?: ClaimArea | null; // Área/departamento asignado
  assignedAreasHistory?: ClaimArea[]; // Historial de reasignaciones por área
  attachments?: ClaimAttachment[];
  history?: ClaimHistoryEntry[]; // Historial completo de trazabilidad
  feedback?: ClaimFeedback; // Retroalimentación del cliente
  resolution?: ClaimResolution; // Resumen de resolución si está cerrado
  closedAt?: Date; // Fecha de cierre
  createdAt: Date;
  updatedAt: Date;
  notes: ClaimNote[];
}

export const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  technical_issue: 'Problema Técnico',
  billing: 'Facturación',
  delivery: 'Entrega',
  product_quality: 'Calidad de Producto',
  service_complaint: 'Queja de Servicio',
  feature_request: 'Solicitud de Funcionalidad',
  other: 'Otro'
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica'
};

export const CLAIM_AREA_LABELS: Record<ClaimArea, string> = {
  soporte_tecnico: 'Soporte Técnico',
  ventas: 'Ventas',
  facturacion: 'Facturación',
  logistica: 'Logística',
  desarrollo: 'Desarrollo',
  atencion_cliente: 'Atención al Cliente',
  otro: 'Otro'
};

export interface ClaimNote {
  id: string;
  claimId: string;
  content: string;
  author: string;
  authorId?: string; // ID del usuario que creó la nota
  isInternal?: boolean; // Si es true, es un comentario interno (no visible para el cliente)
  createdAt: Date;
  updatedAt?: Date;
}

export type ClaimHistoryAction = 
  | 'created'
  | 'status_changed'
  | 'assigned_to_area'
  | 'assigned_to_user'
  | 'priority_changed'
  | 'severity_changed'
  | 'type_changed'
  | 'note_added'
  | 'attachment_added'
  | 'closed'
  | 'reopened';

export interface ClaimHistoryEntry {
  id: string;
  claimId: string;
  action: ClaimHistoryAction;
  userId?: string; // ID del usuario que realizó la acción
  userName?: string; // Nombre del usuario (para mostrar rápidamente)
  previousValue?: string; // Valor anterior (área, estado, etc.)
  newValue?: string; // Valor nuevo
  description?: string; // Descripción de la acción realizada
  metadata?: Record<string, any>; // Datos adicionales (áreas, usuarios, etc.)
  createdAt: Date;
}

export interface ClaimFeedback {
  id: string;
  claimId: string;
  rating: number; // 1-5 estrellas
  comment?: string;
  submittedBy: string; // Nombre del cliente
  submittedAt: Date;
}

export interface ClaimResolution {
  summary: string; // Resumen de cómo se resolvió
  resolvedBy: string; // Nombre del usuario que cerró el reclamo
  resolvedById?: string; // ID del usuario
  resolvedAt: Date;
  resolutionNotes?: string; // Notas adicionales sobre la resolución
}

export interface ClaimNotification {
  id: string;
  claimId: string;
  userId: string; // Usuario que recibirá la notificación
  type: 'assignment' | 'area_change' | 'status_change' | 'new_note' | 'closing';
  message: string;
  read: boolean;
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
