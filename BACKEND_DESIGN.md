# Diseño Backend - Sistema de Gestión de Reclamos

## Tabla de Contenidos
1. [Diagrama de Clases](#diagrama-de-clases)
2. [Modelos de Base de Datos](#modelos-de-base-de-datos)
3. [Diseño de API REST](#diseño-de-api-rest)
4. [Arquitectura Recomendada](#arquitectura-recomendada)
5. [Consideraciones de Seguridad](#consideraciones-de-seguridad)

---

## Diagrama de Clases

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String password
        +String name
        +String role
        +DateTime createdAt
        +DateTime updatedAt
        +login(email, password) Boolean
        +resetPassword(token, newPassword) Boolean
        +validateToken(token) Boolean
    }

    class Claim {
        +String id
        +String subject
        +String customerName
        +String contactInfo
        +String description
        +String status
        +String assignedTo
        +DateTime createdAt
        +DateTime updatedAt
        +addNote(note) void
        +updateStatus(newStatus) void
        +assignUser(userId) void
    }

    class ClaimNote {
        +String id
        +String claimId
        +String content
        +String author
        +DateTime createdAt
        +edit(newContent) void
        +delete() void
    }

    class StatusConfig {
        +String id
        +String name
        +String color
        +Integer order
        +DateTime createdAt
        +DateTime updatedAt
        +reorder(newOrder) void
        +update(name, color) void
    }

    class ClaimHistory {
        +String id
        +String claimId
        +String userId
        +String action
        +String previousValue
        +String newValue
        +DateTime createdAt
        +getHistory(claimId) List~ClaimHistory~
    }

    class Notification {
        +String id
        +String userId
        +String type
        +String message
        +Boolean read
        +String relatedEntityId
        +DateTime createdAt
        +markAsRead() void
    }

    class Dashboard {
        +getKPIs() KPIData
        +getStatusDistribution() List~StatusDistribution~
        +getRecentClaims(limit) List~Claim~
        +getClaimTrends(period) TrendData
    }

    class KPIData {
        +Integer totalOpen
        +Integer newToday
        +Integer resolvedLastWeek
        +Double averageResolutionTime
        +Double satisfactionRate
    }

    class StatusDistribution {
        +String status
        +Integer count
        +Double percentage
    }

    User "1" --> "0..*" Claim : assigned
    Claim "1" --> "0..*" ClaimNote : has
    Claim "1" --> "0..*" ClaimHistory : has
    User "1" --> "0..*" ClaimNote : creates
    User "1" --> "0..*" Notification : receives
    Claim "1" --> "1" StatusConfig : has status
    Dashboard ..> Claim : queries
    Dashboard ..> KPIData : generates
    Dashboard ..> StatusDistribution : generates
```

---

## Modelos de Base de Datos

### 1. Tabla: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'agent',
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT valid_role CHECK (role IN ('admin', 'agent', 'manager', 'viewer'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Tabla: `claims`
```sql
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject VARCHAR(500) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_assigned_to ON claims(assigned_to);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);
CREATE INDEX idx_claims_customer_name ON claims(customer_name);
```

### 3. Tabla: `claim_notes`
```sql
CREATE TABLE claim_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claim_notes_claim_id ON claim_notes(claim_id);
CREATE INDEX idx_claim_notes_created_at ON claim_notes(created_at DESC);
```

### 4. Tabla: `status_configs`
```sql
CREATE TABLE status_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(50) NOT NULL,
    order_position INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_configs_order ON status_configs(order_position);
```

### 5. Tabla: `claim_history`
```sql
CREATE TABLE claim_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    field_changed VARCHAR(100),
    previous_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_claim_history_claim_id ON claim_history(claim_id);
CREATE INDEX idx_claim_history_created_at ON claim_history(created_at DESC);
```

### 6. Tabla: `notifications`
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 7. Tabla: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

### 8. Tabla: `attachments` (opcional para futuras mejoras)
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_claim_id ON attachments(claim_id);
```

---

## Diseño de API REST

### Base URL
```
https://api.sistema-reclamos.com/api/v1
```

### Autenticación
Todas las rutas (excepto login y registro) requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

---

## Endpoints por Módulo

### 🔐 Autenticación

#### `POST /auth/login`
Iniciar sesión en el sistema.

**Request Body:**
```json
{
  "email": "admin@sistema.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "admin@sistema.com",
      "name": "Administrador Sistema",
      "role": "admin"
    }
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Credenciales incorrectas"
  }
}
```

---

#### `POST /auth/logout`
Cerrar sesión (invalidar token).

**Response (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

#### `POST /auth/refresh-token`
Renovar token de acceso.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### `POST /auth/recover-password`
Solicitar recuperación de contraseña.

**Request Body:**
```json
{
  "email": "usuario@sistema.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Se ha enviado un correo con instrucciones para recuperar tu contraseña"
}
```

---

#### `POST /auth/reset-password`
Restablecer contraseña con token.

**Request Body:**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "nuevaPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 📋 Reclamos (Claims)

#### `GET /claims`
Obtener lista de reclamos con paginación y filtros.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (opcional)
- `assignedTo` (opcional)
- `search` (opcional - busca en subject, customerName, description)
- `sortBy` (default: createdAt)
- `sortOrder` (default: desc)

**Request:**
```
GET /claims?page=1&limit=20&status=Nuevo&search=cliente&sortBy=createdAt&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "uuid",
        "subject": "Problema con el servicio",
        "customerName": "Juan Pérez",
        "contactInfo": "juan@email.com",
        "description": "Descripción del problema",
        "status": "Nuevo",
        "priority": "high",
        "assignedTo": {
          "id": "uuid",
          "name": "Agente Servicio",
          "email": "agente@sistema.com"
        },
        "createdBy": {
          "id": "uuid",
          "name": "Admin Sistema"
        },
        "createdAt": "2025-10-29T10:30:00Z",
        "updatedAt": "2025-10-29T10:30:00Z",
        "notesCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

#### `GET /claims/:id`
Obtener detalle completo de un reclamo.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "Problema con el servicio",
    "customerName": "Juan Pérez",
    "contactInfo": "juan@email.com",
    "description": "Descripción detallada del problema",
    "status": "En Proceso",
    "priority": "high",
    "assignedTo": {
      "id": "uuid",
      "name": "Agente Servicio",
      "email": "agente@sistema.com"
    },
    "createdBy": {
      "id": "uuid",
      "name": "Admin Sistema"
    },
    "createdAt": "2025-10-29T10:30:00Z",
    "updatedAt": "2025-10-29T14:20:00Z",
    "resolvedAt": null,
    "notes": [
      {
        "id": "uuid",
        "content": "Se contactó al cliente",
        "author": {
          "id": "uuid",
          "name": "Agente Servicio"
        },
        "isInternal": false,
        "createdAt": "2025-10-29T11:00:00Z"
      }
    ],
    "history": [
      {
        "id": "uuid",
        "action": "status_changed",
        "fieldChanged": "status",
        "previousValue": "Nuevo",
        "newValue": "En Proceso",
        "user": {
          "id": "uuid",
          "name": "Agente Servicio"
        },
        "createdAt": "2025-10-29T11:00:00Z"
      }
    ]
  }
}
```

---

#### `POST /claims`
Crear un nuevo reclamo.

**Request Body:**
```json
{
  "subject": "Problema con facturación",
  "customerName": "María González",
  "contactInfo": "maria@email.com",
  "description": "Descripción detallada del problema",
  "status": "Nuevo",
  "priority": "medium",
  "assignedTo": "uuid-agente" // opcional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "Problema con facturación",
    "customerName": "María González",
    "contactInfo": "maria@email.com",
    "description": "Descripción detallada del problema",
    "status": "Nuevo",
    "priority": "medium",
    "assignedTo": null,
    "createdBy": {
      "id": "uuid",
      "name": "Admin Sistema"
    },
    "createdAt": "2025-10-29T10:30:00Z",
    "updatedAt": "2025-10-29T10:30:00Z",
    "notes": []
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Errores de validación",
    "details": [
      {
        "field": "subject",
        "message": "El asunto es requerido"
      },
      {
        "field": "contactInfo",
        "message": "El correo electrónico no es válido"
      }
    ]
  }
}
```

---

#### `PATCH /claims/:id`
Actualizar un reclamo existente.

**Request Body (parcial):**
```json
{
  "subject": "Nuevo asunto actualizado",
  "status": "En Proceso",
  "priority": "high",
  "assignedTo": "uuid-agente"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subject": "Nuevo asunto actualizado",
    "status": "En Proceso",
    "priority": "high",
    "updatedAt": "2025-10-29T15:30:00Z"
  }
}
```

---

#### `DELETE /claims/:id`
Eliminar un reclamo (solo admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Reclamo eliminado exitosamente"
}
```

---

#### `PATCH /claims/:id/status`
Actualizar solo el estado de un reclamo (para drag & drop en Kanban).

**Request Body:**
```json
{
  "status": "Resuelto"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "Resuelto",
    "updatedAt": "2025-10-29T16:00:00Z"
  }
}
```

---

#### `POST /claims/:id/assign`
Asignar un reclamo a un usuario.

**Request Body:**
```json
{
  "userId": "uuid-agente"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assignedTo": {
      "id": "uuid-agente",
      "name": "Agente Servicio",
      "email": "agente@sistema.com"
    },
    "updatedAt": "2025-10-29T16:00:00Z"
  }
}
```

---

### 📝 Notas de Reclamos

#### `POST /claims/:id/notes`
Agregar una nota a un reclamo.

**Request Body:**
```json
{
  "content": "Se contactó al cliente y está a la espera de respuesta",
  "isInternal": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "claimId": "uuid",
    "content": "Se contactó al cliente y está a la espera de respuesta",
    "author": {
      "id": "uuid",
      "name": "Agente Servicio"
    },
    "isInternal": false,
    "createdAt": "2025-10-29T16:30:00Z"
  }
}
```

---

#### `GET /claims/:id/notes`
Obtener todas las notas de un reclamo.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Nota 1",
      "author": {
        "id": "uuid",
        "name": "Agente Servicio"
      },
      "isInternal": false,
      "createdAt": "2025-10-29T16:30:00Z",
      "updatedAt": "2025-10-29T16:30:00Z"
    }
  ]
}
```

