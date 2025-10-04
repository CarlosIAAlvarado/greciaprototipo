/**
 * Get Distribution Stats Use Case
 * Caso de uso para obtener estadísticas de distribución
 * Cumple con Single Responsibility Principle (SRP)
 */
export class GetDistributionStatsUseCase {
  constructor(distributionService, agentRepository, accountRepository) {
    this.distributionService = distributionService;
    this.agentRepository = agentRepository;
    this.accountRepository = accountRepository;
  }

  /**
   * Ejecuta el caso de uso
   */
  async execute() {
    const distribution = await this.distributionService.getLatestDistribution();

    if (!distribution) {
      console.log('GetDistributionStatsUseCase: No distribution found');
      return {
        success: false,
        message: 'No distribution found'
      };
    }

    console.log('GetDistributionStatsUseCase: Distribution found:', {
      id: distribution.id,
      assignmentsCount: distribution.assignments.length,
      sampleAgentIds: distribution.assignments.slice(0, 3).map(a => a.agentId)
    });

    const agents = await this.agentRepository.getAll();
    console.log('GetDistributionStatsUseCase: Agents found:', {
      count: agents.length,
      sampleIds: agents.slice(0, 3).map(a => ({ id: a.id, name: a.name }))
    });

    const agentsMap = new Map(agents.map(a => [a.id, a]));

    const stats = distribution.assignments.map(assignment => {
      const agent = agentsMap.get(assignment.agentId);

      return {
        agentId: assignment.agentId,
        agentName: agent ? agent.name : 'Unknown',
        ranking: agent ? agent.currentRanking : 0,
        equitableAccounts: assignment.equitableAccounts,
        rankingAccounts: assignment.rankingAccounts,
        totalAccounts: assignment.totalAccounts,
        metrics: agent ? agent.metrics : {}
      };
    });

    stats.sort((a, b) => a.ranking - b.ranking);

    const totalAccounts = stats.reduce((sum, s) => sum + s.totalAccounts, 0);
    const avgAccounts = totalAccounts / stats.length;
    const stdDeviation = this.calculateStandardDeviation(stats.map(s => s.totalAccounts));

    return {
      success: true,
      distribution: {
        id: distribution.id,
        date: distribution.distributionDate,
        type: distribution.type,
        parameters: distribution.parameters
      },
      stats: stats,
      summary: {
        totalAccounts,
        avgAccounts: parseFloat(avgAccounts.toFixed(2)),
        stdDeviation: parseFloat(stdDeviation.toFixed(2)),
        minAccounts: Math.min(...stats.map(s => s.totalAccounts)),
        maxAccounts: Math.max(...stats.map(s => s.totalAccounts))
      }
    };
  }

  /**
   * Calcula desviación estándar
   */
  calculateStandardDeviation(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;

    return Math.sqrt(avgSquareDiff);
  }
}
