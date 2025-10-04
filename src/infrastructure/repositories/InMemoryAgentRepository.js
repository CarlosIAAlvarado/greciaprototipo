import { IAgentRepository } from '../../domain/repositories/IAgentRepository.js';

/**
 * In-Memory Agent Repository
 * Implementación en memoria para prototipo/demo
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class InMemoryAgentRepository extends IAgentRepository {
  constructor() {
    super();
    this.agents = new Map();
  }

  async getAll() {
    return Array.from(this.agents.values());
  }

  async getById(id) {
    return this.agents.get(id) || null;
  }

  async getActiveAgents() {
    return Array.from(this.agents.values()).filter(agent => agent.isActive());
  }

  async save(agent) {
    this.agents.set(agent.id, agent);
    return agent;
  }

  async saveAll(agents) {
    agents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
    return agents;
  }

  async delete(id) {
    return this.agents.delete(id);
  }

  async clear() {
    this.agents.clear();
  }

  async count() {
    return this.agents.size;
  }
}