---

#### `PATCH /claims/:claimId/notes/:noteId`
Editar una nota existente.

**Request Body:**
```json
{
  "content": "Contenido actualizado de la nota"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Contenido actualizado de la nota",
    "updatedAt": "2025-10-29T17:00:00Z"
  }
}
```

---

#### `DELETE /claims/:claimId/notes/:noteId`
Eliminar una nota.

**Response (200):**
```json
{
  "success": true,
  "message": "Nota eliminada exitosamente"
}
```

---

### 🎯 Estados (Status Configs)

#### `GET /statuses`
Obtener todos los estados configurados.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Nuevo",
      "color": "blue",
      "order": 1,
      "isDefault": true,
      "isFinal": false,
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    },
    {
      "id": "uuid",
      "name": "En Proceso",
      "color": "amber",
      "order": 2,
      "isDefault": false,
      "isFinal": false,
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-01T10:00:00Z"
    }
  ]
}
```

---

#### `POST /statuses`
Crear un nuevo estado (solo admin).

**Request Body:**
```json
{
  "name": "En Revisión",
  "color": "purple",
  "order": 3,
  "isDefault": false,
  "isFinal": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "En Revisión",
    "color": "purple",
    "order": 3,
    "isDefault": false,
    "isFinal": false,
    "createdAt": "2025-10-29T10:00:00Z",
    "updatedAt": "2025-10-29T10:00:00Z"
  }
}
```

---

#### `PATCH /statuses/:id`
Actualizar un estado existente (solo admin).

**Request Body:**
```json
{
  "name": "En Revisión Técnica",
  "color": "purple"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "En Revisión Técnica",
    "color": "purple",
    "updatedAt": "2025-10-29T11:00:00Z"
  }
}
```

---

#### `DELETE /statuses/:id`
Eliminar un estado (solo admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Estado eliminado exitosamente"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "STATUS_IN_USE",
    "message": "No se puede eliminar el estado porque hay reclamos que lo usan"
  }
}
```

