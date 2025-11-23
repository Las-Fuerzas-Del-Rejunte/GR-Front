import axios, { AxiosError } from 'axios';
import { Claim, ClaimStatus, User, StatusConfig, AuditEvent } from '../types/claim';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES - Basados en el Swagger
// ============================================================================

interface UsuarioBackend {
  id?: string;           // PostgreSQL usa 'id'
  _id?: string;          // MongoDB usa '_id'
  email: string;
  nombre: string;
  rol: string;
  telefono?: string;
  departamento?: string;
  posicion?: string;
  creado_en: string;
  actualizado_en: string;
}

interface RespuestaPaginada<T> {
  datos: T[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    total_paginas: number;
  };
}

// ============================================================================
// MAPPERS - Convertir datos del backend (español) al frontend (inglés)
// ============================================================================

const mapUsuarioToUser = (usuario: UsuarioBackend): User => {
  // El backend MongoDB devuelve _id, pero mantenemos compatibilidad con id
  const userId = usuario.id || usuario._id;
  
  return {
    id: userId || '',
    email: usuario.email,
    name: usuario.nombre,
    role: usuario.rol,
    phone: usuario.telefono,
    department: usuario.departamento,
    position: usuario.posicion,
  };
};

interface StatusConfigBackend {
  id: string;
  nombre: string;
  color: string;
  posicion_orden: number;
  creado_en: string;
  actualizado_en: string;
}

const mapStatusConfigToFrontend = (config: StatusConfigBackend): StatusConfig => ({
  id: config.id,
  name: config.nombre,
  color: config.color,
  order: config.posicion_orden,
  permissions: {
    canEdit: true,
    canReassign: true,
    canAddNote: true,
    canChangeStatus: true,
    canAddInternalComment: true,
    canClose: false,
    requiresResolutionSummary: false,
    isLocked: false,
  },
  subStatuses: [],
});

interface ClaimBackend {
  id: string;
  asunto: string;
  nombre_cliente: string;
  info_contacto: string;
  descripcion: string;
  estado_id: string;
  estado_config?: {
    id: string;
    nombre: string;
    color: string;
    posicion_orden: number;
  };
  prioridad?: string;
  asignado_a?: string; // UUID del usuario asignado (se mantiene para compatibilidad)
  agente_asignado?: UsuarioBackend; // ✅ Objeto completo del usuario (NUEVO desde Backend v2.1.0)
  sub_estado_id?: string | null; // ✅ Cambio: sub_estado → sub_estado_id
  sub_estado_config?: {
    id: string;
    nombre: string;
    orden: number;
  };
  resumen_resolucion?: string;
  bloqueado?: boolean;
  proyecto_id?: string;
  cliente_id?: string;
  creado_en: string;
  actualizado_en: string;
}

