/**
 * Middleware de auditoría
 * Registra todas las operaciones importantes del sistema
 */
export const auditLog = (db) => {
  return async (req, res, next) => {
    const startTime = Date.now();

    // Capturar respuesta original
    const originalJson = res.json.bind(res);

    res.json = function(data) {
      const duration = Date.now() - startTime;

      // Registrar auditoría
      const auditEntry = {
        timestamp: new Date(),
        method: req.method,
        path: req.path,
        userId: req.user?.id || 'anonymous',
        userRole: req.user?.role || 'none',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestBody: sanitizeBody(req.body),
        responseStatus: res.statusCode,
        responseSuccess: data?.success,
        duration: `${duration}ms`,
        action: determineAction(req.method, req.path),
        metadata: {
          query: req.query,
          params: req.params
        }
      };

      // Guardar en MongoDB (async, no bloquea respuesta)
      if (db && shouldAudit(req.path)) {
        db.collection('audit_logs').insertOne(auditEntry).catch(err => {
          console.error('Error guardando log de auditoría:', err);
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Sanitiza el body para no guardar información sensible
 */
function sanitizeBody(body) {
  if (!body) return null;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
}

/**
 * Determina la acción realizada basándose en método y ruta
 */
function determineAction(method, path) {
  const actions = {
    'POST /api/auth/login': 'LOGIN',
    'POST /api/auth/register': 'REGISTER',
    'POST /api/agents': 'CREATE_AGENTS',
    'DELETE /api/agents': 'DELETE_AGENTS',
    'POST /api/accounts': 'CREATE_ACCOUNTS',
    'DELETE /api/accounts': 'DELETE_ACCOUNTS',
    'POST /api/distributions': 'CREATE_DISTRIBUTION',
    'GET /api/distributions/latest': 'VIEW_DISTRIBUTION'
  };

  const key = `${method} ${path}`;
  return actions[key] || `${method} ${path}`;
}

/**
 * Determina si una ruta debe auditarse
 */
function shouldAudit(path) {
  const excludedPaths = ['/api/health', '/api/ping'];
  return !excludedPaths.includes(path);
}

/**
 * Obtener logs de auditoría con filtros
 */
export const getAuditLogs = async (db, filters = {}) => {
  const {
    userId,
    action,
    startDate,
    endDate,
    limit = 100,
    skip = 0
  } = filters;

  const query = {};

  if (userId) query.userId = userId;
  if (action) query.action = action;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  return await db.collection('audit_logs')
    .find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
};
