# 🔧 Modo Desarrollo vs Producción

## Resumen

El sistema ahora soporta **dos modos de operación**:

1. **🟡 Modo Desarrollo** - Sin autenticación (para pruebas y desarrollo)
2. **🔴 Modo Producción** - Con autenticación completa (para despliegue)

---

## 🟡 Modo Desarrollo (Por Defecto)

### Características

- ✅ **Sin autenticación requerida**
- ✅ Todas las rutas accesibles sin token
- ✅ Ideal para prototipos y demos
- ✅ Iniciado con `npm run dev` o `npm run server`

### Cómo Usar

```bash
# 1. Iniciar frontend
npm run dev

# 2. Iniciar backend (en otra terminal)
npm run server
```

**Salida del servidor:**
```
🚀 Servidor API corriendo en http://localhost:3002
📊 Base de datos: distribucion_cuentas
🔧 Modo: 🟡 DESARROLLO (sin autenticación)
🔒 Seguridad: Deshabilitada en desarrollo
📝 Auditoría: Activada
💾 Backups: Activados

✨ Sistema listo para usar
```

### Acceso a Rutas

En modo desarrollo, todas las rutas funcionan **sin token**:

```bash
# Obtener agentes (sin autenticación)
curl http://localhost:3002/api/agents

# Crear distribución (sin autenticación)
curl -X POST http://localhost:3002/api/distributions \
  -H "Content-Type: application/json" \
  -d '{"...":"..."}'
```

---

## 🔴 Modo Producción

### Características

- ✅ **Autenticación JWT obligatoria**
- ✅ Sistema de roles (Admin/Supervisor/Agente)
- ✅ Auditoría completa
- ✅ Backups automáticos
- ✅ CORS restrictivo

### Cómo Activar

Configurar en `.env`:
```env
NODE_ENV=production
```

O iniciar con variable de entorno:
```bash
NODE_ENV=production npm run server
```

**Salida del servidor:**
```
🚀 Servidor API corriendo en http://localhost:3002
📊 Base de datos: distribucion_cuentas
🔧 Modo: 🔴 PRODUCCIÓN (con autenticación)
🔒 Seguridad: JWT Habilitado
📝 Auditoría: Activada
💾 Backups: Activados

✨ Sistema listo para usar
```

### Inicialización

1. **Crear usuario admin:**
```bash
npm run init-admin
```

2. **Iniciar servidor:**
```bash
NODE_ENV=production npm run server
```

3. **Login:**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
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

4. **Usar token:**
```bash
curl http://localhost:3002/api/agents \
  -H "Authorization: Bearer {token}"
```

---

## 📊 Comparación de Modos

| Característica | Desarrollo 🟡 | Producción 🔴 |
|---------------|---------------|---------------|
| Autenticación | ❌ No requerida | ✅ Obligatoria |
| Tokens JWT | ❌ Opcional | ✅ Requerido |
| Roles y permisos | ❌ Deshabilitado | ✅ Activo |
| Inicio rápido | ✅ `npm run dev` | ⚙️ Configuración manual |
| Usuario admin | ❌ No necesario | ✅ Requerido |
| CORS | ✅ Permisivo | 🔒 Restrictivo |
| Uso ideal | Desarrollo/Demo | Producción |

---

## 🚀 Flujo de Trabajo Recomendado

### Para Desarrollo y Pruebas

1. **Modo por defecto (desarrollo):**
```bash
npm run dev      # Terminal 1 - Frontend
npm run server   # Terminal 2 - Backend
```

2. **Acceder a:** `http://localhost:5173`

3. **Usar sin autenticación** ✅

### Para Producción

1. **Configurar `.env`:**
```env
NODE_ENV=production
JWT_SECRET=tu_clave_super_secreta_cambiar_esto
ALLOWED_ORIGINS=https://tudominio.com
```

2. **Inicializar admin:**
```bash
npm run init-admin
```

3. **Iniciar en modo producción:**
```bash
npm run server
```

4. **Usar con autenticación** 🔒

---

## 🔄 Cambiar de Modo

### De Desarrollo a Producción

1. Editar `.env`:
```env
NODE_ENV=production
```

2. Reiniciar servidor:
```bash
npm run server
```

### De Producción a Desarrollo

1. Editar `.env`:
```env
NODE_ENV=development
# o simplemente comentar/eliminar la línea
```

2. Reiniciar servidor:
```bash
npm run server
```

---

## ⚠️ Advertencias de Seguridad

### ❌ NO USAR Modo Desarrollo en Producción

**Nunca desplegar con `NODE_ENV=development`:**
- Sin autenticación = acceso total sin restricciones
- Cualquiera puede modificar/eliminar datos
- Sin control de permisos
- Riesgo de seguridad crítico

### ✅ Siempre Usar Modo Producción en Despliegues

**Para despliegues en servidores:**
```env
NODE_ENV=production
JWT_SECRET=clave_muy_segura_y_aleatoria
ALLOWED_ORIGINS=https://app.tudominio.com
```

---

## 🛠️ Troubleshooting

### Problema: "Token inválido" en desarrollo

**Solución:** Verificar que `NODE_ENV` no esté configurado como `production`

```bash
# Ver variable
echo $NODE_ENV  # Linux/Mac
echo %NODE_ENV% # Windows

# Si está en production, cambiar a development en .env
```

### Problema: Rutas accesibles sin token en producción

**Solución:** Verificar que `NODE_ENV=production` esté configurado

```bash
# Verificar en .env
cat .env | grep NODE_ENV

# Debe mostrar:
NODE_ENV=production
```

### Problema: Sistema no inicia

**Solución:** Verificar que `.env` existe y contiene `MONGO_URI`

```bash
# Copiar plantilla
cp .env.example .env

# Editar con tus credenciales
nano .env
```

---

## 📚 Referencias

- [Documentación de Seguridad](SECURITY.md)
- [Changelog de Seguridad](CHANGELOG_SECURITY.md)
- [README Principal](README.md)

---

**Última actualización:** Enero 2025
