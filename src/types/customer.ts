// Tipos para MongoDB - Clientes y Proyectos

export interface Customer {
  _id?: string; // MongoDB ObjectId
  id: string; // ID legible para frontend
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  projects: string[]; // IDs de proyectos asociados
}

export type ProjectType = 
  | 'software_development'
  | 'marketing_campaign'
  | 'consulting'
  | 'support'
  | 'maintenance'
  | 'other';

export interface Project {
  _id?: string; // MongoDB ObjectId
  id: string; // ID legible para frontend
  customerId: string; // Referencia al cliente
  name: string;
  description?: string;
  type: ProjectType;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  software_development: 'Desarrollo de Software',
  marketing_campaign: 'Campaña de Marketing',
  consulting: 'Consultoría',
  support: 'Soporte',
  maintenance: 'Mantenimiento',
  other: 'Otro'
};

