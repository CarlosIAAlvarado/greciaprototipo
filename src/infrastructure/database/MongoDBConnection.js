import { MongoClient } from 'mongodb';

/**
 * MongoDB Connection Manager
 * Gestiona la conexión a MongoDB Atlas
 */
class MongoDBConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.uri = 'mongodb+srv://calvarado:Andresito111@ivy.beuwz4f.mongodb.net/?retryWrites=true&w=majority&appName=ivy';
    this.dbName = 'distribucion_cuentas';
  }

  async connect() {
    try {
      if (this.client && this.db) {
        return this.db;
      }

      console.log('Conectando a MongoDB Atlas...');

      this.client = new MongoClient(this.uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
      });

      await this.client.connect();

      this.db = this.client.db(this.dbName);

      console.log('Conexión exitosa a MongoDB Atlas');

      await this.createIndexes();

      return this.db;
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      const agentsCollection = this.db.collection('agents');
      await agentsCollection.createIndex({ id: 1 }, { unique: true });
      await agentsCollection.createIndex({ active: 1 });
      await agentsCollection.createIndex({ currentRanking: 1 });

      const accountsCollection = this.db.collection('accounts');
      await accountsCollection.createIndex({ id: 1 }, { unique: true });
      await accountsCollection.createIndex({ assignedAgent: 1 });
      await accountsCollection.createIndex({ status: 1 });

      const distributionsCollection = this.db.collection('distributions');
      await distributionsCollection.createIndex({ id: 1 }, { unique: true });
      await distributionsCollection.createIndex({ distributionDate: -1 });

      console.log('Índices creados correctamente');
    } catch (error) {
      console.error('Error creando índices:', error);
    }
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Desconectado de MongoDB');
    }
  }
}

export const mongoConnection = new MongoDBConnection();
