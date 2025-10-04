/**
 * Distribution API
 * Capa de presentación que expone funcionalidad del sistema
 * Cumple con Single Responsibility Principle (SRP)
 */
export class DistributionAPI {
  constructor(container) {
    this.container = container;
    this.executeDistributionUseCase = container.get('executeDistributionUseCase');
    this.getDistributionStatsUseCase = container.get('getDistributionStatsUseCase');
    this.executeRotationUseCase = container.get('executeRotationUseCase');
    this.agentRepository = container.get('agentRepository');
    this.accountRepository = container.get('accountRepository');
    this.rankingService = container.get('rankingService');
    this.dataGenerator = container.get('dataGenerator');
  }

  /**
   * Ejecuta distribución de cuentas
   */
  async executeDistribution(params = {}) {
    try {
      const result = await this.executeDistributionUseCase.execute(params);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Obtiene estadísticas de distribución
   */
  async getStats() {
    try {
      const result = await this.getDistributionStatsUseCase.execute();
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Ejecuta rotación de cuentas
   */
  async executeRotation(params = {}) {
    try {
      const result = await this.executeRotationUseCase.execute(params);
      return this.successResponse(result);
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Obtiene todos los agentes
   */
  async getAgents() {
    try {
      const agents = await this.agentRepository.getAll();
      return this.successResponse({
        agents: agents.map(a => a.toJSON())
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Obtiene todas las cuentas
   */
  async getAccounts() {
    try {
      const accounts = await this.accountRepository.getAll();
      return this.successResponse({
        accounts: accounts.map(a => a.toJSON())
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Obtiene cuentas de un agente
   */
  async getAccountsByAgent(agentId) {
    try {
      const accounts = await this.accountRepository.getByAgent(agentId);
      return this.successResponse({
        agentId,
        accounts: accounts.map(a => a.toJSON())
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Calcula rankings
   */
  async calculateRankings() {
    try {
      const agents = await this.rankingService.calculateRankings();
      return this.successResponse({
        agents: agents.map(a => a.toJSON()),
        message: 'Rankings calculated successfully'
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Genera datos de prueba
   */
  async generateTestData(preset = 'medium') {
    try {
      const data = this.dataGenerator.generatePreset(preset);

      await this.agentRepository.saveAll(data.agents);
      await this.accountRepository.saveAll(data.accounts);

      await this.rankingService.calculateRankings(data.agents);

      return this.successResponse({
        message: 'Test data generated successfully',
        agentsCount: data.agents.length,
        accountsCount: data.accounts.length,
        preset
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Limpia todos los datos
   */
  async clearAllData() {
    try {
      console.log('🗑️ Limpiando todos los datos...');

      await this.agentRepository.clear();
      console.log('✅ Agentes eliminados');

      await this.accountRepository.clear();
      console.log('✅ Cuentas eliminadas');

      await this.container.get('distributionRepository').clear();
      console.log('✅ Distribuciones eliminadas');

      return this.successResponse({
        message: 'All data cleared successfully'
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Obtiene top performers
   */
  async getTopPerformers(limit = 5) {
    try {
      const agents = await this.rankingService.getTopPerformers(limit);
      return this.successResponse({
        topPerformers: agents.map(a => a.toJSON())
      });
    } catch (error) {
      return this.errorResponse(error);
    }
  }

  /**
   * Respuesta exitosa
   */
  successResponse(data) {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Respuesta de error
   */
  errorResponse(error) {
    return {
      success: false,
      error: {
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    };
  }
}
