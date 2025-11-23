# 📚 Documentación API Backend MongoDB - Guía para Frontend

## 🔄 Cambios tras Migración a MongoDB

Este documento detalla los cambios en la API tras la migración de PostgreSQL a MongoDB.

---

## 🎯 Endpoints de Reclamos

### Base URL
```
http://localhost:8000/api/v1/reclamos
```

---

## 📋 1. Listar Reclamos

### Endpoint
```http
GET /api/v1/reclamos
```

### Query Parameters
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `estado` | string | No | - | Filtrar por estado (nombre) |
| `asignado_a` | string | No | - | Filtrar por agente asignado (ID) |
| `prioridad` | string | No | - | Filtrar por prioridad |
| `buscar` | string | No | - | Buscar en asunto y nombre de cliente |
| `pagina` | int | No | 1 | Número de página |
| `limite` | int | No | 20 | Items por página (max 100) |
| `ordenar_por` | string | No | `creado_en` | Campo para ordenar |
| `orden` | string | No | `desc` | Orden: `asc` o `desc` |

### Respuesta Exitosa (200 OK)
```json
{
  "datos": [
    {
      "id": "691297a08ac094ff703a4622",
      "numero_reclamo": "703A4622",
      "asunto": "Error en facturación",
      "nombre_cliente": "Pedro López",
      "info_contacto": "pedro@example.com",
      "email_cliente": "pedro@example.com",
      "telefono_cliente": "+54911234567",
      "descripcion": "Descripción del problema...",
      "estado_id": "69126246b51ea6bf614aac5f",
      "sub_estado_id": "69126247b51ea6bf614aac65",
      "prioridad": "high",
      "categoria": "Técnico",
      "proyecto_id": "69126244b51ea6bf614aac46",
      "asignado_a": "69126244b51ea6bf614aac41",
      "bloqueado": false,
      "resumen_resolucion": null,
      "resuelto_en": null,
      "creado_en": "2025-11-11T01:55:44.508000",
      "actualizado_en": "2025-11-11T02:30:15.123000",
      
      "estado_config": {
        "id": "69126246b51ea6bf614aac5f",
        "nombre": "Nuevo",
        "color": "#3b82f6",
        "posicion_orden": 1,
        "descripcion": "Reclamo recién creado",
        "area": "Soporte"
      },
      
      "sub_estado_config": {
        "id": "69126247b51ea6bf614aac65",
        "nombre": "Pendiente de revisión",
        "descripcion": "Esperando revisión inicial",
        "posicion_orden": 1
      },
      
      "agente_asignado": {
        "id": "69126244b51ea6bf614aac41",
        "nombre": "Juan Pérez",
        "email": "juan@example.com",
        "area": "Soporte Técnico"
      },
      
      "cantidad_comentarios": 5,
      "cantidad_adjuntos": 2
    }
  ],
  "paginacion": {
    "total": 24,
    "pagina": 1,
    "limite": 20,
    "total_paginas": 2
  }
}
```

### Notas Importantes
- ✅ Los reclamos **ahora se ordenan correctamente** por `creado_en` descendente (más recientes primero)
- ✅ El campo `agente_asignado` siempre se carga correctamente (incluso si falta info desnormalizada)
- ⚠️ Los IDs ahora son **ObjectId de MongoDB** (strings de 24 caracteres hexadecimales)
- ⚠️ `agente_asignado` puede ser `null` si no hay usuario asignado

---

## 📝 2. Obtener Detalle de Reclamo

### Endpoint
```http
GET /api/v1/reclamos/{reclamo_id}
```

### Parámetros
- `reclamo_id`: ID del reclamo (string MongoDB ObjectId)