---

#### `POST /statuses/reorder`
Reordenar estados (para drag & drop en configuración).

**Request Body:**
```json
{
  "statuses": [
    { "id": "uuid-1", "order": 1 },
    { "id": "uuid-2", "order": 2 },
    { "id": "uuid-3", "order": 3 }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Estados reordenados exitosamente"
}
```

---

### 📊 Dashboard & Analytics

#### `GET /dashboard/kpis`
Obtener KPIs principales.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalOpen": 45,
    "newToday": 7,
    "resolvedLastWeek": 23,
    "averageResolutionTime": 48.5,
    "satisfactionRate": 4.2
  }
}
```

---

#### `GET /dashboard/status-distribution`
Obtener distribución de reclamos por estado.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "status": "Nuevo",
      "count": 15,
      "percentage": 33.33,
      "color": "blue"
    },
    {
      "status": "En Proceso",
      "count": 20,
      "percentage": 44.44,
      "color": "amber"
    },
    {
      "status": "Esperando Respuesta",
      "count": 10,
      "percentage": 22.22,
      "color": "orange"
    }
  ]
}
```

---

#### `GET /dashboard/recent-claims`
Obtener reclamos recientes.

**Query Parameters:**
- `limit` (default: 5)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subject": "Problema reciente",
      "customerName": "Cliente",
      "status": "Nuevo",
      "priority": "high",
      "createdAt": "2025-10-29T10:30:00Z",
      "updatedAt": "2025-10-29T10:30:00Z"
    }
  ]
}
```

---

#### `GET /dashboard/trends`
Obtener tendencias de reclamos.

**Query Parameters:**
- `period` (valores: day, week, month, year)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "week",
    "labels": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    "datasets": [
      {
        "label": "Nuevos",
        "data": [5, 8, 6, 9, 7, 3, 2]
      },
      {
        "label": "Resueltos",
        "data": [3, 5, 7, 6, 8, 4, 3]
      }
    ]
  }
}
```

