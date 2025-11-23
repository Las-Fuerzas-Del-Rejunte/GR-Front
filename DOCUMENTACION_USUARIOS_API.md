# Documentación API - Gestión de Usuarios

## Descripción General
Esta documentación detalla los endpoints necesarios en el backend para la gestión completa de usuarios, incluyendo creación, edición, eliminación y listado con sistema de roles.

---

## 1. Obtener Lista de Usuarios

### Endpoint
```
GET /api/usuarios
```

### Descripción
Obtiene la lista completa de usuarios registrados en el sistema.

### Headers Requeridos
```
Authorization: Bearer <token>
```

### Respuesta Exitosa (200 OK)
```json
{
  "usuarios": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan.perez@ejemplo.com",
      "rol": "admin",
      "telefono": "+54 11 1234-5678",
      "departamento": "TI",
      "posicion": "Gerente de Sistemas",
      "activo": true,
      "fecha_creacion": "2024-01-15T10:30:00Z",
      "ultimo_acceso": "2024-11-23T08:15:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "nombre": "María González",
      "email": "maria.gonzalez@ejemplo.com",
      "rol": "agent",
      "telefono": "+54 11 9876-5432",
      "departamento": "Soporte",
      "posicion": "Agente Senior",
      "activo": true,
      "fecha_creacion": "2024-02-20T14:45:00Z",
      "ultimo_acceso": "2024-11-23T09:00:00Z"
    }
  ]
}
```

### Códigos de Error
- **401 Unauthorized**: Token inválido o expirado
- **403 Forbidden**: El usuario no tiene permisos para ver la lista de usuarios
- **500 Internal Server Error**: Error del servidor

---

## 2. Crear Nuevo Usuario

### Endpoint
```
POST /api/usuarios
```

### Descripción
Crea un nuevo usuario en el sistema con un rol asignado.

### Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body Request
```json
{
  "nombre": "Carlos Rodríguez",
  "email": "carlos.rodriguez@ejemplo.com",
  "password": "SecurePass123!",
  "rol": "agent",
  "telefono": "+54 11 5555-6666",
  "departamento": "Ventas",
  "posicion": "Representante de Ventas"
}
```

### Campos Requeridos
| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombre | string | Nombre completo del usuario (min: 3 caracteres) |
| email | string | Email válido y único en el sistema |
| password | string | Contraseña (min: 8 caracteres) |
| rol | string | Rol del usuario: `admin`, `manager`, `agent`, `viewer` |

### Campos Opcionales
| Campo | Tipo | Descripción |
|-------|------|-------------|
| telefono | string | Número de teléfono |
| departamento | string | Departamento al que pertenece |
| posicion | string | Cargo o posición en la empresa |

### Respuesta Exitosa (201 Created)
```json
{
  "mensaje": "Usuario creado exitosamente",
  "usuario": {
    "_id": "507f1f77bcf86cd799439013",
    "nombre": "Carlos Rodríguez",
    "email": "carlos.rodriguez@ejemplo.com",
    "rol": "agent",
    "telefono": "+54 11 5555-6666",
    "departamento": "Ventas",
    "posicion": "Representante de Ventas",
    "activo": true,
    "fecha_creacion": "2024-11-23T10:00:00Z"
  }
}
```

### Códigos de Error
- **400 Bad Request**: Datos inválidos o incompletos
  ```json
  {
    "error": "Validación fallida",
    "detalles": {
      "email": "El email ya está registrado",
      "password": "La contraseña debe tener al menos 8 caracteres"
    }
  }
  ```
- **401 Unauthorized**: Token inválido
- **403 Forbidden**: El usuario no tiene permisos para crear usuarios
- **409 Conflict**: Email ya existe en el sistema
- **500 Internal Server Error**: Error del servidor

### Validaciones Backend Recomendadas
1. **Email único**: Verificar que no exista otro usuario con el mismo email
2. **Formato email**: Validar formato de email correcto
3. **Contraseña segura**: 
   - Mínimo 8 caracteres
   - Al menos una mayúscula
   - Al menos un número
   - Hashear con bcrypt antes de guardar
4. **Rol válido**: Solo permitir roles definidos en el sistema
5. **Permisos**: Solo usuarios con rol `admin` pueden crear otros usuarios

---

## 3. Actualizar Usuario Existente

### Endpoint
```
PUT /api/usuarios/:id
PATCH /api/usuarios/:id
```

### Descripción
Actualiza la información de un usuario existente. No permite cambiar la contraseña (usar endpoint específico).

### Headers Requeridos
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Parámetros URL
- `id`: ObjectId del usuario a actualizar

