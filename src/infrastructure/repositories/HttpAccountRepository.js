import { IAccountRepository } from '../../domain/repositories/IAccountRepository.js';
import { Account } from '../../domain/entities/Account.js';

// Usar ruta relativa para que funcione con el proxy de Vite
const API_URL = '/api';

export class HttpAccountRepository extends IAccountRepository {
  async getAll() {
    const response = await fetch(`${API_URL}/accounts`);
    const result = await response.json();
    return result.data.map(doc => new Account(doc));
  }

  async getById(id) {
    const accounts = await this.getAll();
    return accounts.find(a => a.id === id) || null;
  }

  async getAvailableAccounts() {
    const accounts = await this.getAll();
    return accounts.filter(a => a.isActive());
  }

  async getByAgent(agentId) {
    const accounts = await this.getAll();
    return accounts.filter(a => a.assignedAgent === agentId);
  }

  async save(account) {
    await this.saveAll([account]);
    return account;
  }

  async saveAll(accounts) {
    const CHUNK_SIZE = 100;
    const chunks = [];

    for (let i = 0; i < accounts.length; i += CHUNK_SIZE) {
      chunks.push(accounts.slice(i, i + CHUNK_SIZE));
    }

    console.log(`Guardando ${accounts.length} cuentas en ${chunks.length} lotes de ${CHUNK_SIZE}...`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Guardando lote ${i + 1}/${chunks.length} (${chunk.length} cuentas)...`);

      const response = await fetch(`${API_URL}/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map(a => a.toJSON()))
      });

      if (!response.ok) {
        throw new Error(`HTTP error saving accounts! status: ${response.status}`);
      }
    }

    console.log('Todas las cuentas guardadas exitosamente');
    return accounts;
  }

  async delete(id) {
    return true;
  }

  async clear() {
    const response = await fetch(`${API_URL}/accounts`, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`HTTP error clearing accounts! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Cuentas eliminadas:', result);
    return result;
  }

  async count() {
    const accounts = await this.getAll();
    return accounts.length;
  }
}
