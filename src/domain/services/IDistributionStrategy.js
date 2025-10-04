/**
 * Interface for Distribution Strategy (Strategy Pattern)
 * Cumple con Open/Closed Principle (OCP)
 */
export class IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    throw new Error('distribute() must be implemented');
  }
}
