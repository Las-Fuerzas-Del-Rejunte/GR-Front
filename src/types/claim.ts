export type ClaimStatus = string;

export interface StatusConfig {
  id: string;
  name: string;
  color: string;
  order: number;
}

export type AuditEventType = 
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'reassigned'
  | 'priority_changed'
  | 'note_added'
  | 'updated';

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
  assignedTo?: User[] | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
  notes: ClaimNote[];
  auditHistory: AuditEvent[];
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
