import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'distribucion_cuentas';

async function createAdminUser() {
  let client;

  try {
    console.log('[INIT] Inicializando usuario administrador...\n');

    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);

    // Verificar si ya existe un admin
    const existingAdmin = await db.collection('users').findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('[WARNING] Ya existe un usuario administrador:');
      console.log(`   Usuario: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}\n`);
      process.exit(0);
    }

    // Crear usuario admin por defecto
    const adminUser = {
      username: 'admin',
      email: 'admin@sistema.com',
      password: await bcrypt.hash('Admin123!', 10),
      role: 'admin',
      fullName: 'Administrador del Sistema',
      active: true,
      createdAt: new Date(),
      lastLogin: null,
      permissions: [
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
      ]
    };

    await db.collection('users').insertOne(adminUser);

    console.log('[OK] Usuario administrador creado exitosamente!\n');
    console.log('[CREDENTIALS] Credenciales de acceso:');
    console.log('   ================================');
    console.log('   Usuario:   admin');
    console.log('   Password:  Admin123!');
    console.log('   Email:     admin@sistema.com');
    console.log('   Rol:       admin');
    console.log('   ================================\n');
    console.log('[WARNING] IMPORTANTE: Cambie la contraseña despues del primer login\n');

  } catch (error) {
    console.error('[ERROR] Error creando usuario administrador:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

createAdminUser();
