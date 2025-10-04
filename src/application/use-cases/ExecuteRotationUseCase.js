/**
 * Execute Rotation Use Case
 * Caso de uso para ejecutar rotación de cuentas
 * Cumple con Single Responsibility Principle (SRP)
 */
export class ExecuteRotationUseCase {
  constructor(rotationService) {
    this.rotationService = rotationService;
  }

  /**
   * Ejecuta el caso de uso
   */
  async execute(params = {}) {
    const {
      rotationType = 'partial',
      percentage = 0.2
    } = params;

    const distribution = await this.rotationService.executeRotation({
      rotationType,
      percentage
    });

    return {
      success: true,
      distribution: distribution.toJSON(),
      rotationType,
      message: `Rotation completed successfully using ${rotationType} strategy`
    };
  }
}
