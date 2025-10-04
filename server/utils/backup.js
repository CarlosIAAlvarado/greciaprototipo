import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(__dirname, '../../backups');
const BACKUP_ENABLED = process.env.BACKUP_ENABLED === 'true';
const BACKUP_INTERVAL = process.env.BACKUP_INTERVAL || 'daily';
const BACKUP_RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');

/**
 * Crea el directorio de backups si no existe
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`[BACKUP] Directorio de backups creado: ${BACKUP_DIR}`);
  }
}

/**
 * Realiza un backup completo de la base de datos
 */
export async function performBackup(db) {
  try {
    ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.json`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    console.log('[BACKUP] Iniciando backup de base de datos...');

    // Obtener todas las colecciones
    const collections = await db.listCollections().toArray();
    const backup = {
      timestamp: new Date(),
      database: db.databaseName,
      collections: {}
    };

    // Respaldar cada colección
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const data = await db.collection(collectionName).find({}).toArray();
      backup.collections[collectionName] = data;
      console.log(`  [OK] ${collectionName}: ${data.length} documentos`);
    }

    // Guardar backup en archivo JSON
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    // Registrar backup en base de datos
    await db.collection('backup_history').insertOne({
      fileName: backupFileName,
      filePath: backupPath,
      timestamp: new Date(),
      size: fs.statSync(backupPath).size,
      collections: Object.keys(backup.collections).length,
      status: 'completed'
    });

    console.log(`[OK] Backup completado: ${backupFileName}`);
    console.log(`[SIZE] Tamaño: ${(fs.statSync(backupPath).size / 1024).toFixed(2)} KB`);

    // Limpiar backups antiguos
    await cleanOldBackups(db);

    return {
      success: true,
      fileName: backupFileName,
      path: backupPath,
      size: fs.statSync(backupPath).size
    };
  } catch (error) {
    console.error('[ERROR] Error realizando backup:', error);

    // Registrar error
    if (db) {
      await db.collection('backup_history').insertOne({
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Restaura un backup desde un archivo
 */
export async function restoreBackup(db, backupFileName) {
  try {
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Archivo de backup no encontrado: ${backupFileName}`);
    }

    console.log(`[RESTORE] Restaurando backup: ${backupFileName}`);

    // Leer archivo de backup
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // Restaurar cada colección
    for (const [collectionName, documents] of Object.entries(backupData.collections)) {
      if (documents.length > 0) {
        // Limpiar colección actual
        await db.collection(collectionName).deleteMany({});

        // Insertar documentos del backup
        await db.collection(collectionName).insertMany(documents);

        console.log(`  [OK] ${collectionName}: ${documents.length} documentos restaurados`);
      }
    }

    // Registrar restauración
    await db.collection('backup_history').insertOne({
      action: 'restore',
      fileName: backupFileName,
      timestamp: new Date(),
      status: 'completed'
    });

    console.log(`[OK] Backup restaurado exitosamente`);

    return {
      success: true,
      fileName: backupFileName,
      collectionsRestored: Object.keys(backupData.collections).length
    };
  } catch (error) {
    console.error('[ERROR] Error restaurando backup:', error);

    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Limpia backups antiguos según la política de retención
 */
async function cleanOldBackups(db) {
  try {
    ensureBackupDir();

    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith('backup_') && file.endsWith('.json')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > retentionMs) {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`[DELETE] Backup antiguo eliminado: ${file}`);

          // Actualizar registro en base de datos
          await db.collection('backup_history').updateOne(
            { fileName: file },
            { $set: { deleted: true, deletedAt: new Date() } }
          );
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`[CLEANUP] ${deletedCount} backup(s) antiguo(s) eliminado(s)`);
    }
  } catch (error) {
    console.error('Error limpiando backups antiguos:', error);
  }
}

/**
 * Lista todos los backups disponibles
 */
export async function listBackups(db) {
  try {
    const backups = await db.collection('backup_history')
      .find({ status: 'completed', deleted: { $ne: true } })
      .sort({ timestamp: -1 })
      .toArray();

    return {
      success: true,
      data: backups
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Programa backups automáticos
 */
export function scheduleBackups(db) {
  if (!BACKUP_ENABLED) {
    console.log('[BACKUP] Backups automaticos deshabilitados');
    return null;
  }

  const intervals = {
    'hourly': 60 * 60 * 1000,
    'daily': 24 * 60 * 60 * 1000,
    'weekly': 7 * 24 * 60 * 60 * 1000
  };

  const intervalMs = intervals[BACKUP_INTERVAL] || intervals.daily;

  console.log(`[SCHEDULE] Backups automaticos programados: ${BACKUP_INTERVAL}`);

  // Realizar backup inicial
  performBackup(db);

  // Programar backups periódicos
  return setInterval(() => {
    performBackup(db);
  }, intervalMs);
}
