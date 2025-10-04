import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Importar middlewares y rutas
import { authenticate, authorize } from './middleware/auth.js';
import { auditLog, getAuditLogs } from './middleware/audit.js';
import { registerRoute, loginRoute, meRoute } from './routes/auth.js';
import { scheduleBackups, performBackup, restoreBackup, listBackups } from './utils/backup.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// CORS con orígenes permitidos
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'distribucion_cuentas';
const DEV_MODE = process.env.NODE_ENV !== 'production';

let db = null;

// Middleware condicional de autenticación (solo en producción)
const optionalAuth = (req, res, next) => {
  if (DEV_MODE) {
    // En desarrollo, saltamos la autenticación
    next();
  } else {
    // En producción, requerimos autenticación
    authenticate(req, res, next);
  }
};

const optionalAuthorize = (...roles) => {
  return (req, res, next) => {
    if (DEV_MODE) {
      // En desarrollo, saltamos la autorización
      next();
    } else {
      // En producción, requerimos autorización
      authorize(...roles)(req, res, next);
    }
  };
};

async function connectToMongoDB() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI no está configurado en las variables de entorno');
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);

    // Crear índices
    await db.collection('agents').createIndex({ id: 1 }, { unique: true });
    await db.collection('accounts').createIndex({ id: 1 }, { unique: true });
    await db.collection('distributions').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
    await db.collection('audit_logs').createIndex({ userId: 1 });

    console.log('[OK] Conectado exitosamente a MongoDB Atlas');
    console.log(`[DB] Base de datos: ${DB_NAME}`);

    return db;
  } catch (error) {
    console.error('[ERROR] Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Middleware de auditoría (aplicar globalmente)
app.use((req, res, next) => {
  if (db) {
    auditLog(db)(req, res, next);
  } else {
    next();
  }
});

// ==================== RUTAS PÚBLICAS ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db ? 'connected' : 'disconnected',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de autenticación (públicas)
app.post('/api/auth/register', (req, res) => registerRoute(db)(req, res));
app.post('/api/auth/login', (req, res) => loginRoute(db)(req, res));

// ==================== RUTAS PROTEGIDAS ====================

// Obtener usuario autenticado
app.get('/api/auth/me', authenticate, (req, res) => meRoute(db)(req, res));

// Agentes (autenticación opcional en desarrollo)
app.get('/api/agents', optionalAuth, async (req, res) => {
  try {
    const agents = await db.collection('agents').find({}).toArray();
    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/agents', optionalAuth, optionalAuthorize('admin', 'supervisor'), async (req, res) => {
  try {
    const agents = req.body;
    const operations = agents.map(agent => ({
      updateOne: {
        filter: { id: agent.id },
        update: { $set: agent },
        upsert: true
      }
    }));

    await db.collection('agents').bulkWrite(operations);
    res.json({ success: true, count: agents.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/agents', optionalAuth, optionalAuthorize('admin'), async (req, res) => {
  try {
    await db.collection('agents').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cuentas (autenticación opcional en desarrollo)
app.get('/api/accounts', optionalAuth, async (req, res) => {
  try {
    const accounts = await db.collection('accounts').find({}).toArray();
    res.json({ success: true, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/accounts', optionalAuth, optionalAuthorize('admin', 'supervisor'), async (req, res) => {
  try {
    const accounts = req.body;
    const operations = accounts.map(account => ({
      updateOne: {
        filter: { id: account.id },
        update: { $set: account },
        upsert: true
      }
    }));

    await db.collection('accounts').bulkWrite(operations);
    res.json({ success: true, count: accounts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/accounts', optionalAuth, optionalAuthorize('admin'), async (req, res) => {
  try {
    await db.collection('accounts').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Distribuciones (autenticación opcional en desarrollo)
app.get('/api/distributions/latest', optionalAuth, async (req, res) => {
  try {
    const distribution = await db.collection('distributions')
      .find({})
      .sort({ distributionDate: -1 })
      .limit(1)
      .toArray();

    res.json({ success: true, data: distribution[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/distributions', optionalAuth, optionalAuthorize('admin', 'supervisor'), async (req, res) => {
  try {
    const distribution = req.body;
    await db.collection('distributions').updateOne(
      { id: distribution.id },
      { $set: distribution },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/distributions', optionalAuth, optionalAuthorize('admin'), async (req, res) => {
  try {
    await db.collection('distributions').deleteMany({});
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== RUTAS DE AUDITORÍA ====================

app.get('/api/audit-logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const filters = {
      userId: req.query.userId,
      action: req.query.action,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: parseInt(req.query.limit) || 100,
      skip: parseInt(req.query.skip) || 0
    };

    const logs = await getAuditLogs(db, filters);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== RUTAS DE BACKUP ====================

app.post('/api/backup/create', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await performBackup(db);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/backup/restore', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ success: false, error: 'fileName es requerido' });
    }

    const result = await restoreBackup(db, fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/backup/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await listBackups(db);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== INICIALIZACIÓN ====================

connectToMongoDB().then((database) => {
  db = database;

  // Programar backups automáticos
  scheduleBackups(db);

  app.listen(PORT, () => {
    console.log(`\n[SERVER] Servidor API corriendo en http://localhost:${PORT}`);
    console.log(`[DB] Base de datos: ${DB_NAME}`);
    console.log(`[MODE] Modo: ${DEV_MODE ? 'DESARROLLO (sin autenticacion)' : 'PRODUCCION (con autenticacion)'}`);
    console.log(`[SECURITY] Seguridad: ${DEV_MODE ? 'Deshabilitada en desarrollo' : 'JWT Habilitado'}`);
    console.log(`[AUDIT] Auditoria: Activada`);
    console.log(`[BACKUP] Backups: ${process.env.BACKUP_ENABLED === 'true' ? 'Activados' : 'Desactivados'}`);
    console.log(`\n[OK] Sistema listo para usar\n`);
  });
});
