import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
export const registerRoute = (db) => {
  return async (req, res) => {
    try {
      const { username, email, password, role = 'agente', fullName } = req.body;

      // Validaciones
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email y password son requeridos'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await db.collection('users').findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Usuario o email ya existe'
        });
      }

      // Validar rol
      const validRoles = ['admin', 'supervisor', 'agente'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rol inválido. Debe ser: admin, supervisor o agente'
        });
      }

      // Hash del password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const user = {
        username,
        email,
        password: hashedPassword,
        role,
        fullName: fullName || username,
        active: true,
        createdAt: new Date(),
        lastLogin: null,
        permissions: getRolePermissions(role)
      };

      await db.collection('users').insertOne(user);

      // Generar token
      const token = jwt.sign(
        {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          permissions: user.permissions
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            permissions: user.permissions
          },
          token
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
export const loginRoute = (db) => {
  return async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username y password son requeridos'
        });
      }

      // Buscar usuario
      const user = await db.collection('users').findOne({
        $or: [{ username }, { email: username }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Verificar si está activo
      if (!user.active) {
        return res.status(401).json({
          success: false,
          error: 'Usuario desactivado. Contacte al administrador'
        });
      }

      // Verificar password
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }

      // Actualizar último login
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      );

      // Generar token
      const token = jwt.sign(
        {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
          permissions: user.permissions
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            permissions: user.permissions
          },
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
export const meRoute = (db) => {
  return async (req, res) => {
    try {
      const user = await db.collection('users').findOne(
        { _id: req.user.id },
        { projection: { password: 0 } }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
};

/**
 * Obtener permisos basados en el rol
 */
function getRolePermissions(role) {
  const permissions = {
    admin: [
      'view_all',
      'create_users',
      'edit_users',
      'delete_users',
      'view_agents',
      'create_agents',
      'edit_agents',
      'delete_agents',
      'view_accounts',
      'create_accounts',
      'edit_accounts',
      'delete_accounts',
      'execute_distribution',
      'execute_rotation',
      'view_reports',
      'export_reports',
      'view_audit_logs',
      'manage_settings'
    ],
    supervisor: [
      'view_all',
      'view_agents',
      'edit_agents',
      'view_accounts',
      'edit_accounts',
      'execute_distribution',
      'execute_rotation',
      'view_reports',
      'export_reports'
    ],
    agente: [
      'view_own_data',
      'view_assigned_accounts',
      'edit_assigned_accounts',
      'view_reports'
    ]
  };

  return permissions[role] || permissions.agente;
}

export default router;