### Respuesta Exitosa (200 OK)
```json
{
  "id": "691297a08ac094ff703a4622",
  "numero_reclamo": "703A4622",
  "asunto": "Error en facturación",
  // ... (mismos campos que en lista)
  
  "comentarios": [
    {
      "id": "691297b08ac094ff703a4623",
      "usuario_id": "69126244b51ea6bf614aac41",
      "usuario_nombre": "Juan Pérez",
      "contenido": "Comentario del usuario...",
      "es_interno": false,
      "creado_en": "2025-11-11T02:00:00.000000",
      "actualizado_en": "2025-11-11T02:00:00.000000"
    }
  ],
  
  "adjuntos": [
    {
      "id": "691297c08ac094ff703a4624",
      "nombre_archivo": "factura.pdf",
      "tipo_mime": "application/pdf",
      "tamano": 245680,
      "url": "https://storage.example.com/files/factura.pdf",
      "subido_por": "69126244b51ea6bf614aac41",
      "subido_por_nombre": "Juan Pérez",
      "creado_en": "2025-11-11T02:10:00.000000"
    }
  ],
  
  "eventos_recientes": [
    {
      "id": "691297d08ac094ff703a4625",
      "tipo_evento": "asignacion",
      "nombre_usuario": "Admin Usuario",
      "area_usuario": "Administración",
      "cambios": {
        "campo": "asignado_a",
        "valor_anterior": null,
        "valor_nuevo": "69126244b51ea6bf614aac41"
      },
      "descripcion": "Reclamo asignado a Juan Pérez",
      "creado_en": "2025-11-11T02:15:00.000000"
    }
  ]
}
```

---

## ➕ 3. Crear Reclamo

### Endpoint
```http
POST /api/v1/reclamos
```

### Request Body
```json
{
  "asunto": "Error en facturación",
  "descripcion": "El sistema no genera facturas correctamente",
  "nombre_cliente": "Pedro López",
  "info_contacto": "pedro@example.com",
  "email_cliente": "pedro@example.com",
  "telefono_cliente": "+54911234567",
  "categoria": "Técnico",
  "proyecto_id": "69126244b51ea6bf614aac46",
  "prioridad": "high",
  "estado_id": "69126246b51ea6bf614aac5f"
}
```

### Campos Requeridos
- ✅ `asunto` (string)
- ✅ `descripcion` (string)
- ✅ `nombre_cliente` (string)
- ✅ `info_contacto` (string)

### Campos Opcionales
- `email_cliente` (string)
- `telefono_cliente` (string)
- `categoria` (string)
- `proyecto_id` (string - ObjectId)
- `prioridad` (string: "low", "medium", "high", "critical") - default: "medium"
- `estado_id` (string - ObjectId) - Si no se envía, usa el estado inicial

### Respuesta Exitosa (201 Created)
```json
{
  "id": "6912a1234567890abcdef123",
  "numero_reclamo": "ABCDEF23",
  // ... resto de campos del reclamo
}
```

---

## ✏️ 4. Actualizar Reclamo

### Endpoint
```http
PATCH /api/v1/reclamos/{reclamo_id}
```

### Request Body (todos los campos son opcionales)
```json
{
  "asunto": "Nuevo asunto",
  "descripcion": "Nueva descripción",
  "nombre_cliente": "Nuevo nombre",
  "info_contacto": "nuevo@email.com",
  "email_cliente": "nuevo@email.com",
  "telefono_cliente": "+54911111111",
  "categoria": "Nueva categoría",
  "prioridad": "critical",
  "estado_id": "69126246b51ea6bf614aac60",
  "sub_estado_id": "69126247b51ea6bf614aac65",
  "asignado_a": "69126244b51ea6bf614aac42",
  "proyecto_id": "69126244b51ea6bf614aac47",
  "resumen_resolucion": "Se resolvió el problema...",
  "bloqueado": true
}
```

### Valores de Prioridad
- `"low"` - Baja
- `"medium"` - Media
- `"high"` - Alta
- `"critical"` - Crítica

### Respuesta Exitosa (200 OK)
```json
{
  "id": "691297a08ac094ff703a4622",
  // ... campos actualizados
}
```

### Notas Importantes
- ✅ Se crea evento de auditoría automático para cambios en `estado_id`, `sub_estado_id` y `prioridad`
- ✅ Si se actualiza `asignado_a`, se actualiza automáticamente la info desnormalizada del agente
- ⚠️ Enviar solo los campos que se quieren actualizar

---

## 👤 5. Asignar Reclamo a Agente

### Endpoint
```http
PATCH /api/v1/reclamos/{reclamo_id}/asignar
```

### Request Body - ASIGNAR usuario
```json
{
  "agente_id": "69126244b51ea6bf614aac41"
}
```