const mapClaimToFrontend = (claim: ClaimBackend): Claim => {
  
  // Mapear assignedTo - Backend ahora devuelve objeto completo en agente_asignado
  let assignedTo: User[] | null = null;
  if (claim.agente_asignado) {
    assignedTo = [mapUsuarioToUser(claim.agente_asignado as UsuarioBackend)];
  } else if (claim.asignado_a) {
    // Fallback temporal por si el backend aún no está actualizado
    assignedTo = [{ 
      id: claim.asignado_a,
      email: '',
      name: 'Cargando...',
      role: 'agent'
    }];
  }
  
  return {
    id: claim.id,
    subject: claim.asunto,
    customerName: claim.nombre_cliente,
    contactInfo: claim.info_contacto,
    description: claim.descripcion,
    status: claim.estado_id,
    statusName: claim.estado_config?.nombre,
    statusColor: claim.estado_config?.color,
    priority: claim.prioridad as 'low' | 'medium' | 'high' | 'urgent' | undefined,
    assignedTo,
    subStatus: claim.sub_estado_id ?? undefined, // ✅ Convertir null → undefined
    resolutionSummary: claim.resumen_resolucion,
    isLocked: claim.bloqueado || false,
    projectId: claim.proyecto_id,
    clientId: claim.cliente_id,
    createdAt: new Date(claim.creado_en),
    updatedAt: new Date(claim.actualizado_en),
    notes: [],
    auditHistory: [],
  };
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  login: async (email: string, password: string): Promise<{ token: string; refresh_token: string; usuario: User }> => {
    const response = await api.post('/api/v1/autenticacion/login', { 
      email, 
      contrasena: password 
    });
    const usuario = mapUsuarioToUser(response.data.usuario);
    localStorage.setItem('access_token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('current_user', JSON.stringify(usuario));
    return {
      token: response.data.token,
      refresh_token: response.data.refresh_token,
      usuario,
    };
  },

  logout: async () => {
    try {
      await api.post('/api/v1/autenticacion/logout');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string; refresh_token: string; usuario: User }> => {
    const response = await api.post('/api/v1/autenticacion/refresh', {
      refresh_token: refreshToken
    });
    const usuario = mapUsuarioToUser(response.data.usuario);
    localStorage.setItem('access_token', response.data.token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return {
      token: response.data.token,
      refresh_token: response.data.refresh_token,
      usuario,
    };
  },

  forgotPassword: async (email: string): Promise<{ mensaje: string }> => {
    const response = await api.post('/api/v1/autenticacion/olvide-contrasena', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ mensaje: string }> => {
    const response = await api.post('/api/v1/autenticacion/restablecer-contrasena', {
      token,
      contrasena_nueva: newPassword
    });
    return response.data;
  },

  getCurrentUser: async (): Promise<{ token: string; refresh_token: string; usuario: User }> => {
    const response = await api.get('/api/v1/autenticacion/yo');
    const usuario = mapUsuarioToUser(response.data.usuario);
    localStorage.setItem('current_user', JSON.stringify(usuario));
    return {
      token: response.data.token,
      refresh_token: response.data.refresh_token,
      usuario,
    };
  },
};

// ============================================================================
// USERS API
// ============================================================================

interface UsersFilters {
  rol?: 'admin' | 'manager' | 'agent' | 'viewer';
  pagina?: number;
  limite?: number;
}

export const usersAPI = {
  getAll: async (filters?: UsersFilters): Promise<RespuestaPaginada<User>> => {
    const response = await api.get('/api/v1/usuarios', { params: filters });
    
    return {
      datos: response.data.datos.map((usuario: UsuarioBackend) => mapUsuarioToUser(usuario)),
      paginacion: response.data.paginacion
    };
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/api/v1/usuarios/${id}`);
    return response.data;
  },

  create: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const payload = {
      email: userData.email,
      nombre: userData.name,
      rol: userData.role,
      telefono: userData.phone,
      departamento: userData.department,
      posicion: userData.position,
      contrasena: userData.password,
    };
    const response = await api.post('/api/v1/usuarios', payload);
    return response.data;
  },

  update: async (id: string, updates: Partial<User>): Promise<User> => {
    const payload: Record<string, unknown> = {};
    if (updates.name) payload.nombre = updates.name;
    if (updates.phone) payload.telefono = updates.phone;
    if (updates.department) payload.departamento = updates.department;
    if (updates.position) payload.posicion = updates.position;
    if (updates.role) payload.rol = updates.role;

    const response = await api.patch(`/api/v1/usuarios/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/usuarios/${id}`);
  },

  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    await api.post(`/api/v1/usuarios/${id}/cambiar-contrasena`, {
      contrasena_actual: currentPassword,
      contrasena_nueva: newPassword,
    });
  },
};

// ============================================================================
// CLAIMS API
// ============================================================================

interface ClaimFilters {
  estado?: string; // UUID o nombre
  asignado_a?: string; // UUID
  prioridad?: 'low' | 'medium' | 'high' | 'critical';
  buscar?: string; // Buscar en asunto y nombre de cliente
  pagina?: number;
  limite?: number;
  ordenar_por?: string;
  orden?: 'asc' | 'desc';
}

export const claimsAPI = {
  getAll: async (filters?: ClaimFilters): Promise<RespuestaPaginada<Claim>> => {
    const response = await api.get('/api/v1/reclamos', { params: filters });
    return {
      datos: response.data.datos.map((claim: ClaimBackend) => mapClaimToFrontend(claim)),
      paginacion: response.data.paginacion,
    };
  },

  getById: async (id: string): Promise<Claim> => {
    const response = await api.get(`/api/v1/reclamos/${id}`);
    return mapClaimToFrontend(response.data);
  },

  create: async (claimData: Partial<Claim> & Record<string, unknown>): Promise<Claim> => {
    const payload = {
      asunto: claimData.subject,
      nombre_cliente: claimData.customerName,
      info_contacto: claimData.contactInfo,
      descripcion: claimData.description,
      estado_id: claimData.status, // Debe ser UUID del estado
      prioridad: claimData.priority,
      proyecto_id: claimData.projectId, // ID del proyecto
      cliente_id: claimData.clientId,   // ID del cliente
      categoria: claimData.category,
      email_cliente: claimData.customerEmail,
      telefono_cliente: claimData.customerPhone,
    };
    const response = await api.post('/api/v1/reclamos', payload);
    return mapClaimToFrontend(response.data);
  },

  update: async (id: string, updates: Partial<Claim> & Record<string, unknown>): Promise<Claim> => {
    const payload: Record<string, unknown> = {};
    if (updates.subject) payload.asunto = updates.subject;
    if (updates.customerName) payload.nombre_cliente = updates.customerName;
    if (updates.contactInfo) payload.info_contacto = updates.contactInfo;
    if (updates.description) payload.descripcion = updates.description;
    if (updates.status) payload.estado_id = updates.status;
    if (updates.subStatus !== undefined) payload.sub_estado_id = updates.subStatus; // ✅ Cambio: sub_estado → sub_estado_id
    if (updates.priority) payload.prioridad = updates.priority;
    if (updates.category) payload.categoria = updates.category;
    if (updates.customerEmail) payload.email_cliente = updates.customerEmail;
    if (updates.customerPhone) payload.telefono_cliente = updates.customerPhone;

    const response = await api.patch(`/api/v1/reclamos/${id}`, payload);
    return mapClaimToFrontend(response.data);
  },

  assign: async (id: string, agentId: string | null): Promise<Claim> => {
    const response = await api.patch(`/api/v1/reclamos/${id}/asignar`, {
      agente_id: agentId
    });
    return mapClaimToFrontend(response.data);
  },

  updateStatus: async (
    id: string,
    status: ClaimStatus,
    subStatus?: string,
    resolutionSummary?: string
  ): Promise<Claim> => {
    const payload: Record<string, unknown> = { estado_id: status };
    if (subStatus) payload.sub_estado_id = subStatus; // ✅ Cambio: sub_estado → sub_estado_id
    if (resolutionSummary) payload.resumen_resolucion = resolutionSummary;
    
    const response = await api.patch(`/api/v1/reclamos/${id}`, payload);
    return mapClaimToFrontend(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/reclamos/${id}`);
  },

  // Auditoría
  getAuditHistory: async (id: string, limite?: number): Promise<AuditEvent[]> => {
    try {
      const response = await api.get(`/api/v1/reclamos/${id}/auditoria`, {
        params: { limite }
      });
      
      // El backend devuelve un array directo de eventos
      const eventos = Array.isArray(response.data) ? response.data : [];
      
      console.log('� Eventos de auditoría cargados:', eventos.length);
      
      return eventos.map((evento: any, index: number) => {
        // Generar un ID único si no viene del backend
        const eventId = evento.id || `audit-${id}-${index}-${Date.now()}`;
        
        // Mapear tipo_evento a los tipos del frontend
        const tipoMap: Record<string, AuditEvent['type']> = {
          'creacion': 'created',
          'created': 'created',
          'actualizacion': 'updated',
          'status_changed': 'status_changed',
          'sub_status_changed': 'substatus_changed',
          'substatus_changed': 'substatus_changed',
          'asignacion': 'assigned',
          'assigned': 'assigned',
          'unassigned': 'unassigned',
          'reassigned': 'reassigned',
          'priority_changed': 'priority_changed',
          'note_added': 'note_added',
          'updated': 'updated',
          'locked': 'locked',
          'unlocked': 'unlocked',
          'resolution_added': 'resolution_added'
        };
        
        // Detectar tipo específico basado en el campo modificado
        let type = tipoMap[evento.tipo_evento] || 'updated';
        if (type === 'updated' && evento.cambios?.campo) {
          const campo = evento.cambios.campo;
          if (campo === 'estado_id') type = 'status_changed';
          else if (campo === 'sub_estado_id') type = 'substatus_changed';
          else if (campo === 'asignado_a') type = 'assigned';
          else if (campo === 'prioridad') type = 'priority_changed';
        }
        
        return {
          id: eventId,
          claimId: id,
          type: type,
          timestamp: new Date(evento.creado_en),
          user: evento.nombre_usuario || 'Sistema',
          userId: evento.usuario_id,
          details: {
            previousValue: evento.cambios?.valor_anterior,
            newValue: evento.cambios?.valor_nuevo || evento.cambios,
            previousName: evento.cambios?.nombre_anterior,
            newName: evento.cambios?.nombre_nuevo,
            description: evento.descripcion,
            area: evento.area_usuario
          }
        };
      });
    } catch (error) {
      console.error('❌ Error loading audit history:', error);
      return [];
    }
  },
};

// ============================================================================
// STATUS CONFIGS API (Configuración de Estados)
// ============================================================================

export const statusConfigsAPI = {
  getAll: async (): Promise<StatusConfig[]> => {
    const response = await api.get('/api/v1/configuracion-estados');
    return response.data.map((config: StatusConfigBackend) => mapStatusConfigToFrontend(config));
  },

  getById: async (id: string): Promise<StatusConfig> => {
    const response = await api.get(`/api/v1/configuracion-estados/${id}`);
    return mapStatusConfigToFrontend(response.data);
  },

  create: async (statusData: Partial<StatusConfig>): Promise<StatusConfig> => {
    const payload = {
      nombre: statusData.name,
      color: statusData.color,
      posicion_orden: statusData.order,
    };
    const response = await api.post('/api/v1/configuracion-estados', payload);
    return mapStatusConfigToFrontend(response.data);
  },

  update: async (id: string, updates: Partial<StatusConfig>): Promise<StatusConfig> => {
    const payload: Record<string, unknown> = {};
    if (updates.name) payload.nombre = updates.name;
    if (updates.color) payload.color = updates.color;
    if (updates.order !== undefined) payload.posicion_orden = updates.order;

    const response = await api.patch(`/api/v1/configuracion-estados/${id}`, payload);
    return mapStatusConfigToFrontend(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/configuracion-estados/${id}`);
  },

  // Sub-estados
  getAllSubStatuses: async (estadoId?: string) => {
    const response = await api.get('/api/v1/configuracion-estados/sub-estados', {
      params: { estado_id: estadoId }
    });
    return response.data;
  },

  getSubStatusesByEstado: async (estadoId: string) => {
    const response = await api.get(`/api/v1/configuracion-estados/${estadoId}/sub-estados`);
    return response.data;
  },

  getSubStatusById: async (subEstadoId: string) => {
    const response = await api.get(`/api/v1/configuracion-estados/sub-estados/${subEstadoId}`);
    return response.data;
  },

  addSubStatus: async (statusId: string, subStatusData: { name: string; description?: string; order: number }) => {
    const payload = {
      nombre: subStatusData.name,
      descripcion: subStatusData.description,
      posicion_orden: subStatusData.order,
      estado_id: statusId,
    };
    const response = await api.post('/api/v1/configuracion-estados/sub-estados', payload);
    return response.data;
  },

  updateSubStatus: async (subEstadoId: string, updates: { name?: string; description?: string; order?: number }) => {
    const payload: Record<string, unknown> = {};
    if (updates.name) payload.nombre = updates.name;
    if (updates.description) payload.descripcion = updates.description;
    if (updates.order !== undefined) payload.posicion_orden = updates.order;

    const response = await api.patch(`/api/v1/configuracion-estados/sub-estados/${subEstadoId}`, payload);
    return response.data;
  },

  deleteSubStatus: async (subEstadoId: string): Promise<void> => {
    await api.delete(`/api/v1/configuracion-estados/sub-estados/${subEstadoId}`);
  },

  // Transiciones
  getTransitions: async () => {
    const response = await api.get('/api/v1/configuracion-estados/transiciones');
    return response.data;
  },

  getTransitionById: async (transicionId: string) => {
    const response = await api.get(`/api/v1/configuracion-estados/transiciones/${transicionId}`);
    return response.data;
  },

  getTransitionsFromEstado: async (estadoId: string) => {
    const response = await api.get(`/api/v1/configuracion-estados/transiciones/desde/${estadoId}`);
    return response.data;
  },

  createTransition: async (transitionData: {
    from_status: string;
    to_status: string;
    required_roles?: string[];
    requires_confirmation?: boolean;
    message?: string;
  }) => {
    const payload = {
      desde_estado: transitionData.from_status,
      hacia_estado: transitionData.to_status,
      roles_requeridos: transitionData.required_roles || [],
      requiere_confirmacion: transitionData.requires_confirmation || false,
      mensaje: transitionData.message,
    };
    const response = await api.post('/api/v1/configuracion-estados/transiciones', payload);
    return response.data;
  },

  updateTransition: async (transicionId: string, updates: {
    required_roles?: string[];
    requires_confirmation?: boolean;
    message?: string;
  }) => {
    const payload: Record<string, unknown> = {};
    if (updates.required_roles) payload.roles_requeridos = updates.required_roles;
    if (updates.requires_confirmation !== undefined) payload.requiere_confirmacion = updates.requires_confirmation;
    if (updates.message) payload.mensaje = updates.message;

    const response = await api.patch(`/api/v1/configuracion-estados/transiciones/${transicionId}`, payload);
    return response.data;
  },

  deleteTransition: async (transicionId: string): Promise<void> => {
    await api.delete(`/api/v1/configuracion-estados/transiciones/${transicionId}`);
  },
};

// ============================================================================
// COMMENTS API (Comentarios)
// ============================================================================

export interface ClaimComment {
  id: string;
  reclamo_id: string;
  usuario_id: string;
  contenido: string;
  es_interno: boolean;
  creado_en: string;
  actualizado_en: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    posicion?: string;
  };
}

export const commentsAPI = {
  getByClaimId: async (claimId: string, incluirInternos: boolean = true): Promise<ClaimComment[]> => {
    const response = await api.get(`/api/v1/reclamos/${claimId}/comentarios`, {
      params: { incluir_internos: incluirInternos }
    });
    return response.data;
  },

  create: async (claimId: string, content: string, isInternal: boolean = false): Promise<ClaimComment> => {
    const response = await api.post(`/api/v1/reclamos/${claimId}/comentarios`, {
      contenido: content,
      es_interno: isInternal,
    });
    return response.data;
  },

  update: async (commentId: string, content: string): Promise<ClaimComment> => {
    const response = await api.patch(`/api/v1/reclamos/comentarios/${commentId}`, {
      contenido: content,
    });
    return response.data;
  },

  delete: async (commentId: string): Promise<void> => {
    await api.delete(`/api/v1/reclamos/comentarios/${commentId}`);
  },
};

// ============================================================================
// ATTACHMENTS API (Adjuntos)
// ============================================================================

export interface ClaimAttachment {
  id: string;
  reclamo_id: string;
  subido_por: string;
  nombre_archivo: string;
  url_archivo: string;
  tipo_archivo?: string;
  tamano_archivo?: number;
  creado_en: string;
  actualizado_en: string;
  usuario?: {
    id: string;
    nombre: string;
    email: string;
    posicion?: string;
  };
}

export const attachmentsAPI = {
  getByClaimId: async (claimId: string): Promise<ClaimAttachment[]> => {
    const response = await api.get(`/api/v1/reclamos/${claimId}/adjuntos`);
    return response.data;
  },

  create: async (claimId: string, attachmentData: {
    nombre_archivo: string;
    url_archivo: string;
    tipo_archivo?: string;
    tamano_archivo?: number;
  }): Promise<ClaimAttachment> => {
    const response = await api.post(`/api/v1/reclamos/${claimId}/adjuntos`, attachmentData);
    return response.data;
  },

  delete: async (attachmentId: string): Promise<void> => {
    await api.delete(`/api/v1/reclamos/adjuntos/${attachmentId}`);
  },
};

// ============================================================================
// PROJECTS & CLIENTS API
// ============================================================================

interface TipoProyectoBackend {
  id: string;
  descripcion: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface ClienteBackend {
  id: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  correo: string;
  telefono?: string;
  empresa?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

interface ProyectoBackend {
  id: string;
  nombre: string;
  descripcion?: string;
  cliente_id: string;
  tipo_proyecto_id: string;
  activo: boolean;
  cliente: ClienteBackend;
  tipo_proyecto: TipoProyectoBackend;
  creado_en: string;
  actualizado_en: string;
}

const mapProjectTypeToFrontend = (tipo: TipoProyectoBackend): import('../types/claim').ProjectType => ({
  id: tipo.id,
  description: tipo.descripcion,
  active: tipo.activo,
  createdAt: new Date(tipo.creado_en),
  updatedAt: new Date(tipo.actualizado_en),
});

const mapClientToFrontend = (client: ClienteBackend): import('../types/claim').Client => ({
  id: client.id,
  name: client.nombre,
  lastName: client.apellido,
  fullName: client.nombre_completo,
  email: client.correo,
  phone: client.telefono,
  company: client.empresa,
  active: client.activo,
  createdAt: new Date(client.creado_en),
  updatedAt: new Date(client.actualizado_en),
});

const mapProjectToFrontend = (project: ProyectoBackend): import('../types/claim').Project => ({
  id: project.id,
  name: project.nombre,
  description: project.descripcion,
  clientId: project.cliente_id,
  projectTypeId: project.tipo_proyecto_id,
  active: project.activo,
  client: mapClientToFrontend(project.cliente),
  projectType: mapProjectTypeToFrontend(project.tipo_proyecto),
  createdAt: new Date(project.creado_en),
  updatedAt: new Date(project.actualizado_en),
});

export const projectsAPI = {
  getAll: async (soloActivos: boolean = true): Promise<import('../types/claim').Project[]> => {
    const response = await api.get('/api/v1/proyectos', {
      params: { solo_activos: soloActivos }
    });
    return response.data.map(mapProjectToFrontend);
  },

  getById: async (id: string): Promise<import('../types/claim').Project> => {
    const response = await api.get(`/api/v1/proyectos/${id}`);
    return mapProjectToFrontend(response.data);
  },

  getByClientId: async (clientId: string, soloActivos: boolean = true): Promise<import('../types/claim').Project[]> => {
    const response = await api.get(`/api/v1/proyectos/cliente/${clientId}`, {
      params: { solo_activos: soloActivos }
    });
    return response.data.map(mapProjectToFrontend);
  },
};

export const clientsAPI = {
  getAll: async (soloActivos: boolean = true): Promise<import('../types/claim').Client[]> => {
    const response = await api.get('/api/v1/clientes', {
      params: { solo_activos: soloActivos }
    });
    return response.data.map(mapClientToFrontend);
  },

  getById: async (id: string): Promise<import('../types/claim').Client> => {
    const response = await api.get(`/api/v1/clientes/${id}`);
    return mapClientToFrontend(response.data);
  },
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string }>;
    return axiosError.response?.data?.detail || axiosError.message || 'Error desconocido';
  }
  return 'Error desconocido';
};

export default api;
