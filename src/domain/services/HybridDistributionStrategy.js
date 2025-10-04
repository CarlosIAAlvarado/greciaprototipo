import { IDistributionStrategy } from './IDistributionStrategy.js';
import { Assignment } from '../entities/Distribution.js';

/**
 * Hybrid Distribution Strategy
 * Implementa distribución híbrida: 50% equitativa + 50% por ranking
 * Cumple con Single Responsibility Principle (SRP)
 */
export class HybridDistributionStrategy extends IDistributionStrategy {
  constructor(equitablePercentage = 0.5) {
    super();
    this.equitablePercentage = equitablePercentage;
    this.rankingPercentage = 1 - equitablePercentage;
  }

  /**
   * Distribuye cuentas usando estrategia híbrida
   * @param {Array} accounts - Lista de cuentas a distribuir
   * @param {Array} agents - Lista de agentes activos
   * @param {Object} parameters - Parámetros adicionales
   * @returns {Array} Assignments
   */
  distribute(accounts, agents, parameters = {}) {
    this.validateInputs(accounts, agents);

    const activeAgents = this.getActiveAgentsSorted(agents);
    const totalAccounts = accounts.length;

    // Calcular correctamente:
    // - Total para fase equitativa (50% del total)
    const totalEquitableAccounts = Math.floor(totalAccounts * this.equitablePercentage);
    // - Cuentas por agente en fase equitativa
    const accountsPerAgent = Math.floor(totalEquitableAccounts / activeAgents.length);
    // - Total para fase de ranking (50% restante)
    const totalRankingAccounts = totalAccounts - totalEquitableAccounts;

    const assignments = this.createInitialAssignments(activeAgents);

    this.distributeEquitable(assignments, accounts, accountsPerAgent);
    this.distributeByRanking(assignments, accounts, totalRankingAccounts, activeAgents.length);

    return assignments;
  }

  /**
   * Valida entradas según Interface Segregation Principle (ISP)
   */
  validateInputs(accounts, agents) {
    if (!Array.isArray(accounts) || accounts.length === 0) {
      throw new Error('Accounts must be a non-empty array');
    }
    if (!Array.isArray(agents) || agents.length === 0) {
      throw new Error('Agents must be a non-empty array');
    }
    if (accounts.length < agents.length) {
      throw new Error('Not enough accounts to distribute');
    }
  }

  /**
   * Obtiene agentes ordenados por ranking (usa TODOS los agentes de la tabla)
   */
  getActiveAgentsSorted(agents) {
    return agents
      .sort((a, b) => a.currentRanking - b.currentRanking);
  }

  /**
   * Crea asignaciones iniciales vacías
   */
  createInitialAssignments(agents) {
    return agents.map(agent => new Assignment({
      agentId: agent.id,
      equitableAccounts: 0,
      rankingAccounts: 0,
      totalAccounts: 0,
      accountsList: []
    }));
  }

  /**
   * Fase 1: Distribución equitativa (50%)
   */
  distributeEquitable(assignments, accounts, accountsPerAgent) {
    let accountIndex = 0;

    assignments.forEach(assignment => {
      const accountsToAssign = accounts.slice(accountIndex, accountIndex + accountsPerAgent);

      assignment.equitableAccounts = accountsToAssign.length;
      assignment.accountsList.push(...accountsToAssign.map(acc => acc.id));
      assignment.totalAccounts += accountsToAssign.length;

      accountsToAssign.forEach(account => {
        account.assignToAgent(assignment.agentId);
      });

      accountIndex += accountsPerAgent;
    });

    return accountIndex;
  }

  /**
   * Fase 2: Distribución por ranking (50%)
   * Usa ponderación lineal basada en posición de ranking
   */
  distributeByRanking(assignments, accounts, remainingAccounts, totalAgents) {
    const weights = this.calculateWeights(totalAgents);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Iniciar desde donde terminó la fase equitativa
    let accountIndex = Math.floor(accounts.length * this.equitablePercentage);

    assignments.forEach((assignment, index) => {
      const weight = weights[index] / totalWeight;
      const accountsToAssign = Math.round(remainingAccounts * weight);

      const accountsSlice = accounts.slice(accountIndex, accountIndex + accountsToAssign);

      assignment.rankingAccounts = accountsSlice.length;
      assignment.accountsList.push(...accountsSlice.map(acc => acc.id));
      assignment.totalAccounts += accountsSlice.length;

      accountsSlice.forEach(account => {
        account.assignToAgent(assignment.agentId);
      });

      accountIndex += accountsToAssign;
    });

    this.handleRemainingAccounts(assignments, accounts, accountIndex);
  }

  /**
   * Calcula pesos según ranking
   * Peso = (Total_Agentes - Posición + 1)
   */
  calculateWeights(totalAgents) {
    const weights = [];
    for (let i = 0; i < totalAgents; i++) {
      weights.push(totalAgents - i);
    }
    return weights;
  }

  /**
   * Maneja cuentas residuales asignándolas a top performers
   */
  handleRemainingAccounts(assignments, accounts, startIndex) {
    const remaining = accounts.slice(startIndex);

    remaining.forEach((account, index) => {
      const assignment = assignments[index % assignments.length];
      assignment.rankingAccounts++;
      assignment.totalAccounts++;
      assignment.accountsList.push(account.id);
      account.assignToAgent(assignment.agentId);
    });
  }
}
