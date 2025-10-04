/**
 * Distribution Entity
 * Representa una distribución de cuentas
 */
export class Distribution {
  constructor({ id, distributionDate, type, assignments, parameters }) {
    this.id = id;
    this.distributionDate = distributionDate;
    this.type = type;
    this.assignments = assignments || [];
    this.parameters = parameters || {
      equitablePercentage: 0.5,
      rankingPercentage: 0.5,
      weightingSystem: 'linear'
    };
  }

  addAssignment(assignment) {
    this.assignments.push(assignment);
  }

  getTotalAccounts() {
    return this.assignments.reduce((sum, assignment) => sum + assignment.totalAccounts, 0);
  }

  getAssignmentByAgent(agentId) {
    return this.assignments.find(assignment => assignment.agentId === agentId);
  }

  toJSON() {
    return {
      id: this.id,
      distributionDate: this.distributionDate,
      type: this.type,
      assignments: this.assignments,
      parameters: this.parameters
    };
  }
}

export class Assignment {
  constructor({ agentId, equitableAccounts, rankingAccounts, totalAccounts, accountsList }) {
    this.agentId = agentId;
    this.equitableAccounts = equitableAccounts;
    this.rankingAccounts = rankingAccounts;
    this.totalAccounts = totalAccounts;
    this.accountsList = accountsList || [];
  }

  toJSON() {
    return {
      agentId: this.agentId,
      equitableAccounts: this.equitableAccounts,
      rankingAccounts: this.rankingAccounts,
      totalAccounts: this.totalAccounts,
      accountsList: this.accountsList
    };
  }
}
