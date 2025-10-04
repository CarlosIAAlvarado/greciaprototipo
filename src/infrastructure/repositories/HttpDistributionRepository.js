import { IDistributionRepository } from '../../domain/repositories/IDistributionRepository.js';
import { Distribution } from '../../domain/entities/Distribution.js';

// En desarrollo usa proxy de Vite, en producción usa la URL completa del backend
const API_URL = import.meta.env.VITE_API_URL || '/api';

export class HttpDistributionRepository extends IDistributionRepository {
  async save(distribution) {
    const response = await fetch(`${API_URL}/distributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distribution.toJSON())
    });

    if (!response.ok) {
      throw new Error(`HTTP error saving distribution! status: ${response.status}`);
    }

    return distribution;
  }

  async getLatest() {
    const response = await fetch(`${API_URL}/distributions/latest`);
    const result = await response.json();
    return result.data ? new Distribution(result.data) : null;
  }

  async getHistory(limit = 10) {
    return [];
  }

  async getById(id) {
    return null;
  }

  async clear() {
    const response = await fetch(`${API_URL}/distributions`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`HTTP error clearing distributions! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Distribuciones eliminadas:', result);
    return result;
  }

  async count() {
    return 0;
  }
}
