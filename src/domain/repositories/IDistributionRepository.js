/**
 * Distribution Repository Interface
 * Define contrato para repositorio de distribuciones
 * Cumple con Interface Segregation Principle (ISP)
 */
export class IDistributionRepository {
  async save(distribution) {
    throw new Error('save() must be implemented');
  }

  async getLatest() {
    throw new Error('getLatest() must be implemented');
  }

  async getHistory(limit) {
    throw new Error('getHistory() must be implemented');
  }

  async getById(id) {
    throw new Error('getById() must be implemented');
  }
}
