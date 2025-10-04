/**
 * Rotation Service
 * Servicio responsable de la rotación periódica de cuentas
 * Cumple con Single Responsibility Principle (SRP)
 */
export class RotationService {
  constructor(distributionService, accountRepository, agentRepository) {
    this.distributionService = distributionService;
    this.accountRepository = accountRepository;
    this.agentRepository = agentRepository;
    this.rotationPercentage = 0.2;
  }

  /**
   * Ejecuta rotación de cuentas
   * @param {Object} options - Opciones de rotación
   * @returns {Distribution}
   */
  async executeRotation(options = {}) {
    const {
      rotationType = 'partial',
      percentage = this.rotationPercentage
    } = options;

    switch (rotationType) {
      case 'full':
        return await this.fullRotation();
      case 'partial':
        return await this.partialRotation(percentage);
      case 'performance_based':
        return await this.performanceBasedRotation();
      default:
        throw new Error(`Unknown rotation type: ${rotationType}`);
    }
  }

  /**
   * Rotación completa - redistribuye todas las cuentas
   */
  async fullRotation() {
    const accounts = await this.accountRepository.getAll();

    accounts.forEach(account => {
      account.assignedAgent = null;
      account.assignmentDate = null;
    });

    await this.accountRepository.saveAll(accounts);

    return await this.distributionService.executeDistribution({ type: 'full_rotation' });
  }

  /**
   * Rotación parcial - rota un porcentaje de cuentas
   */
  async partialRotation(percentage) {
    const agents = await this.agentRepository.getAll();
    const accountsToRotate = [];

    for (const agent of agents) {
      const agentAccounts = await this.accountRepository.getByAgent(agent.id);
      const lowValueAccounts = this.selectLowValueAccounts(agentAccounts, percentage);
      accountsToRotate.push(...lowValueAccounts);
    }

    accountsToRotate.forEach(account => {
      account.assignedAgent = null;
      account.assignmentDate = null;
    });

    await this.accountRepository.saveAll(accountsToRotate);

    return await this.distributionService.executeDistribution({
      type: 'partial_rotation',
      rotatedAccounts: accountsToRotate.length
    });
  }

  /**
   * Rotación basada en desempeño
   * Rota más cuentas de agentes con bajo rendimiento
   */
  async performanceBasedRotation() {
    const agents = await this.agentRepository.getAll();
    const accountsToRotate = [];

    for (const agent of agents) {
      const agentAccounts = await this.accountRepository.getByAgent(agent.id);
      const rotationRate = this.calculateRotationRate(agent);
      const accountsCount = Math.floor(agentAccounts.length * rotationRate);

      const selectedAccounts = this.selectLowValueAccounts(agentAccounts, accountsCount / agentAccounts.length);
      accountsToRotate.push(...selectedAccounts);
    }

    accountsToRotate.forEach(account => {
      account.assignedAgent = null;
      account.assignmentDate = null;
    });

    await this.accountRepository.saveAll(accountsToRotate);

    return await this.distributionService.executeDistribution({
      type: 'performance_rotation',
      rotatedAccounts: accountsToRotate.length
    });
  }

  /**
   * Selecciona cuentas de menor valor para rotación
   */
  selectLowValueAccounts(accounts, percentage) {
    const count = Math.floor(accounts.length * percentage);

    return accounts
      .sort((a, b) => a.potentialValue - b.potentialValue)
      .slice(0, count);
  }

  /**
   * Calcula tasa de rotación basada en ranking
   * Agentes con peor ranking rotan más cuentas
   */
  calculateRotationRate(agent) {
    const baseRate = 0.2;
    const rankingFactor = agent.currentRanking / 10;

    return Math.min(baseRate + (rankingFactor * 0.1), 0.4);
  }

  /**
   * Programa rotación automática
   */
  scheduleRotation(interval = 'weekly') {
    const intervals = {
      'daily': 24 * 60 * 60 * 1000,
      'weekly': 7 * 24 * 60 * 60 * 1000,
      'monthly': 30 * 24 * 60 * 60 * 1000
    };

    const intervalMs = intervals[interval];

    if (!intervalMs) {
      throw new Error(`Invalid interval: ${interval}`);
    }

    return setInterval(async () => {
      await this.executeRotation({ rotationType: 'partial' });
    }, intervalMs);
  }
}
