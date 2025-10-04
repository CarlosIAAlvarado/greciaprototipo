# 🔒 Documentación de Seguridad

## Sistema de Distribución Híbrida de Cuentas v2.0

---

## 📋 Índice

1. [Resumen de Seguridad](#resumen-de-seguridad)
2. [Autenticación](#autenticación)
3. [Autorización y Roles](#autorización-y-roles)
4. [Sistema de Auditoría](#sistema-de-auditoría)
5. [Backups Automáticos](#backups-automáticos)
6. [Variables de Entorno](#variables-de-entorno)
7. [Mejores Prácticas](#mejores-prácticas)

---

## 🛡️ Resumen de Seguridad

### Características Implementadas

- ✅ **Autenticación JWT**: Tokens seguros con expiración configurable
- ✅ **Sistema de Roles**: Admin, Supervisor, Agente
- ✅ **Auditoría Completa**: Registro de todas las operaciones
- ✅ **Backups Automáticos**: Respaldo programado de datos
- ✅ **CORS Configurado**: Orígenes permitidos controlados
- ✅ **Passwords Hasheados**: bcrypt con salt rounds
- ✅ **Variables de Entorno**: Credenciales protegidas

---

## 🔐 Autenticación

### Endpoints de Autenticación

#### 1. Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "usuario@ejemplo.com",
  "password": "Password123!",
  "fullName": "Nombre Completo",
  "role": "agente"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "username": "usuario",
      "email": "usuario@ejemplo.com",
      "role": "agente",
      "permissions": [...]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Inicio de Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Obtener Usuario Actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Uso del Token

Todas las rutas protegidas requieren el header de autorización:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Expiración del Token

- **Por defecto**: 24 horas
- **Configurable** en `.env`: `JWT_EXPIRES_IN=24h`
- Opciones: `1h`, `12h`, `24h`, `7d`, etc.

---

## 👥 Autorización y Roles

### Roles Disponibles

#### 1. **Admin** (Administrador)
- Control total del sistema
- Gestión de usuarios
- Acceso a auditoría
- Gestión de backups

**Permisos:**
- `view_all`
- `create_users`, `edit_users`, `delete_users`
- `create_agents`, `edit_agents`, `delete_agents`
- `create_accounts`, `edit_accounts`, `delete_accounts`
- `execute_distribution`, `execute_rotation`
- `view_reports`, `export_reports`
- `view_audit_logs`
- `manage_settings`

#### 2. **Supervisor**
- Gestión de agentes y cuentas
- Ejecución de distribuciones
- Visualización de reportes

**Permisos:**
- `view_all`
- `view_agents`, `edit_agents`
- `view_accounts`, `edit_accounts`
- `execute_distribution`, `execute_rotation`
- `view_reports`, `export_reports`

#### 3. **Agente**
- Solo visualiza sus datos
- Acceso limitado a cuentas asignadas

**Permisos:**
- `view_own_data`
- `view_assigned_accounts`
- `edit_assigned_accounts`
- `view_reports`

### Matriz de Permisos

| Operación | Admin | Supervisor | Agente |
|-----------|-------|------------|--------|
| Ver todos los datos | ✅ | ✅ | ❌ |
| Crear usuarios | ✅ | ❌ | ❌ |
| Gestionar agentes | ✅ | ✅ | ❌ |
| Gestionar cuentas | ✅ | ✅ | ❌ |
| Ejecutar distribución | ✅ | ✅ | ❌ |
| Ver logs de auditoría | ✅ | ❌ | ❌ |
| Crear backups | ✅ | ❌ | ❌ |
| Ver sus cuentas | ✅ | ✅ | ✅ |

### Protección de Rutas

Las rutas están protegidas con middlewares:

```javascript
// Solo autenticación
app.get('/api/agents', authenticate, handler);

// Autenticación + Roles específicos
app.post('/api/agents', authenticate, authorize('admin', 'supervisor'), handler);

// Solo admins
app.delete('/api/agents', authenticate, authorize('admin'), handler);
```

---

## 📝 Sistema de Auditoría

### Características

- ✅ Registro automático de todas las operaciones
- ✅ Información del usuario (ID, rol)
- ✅ Timestamp preciso
- ✅ IP y User-Agent
- ✅ Request y Response sanitizados
- ✅ Duración de la operación

### Estructura de Log de Auditoría

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "method": "POST",
  "path": "/api/distributions",
  "userId": "user_id_123",
  "userRole": "admin",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestBody": { ... },
  "responseStatus": 200,
  "responseSuccess": true,
  "duration": "125ms",
  "action": "CREATE_DISTRIBUTION",
  "metadata": {
    "query": {},
    "params": {}
  }
}
```

### Consultar Logs de Auditoría

```http
GET /api/audit-logs?userId=123&action=LOGIN&startDate=2024-01-01&limit=100
Authorization: Bearer {admin_token}
```

**Solo admins** pueden acceder a los logs de auditoría.

### Datos Sanitizados

Los siguientes campos se ocultan en los logs:
- `password` → `***REDACTED***`
- `token` → `***REDACTED***`
- `secret` → `***REDACTED***`
- `apiKey` → `***REDACTED***`

---

## 💾 Backups Automáticos

### Configuración

En `.env`:
```env
BACKUP_ENABLED=true
BACKUP_INTERVAL=daily
BACKUP_RETENTION_DAYS=30
```

### Opciones de Intervalo

- `hourly` - Cada hora
- `daily` - Diario (recomendado)
- `weekly` - Semanal

### Rutas de Backup (Solo Admin)

#### Crear Backup Manual
```http
POST /api/backup/create
Authorization: Bearer {admin_token}
```

#### Listar Backups
```http
GET /api/backup/list
Authorization: Bearer {admin_token}
```

#### Restaurar Backup
```http
POST /api/backup/restore
Content-Type: application/json
Authorization: Bearer {admin_token}

{
  "fileName": "backup_2024-01-15T10-30-00.json"
}
```

### Ubicación de Backups

```
/backups
  ├── backup_2024-01-15T10-30-00.json
  ├── backup_2024-01-14T10-30-00.json
  └── ...
```

### Limpieza Automática

Los backups se eliminan automáticamente después de `BACKUP_RETENTION_DAYS`.

---

## 🔑 Variables de Entorno

### Configuración Requerida

Crear archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
DB_NAME=distribucion_cuentas

# Server Configuration
PORT=3002
NODE_ENV=production

# JWT Configuration
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=https://tudominio.com,https://app.tudominio.com

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL=daily
BACKUP_RETENTION_DAYS=30
```

### ⚠️ IMPORTANTE

1. **NUNCA** commitear el archivo `.env` al repositorio
2. Usar `.env.example` como plantilla
3. Cambiar `JWT_SECRET` en producción
4. Usar contraseñas fuertes para MongoDB
5. Limitar `ALLOWED_ORIGINS` a dominios de confianza

---

## 🛠️ Mejores Prácticas

### 1. Seguridad de Passwords

✅ **Recomendaciones:**
- Mínimo 8 caracteres
- Combinar mayúsculas, minúsculas, números y símbolos
- Cambiar password por defecto del admin

❌ **Evitar:**
- Passwords comunes: `123456`, `password`, `admin`
- Reutilizar passwords
- Compartir credenciales

### 2. Tokens JWT

✅ **Hacer:**
- Almacenar en localStorage/sessionStorage del cliente
- Incluir en header `Authorization: Bearer {token}`
- Renovar antes de expirar

❌ **No hacer:**
- Almacenar en cookies sin `httpOnly`
- Compartir tokens entre usuarios
- Usar tokens expirados

### 3. CORS

En producción, especificar dominios exactos:
```env
ALLOWED_ORIGINS=https://app.tudominio.com
```

NO usar `*` en producción.

### 4. HTTPS

En producción, **siempre** usar HTTPS:
- Protege credenciales en tránsito
- Previene ataques man-in-the-middle
- Requerido para cookies seguras

### 5. Logs de Auditoría

- Revisar regularmente
- Detectar actividad sospechosa
- Mantener por tiempo legal requerido
- Exportar para análisis forense

### 6. Backups

- Probar restauración periódicamente
- Almacenar en ubicación segura
- Encriptar backups sensibles
- Mantener múltiples versiones

---

## 🚀 Inicialización del Sistema

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Crear Usuario Admin

```bash
node server/scripts/init-admin.js
```

**Salida esperada:**
```
✅ Usuario administrador creado exitosamente!

📋 Credenciales de acceso:
   ================================
   Usuario:   admin
   Password:  Admin123!
   Email:     admin@sistema.com
   Rol:       admin
   ================================

⚠️  IMPORTANTE: Cambie la contraseña después del primer login
```

### 4. Iniciar Servidor

```bash
npm run server
```

**Salida esperada:**
```
🚀 Servidor API corriendo en http://localhost:3002
📊 Base de datos: distribucion_cuentas
🔒 Seguridad: JWT Habilitado
📝 Auditoría: Activada
💾 Backups: Activados

✨ Sistema listo para usar
```

---

## 🐛 Troubleshooting

### Error: "MONGO_URI no está configurado"

**Solución:** Verificar que `.env` existe y contiene `MONGO_URI`

### Error: "Token inválido"

**Solución:**
- Verificar que el token no ha expirado
- Usar header correcto: `Authorization: Bearer {token}`

### Error: "Acceso denegado"

**Solución:**
- Verificar que el usuario tiene el rol adecuado
- Revisar matriz de permisos

### Backups no se crean

**Solución:**
- Verificar `BACKUP_ENABLED=true` en `.env`
- Verificar permisos de escritura en carpeta `/backups`

---

## 📞 Soporte

Para reportar problemas de seguridad:
- Email: security@sistema.com
- Reportar vulnerabilidades de forma responsable
- NO publicar vulnerabilidades en issues públicos

---

## 📄 Licencia

MIT - Ver LICENSE para más detalles

---

**Última actualización:** Enero 2024
**Versión del sistema:** 2.0.0
