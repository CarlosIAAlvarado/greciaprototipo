import { Agent } from '../domain/entities/Agent.js';
import { Account } from '../domain/entities/Account.js';

/**
 * Data Generator
 * Generador de datos mock realistas para demo
 * Cumple con Single Responsibility Principle (SRP)
 */
export class DataGenerator {
  constructor() {
    this.agentNames = [
      'Ana Lopez Martinez',
      'Carlos Ruiz Garcia',
      'Maria Gonzalez Perez',
      'Juan Martinez Rodriguez',
      'Laura Perez Sanchez',
      'Pedro Sanchez Fernandez',
      'Sofia Fernandez Lopez',
      'Diego Garcia Martinez',
      'Carmen Rodriguez Gomez',
      'Miguel Gomez Diaz',
      'Isabel Diaz Moreno',
      'Antonio Moreno Alvarez',
      'Rosa Alvarez Romero',
      'Francisco Romero Jimenez',
      'Lucia Jimenez Navarro',
      'Javier Navarro Torres',
      'Elena Torres Dominguez',
      'Manuel Dominguez Vazquez',
      'Cristina Vazquez Ramos',
      'Alberto Ramos Castro',
      'Patricia Castro Ortiz',
      'Roberto Ortiz Rubio',
      'Silvia Rubio Molina',
      'Fernando Molina Delgado',
      'Monica Delgado Serrano'
    ];

    this.companyPrefixes = [
      'Industrias', 'Comercial', 'Servicios', 'Tecnologia', 'Grupo',
      'Distribuidora', 'Consultoria', 'Soluciones', 'Sistemas', 'Corporativo'
    ];

    this.companySuffixes = [
      'del Norte', 'del Sur', 'Global', 'Internacional', 'Latinoamerica',
      'Premium', 'Plus', 'Elite', 'Pro', 'Express'
    ];

    this.segments = ['enterprise', 'corporate', 'mid-market', 'small-business'];
    this.priorities = ['high', 'medium', 'low'];
  }

  /**
   * Genera agentes con datos realistas
   */
  generateAgents(count = 10) {
    const agents = [];

    for (let i = 0; i < count; i++) {
      const name = this.agentNames[i % this.agentNames.length];
      const email = this.generateEmail(name);

      const agent = new Agent({
        id: this.generateUUID(),
        name: name,
        email: email,
        active: true,
        currentRanking: i + 1,
        joinDate: this.randomDate(new Date(2020, 0, 1), new Date()),
        metrics: this.generateMetrics()
      });

      agents.push(agent);
    }

    return agents;
  }

  /**
   * Genera cuentas con datos realistas
   */
  generateAccounts(count = 1000) {
    const accounts = [];

    for (let i = 0; i < count; i++) {
      const account = new Account({
        id: this.generateUUID(),
        clientName: this.generateCompanyName(),
        potentialValue: this.randomInt(5000, 500000),
        segment: this.randomChoice(this.segments),
        status: 'active',
        assignedAgent: null,
        assignmentDate: null,
        priority: this.randomChoice(this.priorities)
      });

      accounts.push(account);
    }

    return accounts;
  }

  /**
   * Genera métricas de desempeño realistas
   */
  generateMetrics() {
    return {
      conversionRate: parseFloat((Math.random() * 100).toFixed(2)),
      totalSales: this.randomInt(10000, 500000),
      closedAccounts: this.randomInt(5, 150)
    };
  }

  /**
   * Genera nombre de empresa
   */
  generateCompanyName() {
    const prefix = this.randomChoice(this.companyPrefixes);
    const suffix = this.randomChoice(this.companySuffixes);
    const hasMiddle = Math.random() > 0.5;

    if (hasMiddle) {
      const middle = this.randomChoice(['Tech', 'Soft', 'Data', 'Cloud', 'Net']);
      return `${prefix} ${middle} ${suffix}`;
    }

    return `${prefix} ${suffix}`;
  }

  /**
   * Genera email a partir de nombre
   */
  generateEmail(name) {
    const nameParts = name.toLowerCase().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts[1] || nameParts[0];

    return `${firstName}.${lastName}@company.com`;
  }

  /**
   * Genera UUID simple
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Genera fecha aleatoria entre dos fechas
   */
  randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  /**
   * Genera número entero aleatorio
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Selecciona elemento aleatorio de array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Genera preset de datos según tamaño
   */
  generatePreset(size = 'medium') {
    const presets = {
      small: { agents: 5, accounts: 100 },
      medium: { agents: 10, accounts: 1000 },
      large: { agents: 25, accounts: 5000 }
    };

    const config = presets[size] || presets.medium;

    return {
      agents: this.generateAgents(config.agents),
      accounts: this.generateAccounts(config.accounts)
    };
  }
}
