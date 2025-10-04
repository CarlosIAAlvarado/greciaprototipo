/**
 * Account Repository Interface
 * Define contrato para repositorio de cuentas
 * Cumple con Interface Segregation Principle (ISP)
 */
export class IAccountRepository {
  async getAll() {
    throw new Error('getAll() must be implemented');
  }

  async getById(id) {
    throw new Error('getById() must be implemented');
  }

  async getAvailableAccounts() {
    throw new Error('getAvailableAccounts() must be implemented');
  }

  async getByAgent(agentId) {
    throw new Error('getByAgent() must be implemented');
  }

  async save(account) {
    throw new Error('save() must be implemented');
  }

  async saveAll(accounts) {
    throw new Error('saveAll() must be implemented');
  }

  async delete(id) {
    throw new Error('delete() must be implemented');
  }
}