### Body Request
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juancarlos.perez@ejemplo.com",
  "rol": "manager",
  "telefono": "+54 11 1234-9999",
  "departamento": "TI",
  "posicion": "Director de TI"
}
```

### Campos Actualizables
| Campo | Tipo | Descripción |
|-------|------|-------------|
| nombre | string | Nombre completo del usuario |
| email | string | Email (debe ser único) |
| rol | string | Rol del usuario |
| telefono | string | Número de teléfono |
| departamento | string | Departamento |
| posicion | string | Cargo o posición |
| activo | boolean | Estado del usuario (activar/desactivar) |

### Respuesta Exitosa (200 OK)
```json
{
  "mensaje": "Usuario actualizado exitosamente",
  "usuario": {
    "_id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Carlos Pérez",
    "email": "juancarlos.perez@ejemplo.com",
    "rol": "manager",
    "telefono": "+54 11 1234-9999",
    "departamento": "TI",
    "posicion": "Director de TI",
    "activo": true,
    "fecha_actualizacion": "2024-11-23T11:30:00Z"
  }
}
```

### Códigos de Error
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: Token inválido
- **403 Forbidden**: Sin permisos para actualizar usuarios
- **404 Not Found**: Usuario no encontrado
- **409 Conflict**: Email ya existe (si se intentó cambiar)
- **500 Internal Server Error**: Error del servidor

### Validaciones Backend
1. **Usuario existe**: Verificar que el ID sea válido
2. **Email único**: Si se cambia el email, verificar que no exista
3. **Permisos**: 
   - Admins pueden actualizar cualquier usuario
   - Managers pueden actualizar usuarios de su departamento
   - Usuarios pueden actualizar solo su propia información (excepto rol)
4. **Rol válido**: Verificar que el rol sea válido
5. **No auto-degradación**: Un admin no puede quitarse su propio rol de admin si es el único

---

## 4. Eliminar Usuario

### Endpoint
```
DELETE /api/usuarios/:id
```

### Descripción
Elimina un usuario del sistema (puede ser eliminación lógica o física).

### Headers Requeridos
```
Authorization: Bearer <token>
```

### Parámetros URL
- `id`: ObjectId del usuario a eliminar

### Respuesta Exitosa (200 OK)
```json
{
  "mensaje": "Usuario eliminado exitosamente",
  "usuario_id": "507f1f77bcf86cd799439012"
}
```

### Códigos de Error
- **400 Bad Request**: No se puede eliminar (ej: tiene reclamos asignados)
  ```json
  {
    "error": "No se puede eliminar el usuario",
    "razon": "El usuario tiene 5 reclamos asignados activos"
  }
  ```
- **401 Unauthorized**: Token inválido
- **403 Forbidden**: Sin permisos para eliminar usuarios
- **404 Not Found**: Usuario no encontrado
- **500 Internal Server Error**: Error del servidor

### Validaciones Backend
1. **Permisos**: Solo admins pueden eliminar usuarios
2. **Auto-eliminación**: Prevenir que un usuario se elimine a sí mismo
3. **Último admin**: No permitir eliminar el último usuario con rol admin
4. **Reclamos asignados**: Considerar reasignar o prevenir eliminación si tiene reclamos activos
5. **Eliminación lógica recomendada**: Marcar `activo: false` en lugar de eliminar físicamente

---

## 5. Sistema de Roles

### Roles Disponibles

#### 1. Admin (Administrador)
```json
{
  "valor": "admin",
  "nombre": "Administrador",
  "descripcion": "Acceso completo al sistema",
  "permisos": [
    "gestionar_usuarios",
    "gestionar_estados",
    "gestionar_configuracion",
    "ver_todos_reclamos",
    "editar_todos_reclamos",
    "eliminar_reclamos",
    "ver_reportes_completos",
    "exportar_datos"
  ]
}
```

#### 2. Manager (Gerente)
```json
{
  "valor": "manager",
  "nombre": "Gerente",
  "descripcion": "Gestión de equipos y reportes",
  "permisos": [
    "ver_usuarios_equipo",
    "asignar_reclamos",
    "ver_reclamos_departamento",
    "editar_reclamos_departamento",
    "ver_reportes_departamento",
    "exportar_reportes"
  ]
}
```

#### 3. Agent (Agente)
```json
{
  "valor": "agent",
  "nombre": "Agente",
  "descripcion": "Atención de reclamos",
  "permisos": [
    "ver_reclamos_asignados",
    "editar_reclamos_asignados",
    "cambiar_estado_reclamos",
    "agregar_comentarios",
    "cargar_archivos"
  ]
}
```

#### 4. Viewer (Observador)
```json
{
  "valor": "viewer",
  "nombre": "Observador",
  "descripcion": "Solo lectura",
  "permisos": [
    "ver_reclamos_asignados",
    "ver_reportes_basicos"
  ]
}
```

---

## 6. Modelo de Datos MongoDB

### Schema Usuario
```javascript
const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
    // Hashear con bcrypt antes de guardar
  },
  rol: {
    type: String,
    required: true,
    enum: ['admin', 'manager', 'agent', 'viewer'],
    default: 'agent'
  },
  telefono: {
    type: String,
    trim: true
  },
  departamento: {
    type: String,
    trim: true
  },
  posicion: {
    type: String,
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now
  },
  ultimo_acceso: {
    type: Date
  },
  intentos_fallidos_login: {
    type: Number,
    default: 0
  },
  bloqueado_hasta: {
    type: Date
  }
}, {
  timestamps: { 
    createdAt: 'fecha_creacion', 
    updatedAt: 'fecha_actualizacion' 
  }
});

