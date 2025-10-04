import { Distribution } from '../entities/Distribution.js';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Distribution Service
 * Servicio de aplicación que orquesta la distribución de cuentas
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class DistributionService {
  constructor(distributionStrategy, accountRepository, agentRepository, distributionRepository) {
    this.distributionStrategy = distributionStrategy;
    this.accountRepository = accountRepository;
    this.agentRepository = agentRepository;
    this.distributionRepository = distributionRepository;
  }

  /**
   * Ejecuta distribución de cuentas
   * @param {Object} parameters - Parámetros de distribución
   * @returns {Distribution}
   */
  async executeDistribution(parameters = {}) {
    const accounts = await this.accountRepository.getAvailableAccounts();
    // Usar TODOS los agentes de la tabla, no solo los activos
    const agents = await this.agentRepository.getAll();

    const assignments = this.distributionStrategy.distribute(accounts, agents, parameters);

    const distribution = new Distribution({
      id: generateUUID(),
      distributionDate: new Date(),
      type: parameters.type || 'initial',
      assignments: assignments,
      parameters: {
        equitablePercentage: this.distributionStrategy.equitablePercentage,
        rankingPercentage: this.distributionStrategy.rankingPercentage,
        weightingSystem: 'linear'
      }
    });

    await this.distributionRepository.save(distribution);
    await this.accountRepository.saveAll(accounts);

    return distribution;
  }

  /**
   * Obtiene última distribución
   */
  async getLatestDistribution() {
    return await this.distributionRepository.getLatest();
  }

  /**
   * Obtiene historial de distribuciones
   */
  async getDistributionHistory(limit = 10) {
    return await this.distributionRepository.getHistory(limit);
  }
}
