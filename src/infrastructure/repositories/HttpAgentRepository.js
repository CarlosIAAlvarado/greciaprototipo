import { IAgentRepository } from '../../domain/repositories/IAgentRepository.js';
import { Agent } from '../../domain/entities/Agent.js';

// En desarrollo usa proxy de Vite, en producción usa la URL completa del backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

export class HttpAgentRepository extends IAgentRepository {
  async getAll() {
    const response = await fetch(`${API_URL}/agents`);
    const result = await response.json();
    return result.data.map(doc => new Agent(doc));
  }

  async getById(id) {
    const agents = await this.getAll();
    return agents.find(a => a.id === id) || null;
  }

  async getActiveAgents() {
    const agents = await this.getAll();
    return agents.filter(a => a.isActive());
  }

  async save(agent) {
    await this.saveAll([agent]);
    return agent;
  }

  async saveAll(agents) {
    const response = await fetch(`${API_URL}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agents.map(a => a.toJSON()))
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return agents;
  }

  async delete(id) {
    return true;
  }

  async clear() {
    const response = await fetch(`${API_URL}/agents`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`HTTP error clearing agents! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Agentes eliminados:', result);
    return result;
  }

  async count() {
    const agents = await this.getAll();
    return agents.length;
  }
}
