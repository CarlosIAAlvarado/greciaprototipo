import { HttpAgentRepository } from './repositories/HttpAgentRepository.js';
import { HttpAccountRepository } from './repositories/HttpAccountRepository.js';
import { HttpDistributionRepository } from './repositories/HttpDistributionRepository.js';

import { HybridDistributionStrategy } from '../domain/services/HybridDistributionStrategy.js';
import { DistributionService } from '../domain/services/DistributionService.js';
import { RankingService } from '../domain/services/RankingService.js';
import { RotationService } from '../domain/services/RotationService.js';

import { ExecuteDistributionUseCase } from '../application/use-cases/ExecuteDistributionUseCase.js';
import { GetDistributionStatsUseCase } from '../application/use-cases/GetDistributionStatsUseCase.js';
import { ExecuteRotationUseCase } from '../application/use-cases/ExecuteRotationUseCase.js';

import { DataGenerator } from '../utils/DataGenerator.js';

/**
 * Dependency Injection Container
 * Implementa Dependency Inversion Principle (DIP)
 * Gestiona todas las dependencias del sistema
 */
export class DependencyContainer {
  constructor() {
    this.instances = new Map();
    this.initialized = false;
  }

  /**
   * Inicializa todas las dependencias
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    this.registerRepositories();
    this.registerStrategies();
    this.registerServices();
    this.registerUseCases();
    this.registerUtilities();

    this.initialized = true;
  }

  /**
   * Registra repositorios HTTP
   */
  registerRepositories() {
    this.instances.set('agentRepository', new HttpAgentRepository());
    this.instances.set('accountRepository', new HttpAccountRepository());
    this.instances.set('distributionRepository', new HttpDistributionRepository());
  }

  /**
   * Registra estrategias
   */
  registerStrategies() {
    this.instances.set('distributionStrategy', new HybridDistributionStrategy(0.5));
  }

  /**
   * Registra servicios
   */
  registerServices() {
    const agentRepository = this.get('agentRepository');
    const accountRepository = this.get('accountRepository');
    const distributionRepository = this.get('distributionRepository');
    const distributionStrategy = this.get('distributionStrategy');

    const rankingService = new RankingService(agentRepository);
    this.instances.set('rankingService', rankingService);

    const distributionService = new DistributionService(
      distributionStrategy,
      accountRepository,
      agentRepository,
      distributionRepository
    );
    this.instances.set('distributionService', distributionService);

    const rotationService = new RotationService(
      distributionService,
      accountRepository,
      agentRepository
    );
    this.instances.set('rotationService', rotationService);
  }

  /**
   * Registra casos de uso
   */
  registerUseCases() {
    const distributionService = this.get('distributionService');
    const rankingService = this.get('rankingService');
    const rotationService = this.get('rotationService');
    const agentRepository = this.get('agentRepository');
    const accountRepository = this.get('accountRepository');

    this.instances.set('executeDistributionUseCase',
      new ExecuteDistributionUseCase(distributionService, rankingService)
    );

    this.instances.set('getDistributionStatsUseCase',
      new GetDistributionStatsUseCase(distributionService, agentRepository, accountRepository)
    );

    this.instances.set('executeRotationUseCase',
      new ExecuteRotationUseCase(rotationService)
    );
  }

  /**
   * Registra utilidades
   */
  registerUtilities() {
    this.instances.set('dataGenerator', new DataGenerator());
  }

  /**
   * Obtiene una instancia del contenedor
   */
  get(name) {
    const instance = this.instances.get(name);

    if (!instance) {
      throw new Error(`Dependency not found: ${name}`);
    }

    return instance;
  }

  /**
   * Verifica si existe una dependencia
   */
  has(name) {
    return this.instances.has(name);
  }

  /**
   * Reinicia todas las dependencias
   */
  reset() {
    this.instances.clear();
    this.initialize();
  }
}

export const container = new DependencyContainer();
