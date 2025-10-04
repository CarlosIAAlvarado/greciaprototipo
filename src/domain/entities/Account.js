/**
 * Account Entity
 * Representa una cuenta de cliente en el sistema
 */
export class Account {
  constructor({ id, clientName, potentialValue, segment, status, assignedAgent, assignmentDate, priority }) {
    this.id = id;
    this.clientName = clientName;
    this.potentialValue = potentialValue;
    this.segment = segment;
    this.status = status || 'active';
    this.assignedAgent = assignedAgent;
    this.assignmentDate = assignmentDate;
    this.priority = priority || 'medium';
  }

  assignToAgent(agentId) {
    this.assignedAgent = agentId;
    this.assignmentDate = new Date();
  }

  isActive() {
    return this.status === 'active';
  }

  updateStatus(newStatus) {
    const validStatuses = ['active', 'inactive', 'closed'];
    if (validStatuses.includes(newStatus)) {
      this.status = newStatus;
    }
  }

  toJSON() {
    return {
      id: this.id,
      clientName: this.clientName,
      potentialValue: this.potentialValue,
      segment: this.segment,
      status: this.status,
      assignedAgent: this.assignedAgent,
      assignmentDate: this.assignmentDate,
      priority: this.priority
    };
  }
}