---

### 👤 Usuarios

#### `GET /users`
Obtener lista de usuarios (solo admin/manager).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (opcional)
- `search` (opcional)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "agente@sistema.com",
        "name": "Agente Servicio",
        "role": "agent",
        "isActive": true,
        "createdAt": "2025-10-01T10:00:00Z",
        "lastLogin": "2025-10-29T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

---

#### `GET /users/:id`
Obtener detalle de un usuario.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "agente@sistema.com",
    "name": "Agente Servicio",
    "role": "agent",
    "profileImage": "https://...",
    "isActive": true,
    "createdAt": "2025-10-01T10:00:00Z",
    "lastLogin": "2025-10-29T09:00:00Z",
    "stats": {
      "claimsAssigned": 25,
      "claimsResolved": 20,
      "averageResolutionTime": 36.5
    }
  }
}
```

---

#### `POST /users`
Crear un nuevo usuario (solo admin).

**Request Body:**
```json
{
  "email": "nuevo@sistema.com",
  "password": "password123",
  "name": "Nuevo Usuario",
  "role": "agent"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "nuevo@sistema.com",
    "name": "Nuevo Usuario",
    "role": "agent",
    "isActive": true,
    "createdAt": "2025-10-29T10:00:00Z"
  }
}
```

---

#### `PATCH /users/:id`
Actualizar un usuario (solo admin o el propio usuario).

**Request Body:**
```json
{
  "name": "Nombre Actualizado",
  "role": "manager"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nombre Actualizado",
    "role": "manager",
    "updatedAt": "2025-10-29T11:00:00Z"
  }
}
```

---

#### `DELETE /users/:id`
Desactivar un usuario (soft delete, solo admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario desactivado exitosamente"
}
```

---

### 🔔 Notificaciones

#### `GET /notifications`
Obtener notificaciones del usuario autenticado.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `read` (opcional: true/false)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "claim_assigned",
        "message": "Se te ha asignado un nuevo reclamo",
        "isRead": false,
        "relatedEntityType": "claim",
        "relatedEntityId": "uuid-claim",
        "createdAt": "2025-10-29T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    },
    "unreadCount": 5
  }
}
```

---

#### `PATCH /notifications/:id/read`
Marcar una notificación como leída.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true,
    "readAt": "2025-10-29T11:00:00Z"
  }
}
```

---

#### `POST /notifications/mark-all-read`
Marcar todas las notificaciones como leídas.

**Response (200):**
```json
{
  "success": true,
  "message": "Todas las notificaciones marcadas como leídas"
}
```

---

### 📎 Archivos Adjuntos (opcional)

