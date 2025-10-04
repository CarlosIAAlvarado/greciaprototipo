/**
 * Execute Distribution Use Case
 * Caso de uso para ejecutar distribución de cuentas
 * Cumple con Single Responsibility Principle (SRP)
 */
export class ExecuteDistributionUseCase {
  constructor(distributionService, rankingService) {
    this.distributionService = distributionService;
    this.rankingService = rankingService;
  }

  /**
   * Ejecuta el caso de uso
   */
  async execute(params = {}) {
    const {
      updateRankings = true,
      type = 'initial'
    } = params;

    if (updateRankings) {
      await this.rankingService.calculateRankings();
    }

    const distribution = await this.distributionService.executeDistribution({ type });

    return {
      success: true,
      distribution: distribution.toJSON(),
      totalAccounts: distribution.getTotalAccounts(),
      assignmentsCount: distribution.assignments.length
    };
  }
}
