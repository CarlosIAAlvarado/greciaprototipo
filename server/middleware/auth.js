import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token JWT válido
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No se proporcionó token de autenticación'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

/**
 * Middleware de autorización por roles
 * @param {Array} allowedRoles - Roles permitidos para acceder al endpoint
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Acceso denegado. Requiere rol: ${allowedRoles.join(' o ')}`
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Permite el acceso sin token, pero si hay token lo valida
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Ignora errores y continúa sin autenticación
    next();
  }
};
