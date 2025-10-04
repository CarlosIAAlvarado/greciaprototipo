/**
 * Agent Entity
 * Representa un agente de ventas en el sistema
 */
export class Agent {
  constructor({ id, name, email, active, currentRanking, joinDate, metrics }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.active = active;
    this.currentRanking = currentRanking;
    this.joinDate = joinDate;
    this.metrics = metrics || {
      conversionRate: 0,
      totalSales: 0,
      closedAccounts: 0
    };
  }

  isActive() {
    return this.active === true;
  }

  updateRanking(newRanking) {
    this.currentRanking = newRanking;
  }

  updateMetrics(metrics) {
    this.metrics = { ...this.metrics, ...metrics };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      active: this.active,
      currentRanking: this.currentRanking,
      joinDate: this.joinDate,
      metrics: this.metrics
    };
  }
}
