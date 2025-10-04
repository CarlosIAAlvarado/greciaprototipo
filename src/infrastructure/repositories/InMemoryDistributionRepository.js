import { IDistributionRepository } from '../../domain/repositories/IDistributionRepository.js';

/**
 * In-Memory Distribution Repository
 * Implementación en memoria para prototipo/demo
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class InMemoryDistributionRepository extends IDistributionRepository {
  constructor() {
    super();
    this.distributions = new Map();
    this.history = [];
  }

  async save(distribution) {
    this.distributions.set(distribution.id, distribution);
    this.history.unshift(distribution);

    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }

    return distribution;
  }

  async getLatest() {
    return this.history[0] || null;
  }

  async getHistory(limit = 10) {
    return this.history.slice(0, limit);
  }

  async getById(id) {
    return this.distributions.get(id) || null;
  }

  async clear() {
    this.distributions.clear();
    this.history = [];
  }

  async count() {
    return this.distributions.size;
  }
}
