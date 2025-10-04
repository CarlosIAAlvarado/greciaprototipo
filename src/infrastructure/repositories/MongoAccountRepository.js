import { IAccountRepository } from '../../domain/repositories/IAccountRepository.js';
import { Account } from '../../domain/entities/Account.js';

/**
 * MongoDB Account Repository
 * Implementación de persistencia en MongoDB para cuentas
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class MongoAccountRepository extends IAccountRepository {
  constructor(database) {
    super();
    this.collection = database.collection('accounts');
  }

  async getAll() {
    const docs = await this.collection.find({}).toArray();
    return docs.map(doc => new Account(doc));
  }

  async getById(id) {
    const doc = await this.collection.findOne({ id });
    return doc ? new Account(doc) : null;
  }

  async getAvailableAccounts() {
    const docs = await this.collection.find({ status: 'active' }).toArray();
    return docs.map(doc => new Account(doc));
  }

  async getByAgent(agentId) {
    const docs = await this.collection.find({ assignedAgent: agentId }).toArray();
    return docs.map(doc => new Account(doc));
  }

  async save(account) {
    await this.collection.updateOne(
      { id: account.id },
      { $set: account.toJSON() },
      { upsert: true }
    );
    return account;
  }

  async saveAll(accounts) {
    const operations = accounts.map(account => ({
      updateOne: {
        filter: { id: account.id },
        update: { $set: account.toJSON() },
        upsert: true
      }
    }));

    if (operations.length > 0) {
      await this.collection.bulkWrite(operations);
    }

    return accounts;
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clear() {
    await this.collection.deleteMany({});
  }

  async count() {
    return await this.collection.countDocuments();
  }
}