### Request Body - DESASIGNAR usuario
```json
{
  "agente_id": null
}
```

### Respuesta Exitosa (200 OK)
```json
{
  "id": "691297a08ac094ff703a4622",
  // ... campos del reclamo
  "agente_asignado": {
    "id": "69126244b51ea6bf614aac41",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "area": "Soporte Técnico"
  }
}
```

### ⚠️ IMPORTANTE - PROBLEMA ACTUAL DEL FRONTEND

**El frontend actualmente está enviando:**
```json
{
  "agente_id": null  // ❌ Siempre null, incluso cuando se selecciona un usuario
}
```

**Debe enviar:**
```json
{
  "agente_id": "69126244b51ea6bf614aac41"  // ✅ ID del usuario seleccionado
}
```

### Notas
- ✅ Se crea evento de auditoría automático
- ✅ Se actualiza automáticamente `asignado_info` (datos desnormalizados)
- 🔄 Alternativa: También se puede asignar usando `PATCH /reclamos/{id}` con campo `asignado_a`

---

## 🗑️ 6. Eliminar Reclamo

### Endpoint
```http
DELETE /api/v1/reclamos/{reclamo_id}
```

### Respuesta Exitosa (204 No Content)
Sin body en la respuesta.

---

## 📜 7. Obtener Auditoría de Reclamo

### Endpoint
```http
GET /api/v1/reclamos/{reclamo_id}/auditoria
```

### Query Parameters
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `limite` | int | No | - | Limitar cantidad de eventos |

### Respuesta Exitosa (200 OK)
```json
[
  {
    "id": "691297d08ac094ff703a4625",
    "tipo_evento": "creacion",
    "usuario_id": "69126244b51ea6bf614aac41",
    "nombre_usuario": "Juan Pérez",
    "area_usuario": "Soporte Técnico",
    "cambios": null,
    "descripcion": "Reclamo creado por Juan Pérez",
    "creado_en": "2025-11-11T01:55:44.508000"
  },
  {
    "id": "691297e08ac094ff703a4626",
    "tipo_evento": "asignacion",
    "usuario_id": "69126244b51ea6bf614aac42",
    "nombre_usuario": "Admin Usuario",
    "area_usuario": "Administración",
    "cambios": {
      "campo": "asignado_a",
      "valor_anterior": null,
      "valor_nuevo": "69126244b51ea6bf614aac41"
    },
    "descripcion": "Reclamo asignado a Juan Pérez",
    "creado_en": "2025-11-11T02:00:00.000000"
  },
  {
    "id": "691297f08ac094ff703a4627",
    "tipo_evento": "actualizacion",
    "usuario_id": "69126244b51ea6bf614aac41",
    "nombre_usuario": "Juan Pérez",
    "area_usuario": "Soporte Técnico",
    "cambios": {
      "campo": "estado_id",
      "valor_anterior": "69126246b51ea6bf614aac5f",
      "valor_nuevo": "69126246b51ea6bf614aac60"
    },
    "descripcion": "Campo 'estado_id' actualizado",
    "creado_en": "2025-11-11T02:30:00.000000"
  }
]
```

### Tipos de Eventos
- `"creacion"` - Reclamo creado
- `"asignacion"` - Reclamo asignado/desasignado
- `"actualizacion"` - Campo importante actualizado (estado, sub-estado, prioridad)

---

## 🏷️ 8. Estados y Sub-Estados

### Listar Estados
```http
GET /api/v1/configuracion-estados
```

### Respuesta
```json
[
  {
    "id": "69126246b51ea6bf614aac5f",
    "nombre": "Nuevo",
    "color": "#3b82f6",
    "posicion_orden": 1,
    "descripcion": "Reclamo recién creado",
    "area": "Soporte",
    "permisos": {},
    "creado_en": "2025-11-06T03:19:45.081000",
    "actualizado_en": "2025-11-06T03:19:45.081000",
    "sub_estados": [
      {
        "id": "69126247b51ea6bf614aac65",
        "estado_id": "69126246b51ea6bf614aac5f",
        "nombre": "Pendiente de revisión",
        "descripcion": "Esperando revisión inicial",
        "posicion_orden": 1,
        "creado_en": "2025-11-06T03:19:45.081000",
        "actualizado_en": "2025-11-06T03:19:45.081000"
      }
    ]
  }
]
```