// Índices
usuarioSchema.index({ email: 1 }, { unique: true });
usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ activo: 1 });

// Hash password antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const bcrypt = require('bcrypt');
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
```

---

## 7. Ejemplos de Implementación Backend (Express.js)

### Controlador de Usuarios

```javascript
const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

// GET /api/usuarios - Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    // Verificar permisos (solo admin o manager)
    if (!['admin', 'manager'].includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para ver usuarios' 
      });
    }

    const usuarios = await Usuario.find({ activo: true })
      .select('-password') // No enviar contraseñas
      .sort({ nombre: 1 });

    res.json({ usuarios });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios' 
    });
  }
};

// POST /api/usuarios - Crear nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    // Solo admins pueden crear usuarios
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        error: 'Solo administradores pueden crear usuarios' 
      });
    }

    const { nombre, email, password, rol, telefono, departamento, posicion } = req.body;

    // Validaciones
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos' 
      });
    }

    // Verificar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(409).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Validar rol
    const rolesValidos = ['admin', 'manager', 'agent', 'viewer'];
    if (!rolesValidos.includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido' 
      });
    }

    // Validar contraseña
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email: email.toLowerCase(),
      password, // Se hasheará automáticamente por el pre-save hook
      rol,
      telefono,
      departamento,
      posicion
    });

    await nuevoUsuario.save();

    // Responder sin contraseña
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    res.status(201).json({ 
      mensaje: 'Usuario creado exitosamente',
      usuario: usuarioRespuesta 
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario' 
    });
  }
};

// PUT /api/usuarios/:id - Actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, telefono, departamento, posicion } = req.body;

    // Verificar permisos
    const esAdmin = req.usuario.rol === 'admin';
    const esPropio = req.usuario.id === id;

    if (!esAdmin && !esPropio) {
      return res.status(403).json({ 
        error: 'No tienes permisos para actualizar este usuario' 
      });
    }

    // Solo admins pueden cambiar roles
    if (rol && !esAdmin) {
      return res.status(403).json({ 
        error: 'Solo administradores pueden cambiar roles' 
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Si cambia email, verificar que no exista
    if (email && email.toLowerCase() !== usuario.email) {
      const emailExiste = await Usuario.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: id } 
      });
      if (emailExiste) {
        return res.status(409).json({ 
          error: 'El email ya está en uso' 
        });
      }
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email.toLowerCase();
    if (rol && esAdmin) usuario.rol = rol;
    if (telefono !== undefined) usuario.telefono = telefono;
    if (departamento !== undefined) usuario.departamento = departamento;
    if (posicion !== undefined) usuario.posicion = posicion;

    await usuario.save();

    // Responder sin contraseña
    const usuarioRespuesta = usuario.toObject();
    delete usuarioRespuesta.password;

    res.json({ 
      mensaje: 'Usuario actualizado exitosamente',
      usuario: usuarioRespuesta 
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar usuario' 
    });
  }
};

