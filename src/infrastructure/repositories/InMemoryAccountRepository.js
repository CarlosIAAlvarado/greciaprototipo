import { IAccountRepository } from '../../domain/repositories/IAccountRepository.js';

/**
 * In-Memory Account Repository
 * Implementación en memoria para prototipo/demo
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class InMemoryAccountRepository extends IAccountRepository {
  constructor() {
    super();
    this.accounts = new Map();
  }

  async getAll() {
    return Array.from(this.accounts.values());
  }

  async getById(id) {
    return this.accounts.get(id) || null;
  }

  async getAvailableAccounts() {
    return Array.from(this.accounts.values())
      .filter(account => account.isActive());
  }

  async getByAgent(agentId) {
    return Array.from(this.accounts.values())
      .filter(account => account.assignedAgent === agentId);
  }

  async save(account) {
    this.accounts.set(account.id, account);
    return account;
  }

  async saveAll(accounts) {
    accounts.forEach(account => {
      this.accounts.set(account.id, account);
    });
    return accounts;
  }

  async delete(id) {
    return this.accounts.delete(id);
  }

  async clear() {
    this.accounts.clear();
  }

  async count() {
    return this.accounts.size;
  }
}