### Listar Sub-Estados de un Estado
```http
GET /api/v1/configuracion-estados/{estado_id}/sub-estados
```

### Respuesta
```json
[
  {
    "id": "69126247b51ea6bf614aac65",
    "estado_id": "69126246b51ea6bf614aac5f",
    "nombre": "Pendiente de revisión",
    "descripcion": "Esperando revisión inicial",
    "posicion_orden": 1,
    "creado_en": "2025-11-06T03:19:45.081000",
    "actualizado_en": "2025-11-06T03:19:45.081000"
  }
]
```

---

## 👥 9. Usuarios

### Listar Usuarios
```http
GET /api/v1/usuarios?limite=100
```

### Respuesta
```json
[
  {
    "id": "69126244b51ea6bf614aac41",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "area": "Soporte Técnico",
    "rol": "agente",
    "activo": true,
    "creado_en": "2025-11-06T03:19:45.081000"
  }
]
```

---

## 🏢 10. Clientes y Proyectos

### Listar Clientes (con proyectos asociados)
```http
GET /api/v1/clientes?solo_activos=true
```

### Respuesta
```json
[
  {
    "id": "69126244b51ea6bf614aac46",
    "nombre": "Empresa ABC",
    "email": "contacto@abc.com",
    "telefono": "+54911111111",
    "activo": true,
    "creado_en": "2025-11-06T03:19:45.081000",
    "proyectos": [
      {
        "id": "69126245b51ea6bf614aac50",
        "nombre": "Proyecto Web",
        "descripcion": "Desarrollo web corporativo",
        "activo": true
      }
    ]
  }
]
```

### Listar Proyectos de un Cliente
```http
GET /api/v1/proyectos/cliente/{cliente_id}?solo_activos=true
```

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante Bearer Token:

```http
Authorization: Bearer <token_jwt>
```

### Login
```http
POST /api/v1/autenticacion/login

{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

### Respuesta
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "usuario": {
    "id": "69126244b51ea6bf614aac41",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "area": "Soporte Técnico",
    "rol": "agente"
  }
}
```

### Usuario Actual
```http
GET /api/v1/autenticacion/yo
```

---

## ⚠️ Cambios Importantes desde PostgreSQL

### IDs (ObjectId de MongoDB)
- ❌ **ANTES**: UUID (formato: `550e8400-e29b-41d4-a716-446655440000`)
- ✅ **AHORA**: ObjectId (formato: `69126244b51ea6bf614aac41`)
- 📏 Longitud: 24 caracteres hexadecimales

### Ordenamiento de Reclamos
- ✅ Por defecto ordena por `creado_en` DESC (más recientes primero)
- ✅ Se corrigió el bug donde no aparecían los reclamos recién creados

### Campo agente_asignado
- ✅ Siempre se carga correctamente (con fallback a DB si falta info desnormalizada)
- ⚠️ Puede ser `null` si no hay usuario asignado
- ✅ Contiene objeto completo: `{id, nombre, email, area}`

### Campos de Actualización
- ✅ Schema `ReclamoActualizar` ahora acepta:
  - `estado_id`
  - `sub_estado_id`
  - `asignado_a`
  - `proyecto_id`
  - Todos los campos editables del reclamo

### Auditoría
- ✅ Se crea automáticamente para:
  - Creación de reclamo
  - Asignación/desasignación
  - Cambios en estado, sub-estado, prioridad
- ✅ Los eventos están embebidos en el documento del reclamo

---

## 🐛 Bugs Conocidos a Corregir en Frontend

### 1. ❌ Asignación de Usuario
**Problema**: El frontend envía `{"agente_id": null}` siempre, incluso cuando se selecciona un usuario.

**Solución**: Enviar el ID del usuario seleccionado:
```json
{
  "agente_id": "69126244b51ea6bf614aac41"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 422 | Unprocessable Entity - Error de validación |
| 500 | Internal Server Error - Error del servidor |

---

## 📞 Contacto

Para dudas o problemas con la API, contactar al equipo de backend.

**Última actualización**: 11 de Noviembre 2025
**Versión API**: 2.0.0 (MongoDB)