// DELETE /api/usuarios/:id - Eliminar usuario (lógico)
exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Solo admins
    if (req.usuario.rol !== 'admin') {
      return res.status(403).json({ 
        error: 'Solo administradores pueden eliminar usuarios' 
      });
    }

    // No permitir auto-eliminación
    if (req.usuario.id === id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar que no sea el último admin
    if (usuario.rol === 'admin') {
      const cantidadAdmins = await Usuario.countDocuments({ 
        rol: 'admin', 
        activo: true 
      });
      if (cantidadAdmins <= 1) {
        return res.status(400).json({ 
          error: 'No se puede eliminar el último administrador' 
        });
      }
    }

    // Eliminación lógica
    usuario.activo = false;
    await usuario.save();

    res.json({ 
      mensaje: 'Usuario eliminado exitosamente',
      usuario_id: id 
    });

  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ 
      error: 'Error al eliminar usuario' 
    });
  }
};
```

### Middleware de Autenticación y Autorización

```javascript
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware para verificar token JWT
exports.verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario || !usuario.activo) {
      return res.status(401).json({ 
        error: 'Usuario no válido' 
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

// Middleware para verificar roles
exports.requiereRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    next();
  };
};
```

### Rutas

```javascript
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { verificarToken, requiereRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// GET /api/usuarios - Obtener usuarios (admin y manager)
router.get('/', 
  requiereRol('admin', 'manager'),
  usuariosController.obtenerUsuarios
);

// POST /api/usuarios - Crear usuario (solo admin)
router.post('/', 
  requiereRol('admin'),
  usuariosController.crearUsuario
);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', 
  usuariosController.actualizarUsuario
);

// DELETE /api/usuarios/:id - Eliminar usuario (solo admin)
router.delete('/:id', 
  requiereRol('admin'),
  usuariosController.eliminarUsuario
);

module.exports = router;
```

---

## 8. Seguridad y Mejores Prácticas

### Contraseñas
1. **Hash con bcrypt**: Usar salt rounds de 10 o más
2. **Validación fuerte**: Mínimo 8 caracteres, mayúsculas, números
3. **No enviar contraseñas**: Nunca incluir password en respuestas API
4. **Reset seguro**: Implementar token de recuperación con expiración

### Tokens JWT
```javascript
// Generar token al login
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario._id,
      email: usuario.email,
      rol: usuario.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes, intenta más tarde'
});

app.use('/api/usuarios', limiter);
```

### Protección contra Ataques
1. **SQL/NoSQL Injection**: Validar y sanitizar entradas
2. **XSS**: Escapar HTML en campos de texto
3. **CSRF**: Tokens CSRF en formularios
4. **Bloqueo de cuenta**: Después de N intentos fallidos

---

## 9. Testing

### Ejemplos de Tests con Jest

```javascript
describe('Usuarios API', () => {
  let adminToken;
  let userId;

  beforeAll(async () => {
    // Login como admin
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    adminToken = response.body.token;
  });

  describe('POST /api/usuarios', () => {
    it('debe crear un nuevo usuario', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass123',
          rol: 'agent'
        });

      expect(response.status).toBe(201);
      expect(response.body.usuario).toHaveProperty('_id');
      expect(response.body.usuario.email).toBe('test@example.com');
      expect(response.body.usuario).not.toHaveProperty('password');
      
      userId = response.body.usuario._id;
    });

    it('no debe crear usuario con email duplicado', async () => {
      const response = await request(app)
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Duplicate User',
          email: 'test@example.com',
          password: 'SecurePass123',
          rol: 'agent'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/usuarios', () => {
    it('debe obtener lista de usuarios', async () => {
      const response = await request(app)
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.usuarios).toBeInstanceOf(Array);
      expect(response.body.usuarios.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    it('debe actualizar un usuario', async () => {
      const response = await request(app)
        .put(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test User Updated',
          departamento: 'IT'
        });

      expect(response.status).toBe(200);
      expect(response.body.usuario.nombre).toBe('Test User Updated');
      expect(response.body.usuario.departamento).toBe('IT');
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('debe eliminar un usuario', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.mensaje).toContain('eliminado');
    });
  });
});
```

---

## 10. Variables de Entorno

```env
# .env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gestion_reclamos
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10

# Email (para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_aplicacion
```

---

## Resumen de Implementación

### Checklist Backend
- [ ] Crear modelo Usuario con schema de Mongoose
- [ ] Implementar hash de contraseñas con bcrypt
- [ ] Crear controlador con CRUD completo
- [ ] Implementar middleware de autenticación JWT
- [ ] Crear middleware de autorización por roles
- [ ] Configurar rutas con protección de permisos
- [ ] Validar datos de entrada
- [ ] Implementar eliminación lógica
- [ ] Agregar rate limiting
- [ ] Escribir tests unitarios e integración
- [ ] Documentar endpoints en Swagger/OpenAPI

### Flujo de Trabajo
1. Usuario admin inicia sesión → Recibe JWT
2. Usuario admin accede a Settings → Tab "Usuarios y Roles"
3. Clic en "Nuevo Usuario" → Formulario modal
4. Completa datos + selecciona rol → POST /api/usuarios
5. Backend valida, hashea password, crea usuario
6. Frontend recibe usuario creado → Actualiza lista
7. Usuario nuevo puede iniciar sesión con sus credenciales

---

**Fecha:** 23 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Equipo de Desarrollo
