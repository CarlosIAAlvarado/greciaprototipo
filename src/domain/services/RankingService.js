/**
 * Ranking Service
 * Servicio responsable de calcular y actualizar rankings de agentes
 * Cumple con Single Responsibility Principle (SRP)
 */
export class RankingService {
  constructor(agentRepository) {
    this.agentRepository = agentRepository;
  }

  /**
   * Calcula ranking basado en métricas de desempeño
   * @param {Array} agents - Lista de agentes
   * @returns {Array} Agentes con ranking actualizado
   */
  async calculateRankings(agents = null) {
    const agentsList = agents || await this.agentRepository.getAll();

    const scoredAgents = agentsList.map(agent => ({
      agent,
      score: this.calculateScore(agent.metrics)
    }));

    scoredAgents.sort((a, b) => b.score - a.score);

    scoredAgents.forEach((item, index) => {
      item.agent.updateRanking(index + 1);
    });

    await this.agentRepository.saveAll(scoredAgents.map(item => item.agent));

    return scoredAgents.map(item => item.agent);
  }

  /**
   * Calcula score ponderado basado en métricas
   * Fórmula: Score = (ConversionRate * 0.4) + (TotalSales * 0.4) + (ClosedAccounts * 0.2)
   */
  calculateScore(metrics) {
    const conversionWeight = 0.4;
    const salesWeight = 0.4;
    const closedAccountsWeight = 0.2;

    const normalizedConversion = metrics.conversionRate || 0;
    const normalizedSales = (metrics.totalSales || 0) / 1000;
    const normalizedClosed = (metrics.closedAccounts || 0) / 10;

    return (
      normalizedConversion * conversionWeight +
      normalizedSales * salesWeight +
      normalizedClosed * closedAccountsWeight
    );
  }

  /**
   * Obtiene top performers
   */
  async getTopPerformers(limit = 5) {
    const agents = await this.agentRepository.getAll();
    return agents
      .filter(agent => agent.isActive())
      .sort((a, b) => a.currentRanking - b.currentRanking)
      .slice(0, limit);
  }

  /**
   * Obtiene ranking actual de un agente
   */
  async getAgentRanking(agentId) {
    const agent = await this.agentRepository.getById(agentId);
    return agent ? agent.currentRanking : null;
  }
}
