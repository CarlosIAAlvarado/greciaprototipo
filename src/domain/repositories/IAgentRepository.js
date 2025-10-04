/**
 * Agent Repository Interface
 * Define contrato para repositorio de agentes
 * Cumple con Interface Segregation Principle (ISP)
 */
export class IAgentRepository {
  async getAll() {
    throw new Error('getAll() must be implemented');
  }

  async getById(id) {
    throw new Error('getById() must be implemented');
  }

  async getActiveAgents() {
    throw new Error('getActiveAgents() must be implemented');
  }

  async save(agent) {
    throw new Error('save() must be implemented');
  }

  async saveAll(agents) {
    throw new Error('saveAll() must be implemented');
  }

  async delete(id) {
    throw new Error('delete() must be implemented');
  }
}