#### `POST /claims/:id/attachments`
Subir un archivo adjunto a un reclamo.

**Request (multipart/form-data):**
```
file: [archivo]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "claimId": "uuid",
    "fileName": "documento.pdf",
    "filePath": "https://storage.../documento.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "uploadedBy": {
      "id": "uuid",
      "name": "Usuario"
    },
    "createdAt": "2025-10-29T10:00:00Z"
  }
}
```

---

#### `GET /claims/:id/attachments`
Obtener archivos adjuntos de un reclamo.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fileName": "documento.pdf",
      "filePath": "https://storage.../documento.pdf",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "createdAt": "2025-10-29T10:00:00Z"
    }
  ]
}
```

---

#### `DELETE /attachments/:id`
Eliminar un archivo adjunto.

**Response (200):**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

---

## Arquitectura Recomendada

### Stack Tecnológico Sugerido

#### Backend
- **Framework**: Node.js con Express / NestJS / Fastify
- **Base de Datos**: PostgreSQL (principal) + Redis (caché)
- **ORM**: Prisma / TypeORM / Sequelize
- **Autenticación**: JWT + Refresh Tokens
- **Validación**: Zod / Joi / Class-validator
- **File Storage**: AWS S3 / Azure Blob Storage / MinIO
- **Email**: SendGrid / Mailgun / AWS SES
- **Logs**: Winston / Pino
- **Documentación**: Swagger / OpenAPI

#### Estructura de Carpetas (Ejemplo con NestJS)
```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── refresh-token.strategy.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── roles.guard.ts
├── claims/
│   ├── claims.controller.ts
│   ├── claims.service.ts
│   ├── claims.module.ts
│   ├── dto/
│   │   ├── create-claim.dto.ts
│   │   ├── update-claim.dto.ts
│   │   └── filter-claim.dto.ts
│   └── entities/
│       └── claim.entity.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
├── statuses/
│   ├── statuses.controller.ts
│   ├── statuses.service.ts
│   └── statuses.module.ts
├── notifications/
│   ├── notifications.controller.ts
│   ├── notifications.service.ts
│   ├── notifications.gateway.ts
│   └── notifications.module.ts
├── dashboard/
│   ├── dashboard.controller.ts
│   ├── dashboard.service.ts
│   └── dashboard.module.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── middlewares/
│   └── utils/
├── config/
│   └── configuration.ts
└── main.ts
```

---

## Consideraciones de Seguridad

### 1. Autenticación & Autorización
- ✅ Implementar JWT con tiempo de expiración corto (15-30 min)
- ✅ Usar Refresh Tokens con tiempo de expiración largo (7-30 días)
- ✅ Implementar Rate Limiting en endpoints de autenticación
- ✅ Hash de contraseñas con bcrypt (salt rounds: 10-12)
- ✅ Validar roles y permisos en cada endpoint sensible

### 2. Validación de Datos
- ✅ Validar todos los inputs del cliente
- ✅ Sanitizar datos para prevenir SQL Injection
- ✅ Validar tipos de archivos y tamaños en uploads
- ✅ Implementar límites de rate en API

### 3. CORS
```javascript
// Configuración CORS segura
app.use(cors({
  origin: [
    'https://sistema-reclamos.com',
    'https://app.sistema-reclamos.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 4. Headers de Seguridad
```javascript
// Helmet.js para headers seguros
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 5. Rate Limiting
```javascript
// Límite de requests por IP
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', limiter);

// Rate limiting más estricto para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login'
});

app.use('/api/auth/login', authLimiter);
```

### 6. Logging & Monitoring
- ✅ Registrar todos los accesos y errores
- ✅ No loggear información sensible (contraseñas, tokens)
- ✅ Implementar alertas para actividad sospechosa
- ✅ Usar herramientas de monitoreo (Sentry, New Relic, DataDog)

### 7. Variables de Entorno
```env
# .env.example
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/claims_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRATION=7d

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@sistema-reclamos.com

# Storage
AWS_S3_BUCKET=claims-attachments
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1

# Frontend URL
FRONTEND_URL=https://app.sistema-reclamos.com

# Cors Origins (comma separated)
CORS_ORIGINS=https://sistema-reclamos.com,https://app.sistema-reclamos.com
```

---

## WebSockets (opcional para notificaciones en tiempo real)

### Conexión WebSocket
```
ws://api.sistema-reclamos.com/socket
```

### Autenticación
```javascript
// Cliente se conecta con token
socket.emit('authenticate', { token: 'jwt-token' });
```

### Eventos

#### `claim:created`
```json
{
  "event": "claim:created",
  "data": {
    "id": "uuid",
    "subject": "Nuevo reclamo",
    "customerName": "Cliente",
    "status": "Nuevo",
    "createdAt": "2025-10-29T10:00:00Z"
  }
}
```

#### `claim:updated`
```json
{
  "event": "claim:updated",
  "data": {
    "id": "uuid",
    "updates": {
      "status": "En Proceso"
    },
    "updatedAt": "2025-10-29T11:00:00Z"
  }
}
```

#### `claim:assigned`
```json
{
  "event": "claim:assigned",
  "data": {
    "claimId": "uuid",
    "assignedTo": {
      "id": "uuid",
      "name": "Agente"
    }
  }
}
```

#### `notification:new`
```json
{
  "event": "notification:new",
  "data": {
    "id": "uuid",
    "type": "claim_assigned",
    "message": "Se te ha asignado un nuevo reclamo",
    "createdAt": "2025-10-29T11:00:00Z"
  }
}
```

---

## Paginación Estándar

Todos los endpoints que retornan listas deben usar el siguiente formato:

### Request
```
GET /claims?page=2&limit=20
```

### Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

---

## Manejo de Errores Estándar

### Formato de Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error",
    "details": {} // opcional, para información adicional
  }
}
```

### Códigos de Error Comunes

| Código HTTP | Error Code | Descripción |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Errores de validación en los datos |
| 401 | `UNAUTHORIZED` | Token inválido o expirado |
| 403 | `FORBIDDEN` | Usuario no tiene permisos |
| 404 | `NOT_FOUND` | Recurso no encontrado |
| 409 | `CONFLICT` | Conflicto (ej: email ya existe) |
| 422 | `UNPROCESSABLE_ENTITY` | Entidad no procesable |
| 429 | `TOO_MANY_REQUESTS` | Rate limit excedido |
| 500 | `INTERNAL_SERVER_ERROR` | Error interno del servidor |

---

## Roadmap de Implementación

### Fase 1: Core (4-6 semanas)
- ✅ Setup del proyecto y base de datos
- ✅ Módulo de autenticación (login, logout, refresh token)
- ✅ CRUD de usuarios
- ✅ CRUD de reclamos
- ✅ CRUD de estados
- ✅ Sistema de notas

### Fase 2: Features Avanzadas (3-4 semanas)
- ✅ Dashboard y KPIs
- ✅ Sistema de notificaciones
- ✅ Búsqueda y filtros avanzados
- ✅ Historial de cambios
- ✅ Asignación de reclamos

### Fase 3: Optimización (2-3 semanas)
- ✅ WebSockets para tiempo real
- ✅ Caché con Redis
- ✅ Optimización de queries
- ✅ Archivos adjuntos
- ✅ Testing (unitarios e integración)

### Fase 4: Deploy & Monitoring (1-2 semanas)
- ✅ CI/CD Pipeline
- ✅ Monitoreo y logging
- ✅ Documentación final
- ✅ Deploy a producción

---

## Testing

### Endpoints Prioritarios para Testing
1. **Autenticación**: Login, logout, refresh token
2. **Reclamos**: CRUD completo, cambio de estado
3. **Dashboard**: KPIs y distribución
4. **Usuarios**: Creación y permisos

### Herramientas Recomendadas
- **Unit Testing**: Jest
- **Integration Testing**: Supertest
- **E2E Testing**: Postman/Newman
- **Load Testing**: Artillery / K6

---

## Conclusión

Este diseño proporciona una base sólida para el backend del sistema de gestión de reclamos. La arquitectura es escalable, segura y fácil de mantener. 

### Próximos Pasos
1. Revisar y ajustar el diseño según necesidades específicas
2. Configurar el entorno de desarrollo
3. Implementar por fases siguiendo el roadmap
4. Realizar pruebas continuas
5. Documentar cambios y mejoras

---

**Documento generado el:** 29 de octubre de 2025
**Versión:** 1.0
**Autor:** Sistema de Diseño Backend
