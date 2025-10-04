# Arquitectura Técnica del Sistema

## Introducción

Este documento describe la arquitectura técnica del Sistema de Distribución Híbrida de Cuentas, implementado siguiendo principios SOLID, Clean Architecture y Domain-Driven Design (DDD).

## Arquitectura General

### Capas de la Aplicación

```
┌─────────────────────────────────────────────┐
│        Presentation Layer (UI)              │
│  - React Components                         │
│  - Dashboard, Tables, Charts                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Application Layer (API)              │
│  - DistributionAPI                          │
│  - Use Cases                                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Domain Layer (Business Logic)        │
│  - Entities (Agent, Account, Distribution) │
│  - Services (Distribution, Ranking, Rotation)│
│  - Repository Interfaces                    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        Infrastructure Layer                 │
│  - Repository Implementations               │
│  - Dependency Container                     │
│  - External Services                        │
└─────────────────────────────────────────────┘
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)

Cada clase tiene una única razón para cambiar.

**Ejemplo:**
```javascript
// DistributionService: Solo se encarga de orquestar la distribución
class DistributionService {
  async executeDistribution(parameters) {
    // Coordina la distribución, pero delega la lógica
  }
}

// HybridDistributionStrategy: Solo implementa el algoritmo
class HybridDistributionStrategy {
  distribute(accounts, agents, parameters) {
    // Implementa el algoritmo híbrido
  }
}

// RankingService: Solo calcula rankings
class RankingService {
  calculateRankings(agents) {
    // Calcula y actualiza rankings
  }
}
```

### 2. Open/Closed Principle (OCP)

El sistema está abierto a extensión pero cerrado a modificación.

**Ejemplo:**
```javascript
// Interfaz base
class IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    throw new Error('Must be implemented');
  }
}

// Implementación actual
class HybridDistributionStrategy extends IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    // Implementación híbrida
  }
}

// Futuras implementaciones sin modificar código existente
class MeritocraticDistributionStrategy extends IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    // 100% basado en mérito
  }
}

class EquitativeDistributionStrategy extends IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    // 100% equitativo
  }
}
```

### 3. Liskov Substitution Principle (LSP)

Las implementaciones pueden sustituirse sin afectar el comportamiento.

**Ejemplo:**
```javascript
// Interfaz de repositorio
class IAgentRepository {
  async getAll() {}
  async getById(id) {}
  async save(agent) {}
}

// Implementación en memoria (prototipo)
class InMemoryAgentRepository extends IAgentRepository {
  async getAll() {
    return Array.from(this.agents.values());
  }
}

// Implementación con base de datos (producción)
class MongoAgentRepository extends IAgentRepository {
  async getAll() {
    return await this.collection.find().toArray();
  }
}

// El servicio funciona con cualquier implementación
class RankingService {
  constructor(agentRepository) { // Acepta IAgentRepository
    this.agentRepository = agentRepository;
  }
}
```

### 4. Interface Segregation Principle (ISP)

Las interfaces son específicas y no contienen métodos innecesarios.

**Ejemplo:**
```javascript
// Interfaces segregadas por responsabilidad

class IAgentRepository {
  async getAll() {}
  async getById(id) {}
  async getActiveAgents() {}
  async save(agent) {}
  async saveAll(agents) {}
  async delete(id) {}
}

class IAccountRepository {
  async getAll() {}
  async getById(id) {}
  async getAvailableAccounts() {}
  async getByAgent(agentId) {}
  async save(account) {}
  async saveAll(accounts) {}
  async delete(id) {}
}

class IDistributionRepository {
  async save(distribution) {}
  async getLatest() {}
  async getHistory(limit) {}
  async getById(id) {}
}
```

### 5. Dependency Inversion Principle (DIP)

Las dependencias se inyectan, no se crean internamente.

**Ejemplo:**
```javascript
// Contenedor de dependencias centralizado
class DependencyContainer {
  constructor() {
    this.instances = new Map();
    this.initialize();
  }

  initialize() {
    // Registro de repositorios
    this.instances.set('agentRepository', new InMemoryAgentRepository());

    // Registro de servicios con dependencias inyectadas
    const agentRepository = this.get('agentRepository');
    const rankingService = new RankingService(agentRepository);
    this.instances.set('rankingService', rankingService);
  }

  get(name) {
    return this.instances.get(name);
  }
}

// Los servicios reciben dependencias, no las crean
class DistributionService {
  constructor(
    distributionStrategy,
    accountRepository,
    agentRepository,
    distributionRepository
  ) {
    this.distributionStrategy = distributionStrategy;
    this.accountRepository = accountRepository;
    this.agentRepository = agentRepository;
    this.distributionRepository = distributionRepository;
  }
}
```

## Patrones de Diseño Implementados

### 1. Repository Pattern

Abstrae la persistencia de datos.

```javascript
// Interfaz
class IAgentRepository {
  async getAll() {}
  async save(agent) {}
}

// Implementación
class InMemoryAgentRepository extends IAgentRepository {
  constructor() {
    this.agents = new Map();
  }

  async getAll() {
    return Array.from(this.agents.values());
  }

  async save(agent) {
    this.agents.set(agent.id, agent);
    return agent;
  }
}
```

**Beneficios:**
- Cambio fácil de persistencia (memoria → base de datos)
- Testeo simplificado con mocks
- Separación de preocupaciones

### 2. Strategy Pattern

Permite intercambiar algoritmos de distribución.

```javascript
// Estrategia base
class IDistributionStrategy {
  distribute(accounts, agents, parameters) {
    throw new Error('Must be implemented');
  }
}

// Estrategia concreta
class HybridDistributionStrategy extends IDistributionStrategy {
  constructor(equitablePercentage) {
    super();
    this.equitablePercentage = equitablePercentage;
  }

  distribute(accounts, agents, parameters) {
    // Implementación del algoritmo híbrido
  }
}

// Uso
const strategy = new HybridDistributionStrategy(0.5);
const service = new DistributionService(strategy, ...);
```

**Beneficios:**
- Algoritmos intercambiables
- Extensible sin modificar código
- Testeo de estrategias por separado

### 3. Dependency Injection

Gestión centralizada de dependencias.

```javascript
class DependencyContainer {
  constructor() {
    this.instances = new Map();
  }

  registerRepositories() {
    this.instances.set('agentRepository', new InMemoryAgentRepository());
  }

  registerServices() {
    const repo = this.get('agentRepository');
    this.instances.set('rankingService', new RankingService(repo));
  }

  get(name) {
    return this.instances.get(name);
  }
}
```

**Beneficios:**
- Acoplamiento bajo
- Testeo facilitado
- Configuración centralizada

### 4. Use Case Pattern

Encapsula lógica de aplicación.

```javascript
class ExecuteDistributionUseCase {
  constructor(distributionService, rankingService) {
    this.distributionService = distributionService;
    this.rankingService = rankingService;
  }

  async execute(params) {
    if (params.updateRankings) {
      await this.rankingService.calculateRankings();
    }

    const distribution = await this.distributionService.executeDistribution(params);

    return {
      success: true,
      distribution: distribution.toJSON(),
      totalAccounts: distribution.getTotalAccounts()
    };
  }
}
```

**Beneficios:**
- Lógica de negocio centralizada
- Reusable desde múltiples puntos
- Testeo simplificado

## Flujo de Ejecución

### Caso de Uso: Ejecutar Distribución

```
1. Usuario → Dashboard.jsx
   └─> Clic en "Ejecutar Distribución"

2. Dashboard → DistributionAPI
   └─> api.executeDistribution({ updateRankings: true })

3. DistributionAPI → ExecuteDistributionUseCase
   └─> useCase.execute({ updateRankings: true })

4. ExecuteDistributionUseCase → RankingService
   └─> rankingService.calculateRankings()

5. RankingService → AgentRepository
   └─> agentRepository.getAll()
   └─> Calcula scores
   └─> Actualiza rankings
   └─> agentRepository.saveAll(agents)

6. ExecuteDistributionUseCase → DistributionService
   └─> distributionService.executeDistribution()

7. DistributionService → AccountRepository + AgentRepository
   └─> accountRepository.getAvailableAccounts()
   └─> agentRepository.getActiveAgents()

8. DistributionService → HybridDistributionStrategy
   └─> strategy.distribute(accounts, agents, params)

9. HybridDistributionStrategy
   └─> Fase 1: Distribución equitativa (50%)
   └─> Fase 2: Distribución por ranking (50%)
   └─> Retorna assignments

10. DistributionService → DistributionRepository
    └─> distributionRepository.save(distribution)

11. Respuesta → Dashboard
    └─> Actualiza UI con resultados
```

## Entidades del Dominio

### Agent

Representa un agente de ventas.

```javascript
class Agent {
  constructor({ id, name, email, active, currentRanking, joinDate, metrics }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.active = active;
    this.currentRanking = currentRanking;
    this.joinDate = joinDate;
    this.metrics = metrics;
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
    return { ...this };
  }
}
```

**Responsabilidades:**
- Mantener estado del agente
- Validar estado activo
- Actualizar ranking y métricas

### Account

Representa una cuenta de cliente.

```javascript
class Account {
  constructor({ id, clientName, potentialValue, segment, status, assignedAgent, assignmentDate, priority }) {
    this.id = id;
    this.clientName = clientName;
    this.potentialValue = potentialValue;
    this.segment = segment;
    this.status = status;
    this.assignedAgent = assignedAgent;
    this.assignmentDate = assignmentDate;
    this.priority = priority;
  }

  assignToAgent(agentId) {
    this.assignedAgent = agentId;
    this.assignmentDate = new Date();
  }

  isActive() {
    return this.status === 'active';
  }

  updateStatus(newStatus) {
    this.status = newStatus;
  }

  toJSON() {
    return { ...this };
  }
}
```

**Responsabilidades:**
- Mantener estado de la cuenta
- Gestionar asignación a agente
- Validar estado activo

### Distribution

Representa una distribución de cuentas.

```javascript
class Distribution {
  constructor({ id, distributionDate, type, assignments, parameters }) {
    this.id = id;
    this.distributionDate = distributionDate;
    this.type = type;
    this.assignments = assignments;
    this.parameters = parameters;
  }

  addAssignment(assignment) {
    this.assignments.push(assignment);
  }

  getTotalAccounts() {
    return this.assignments.reduce((sum, a) => sum + a.totalAccounts, 0);
  }

  getAssignmentByAgent(agentId) {
    return this.assignments.find(a => a.agentId === agentId);
  }

  toJSON() {
    return { ...this };
  }
}
```

**Responsabilidades:**
- Mantener registro de distribución
- Calcular totales
- Consultar asignaciones

## Servicios del Dominio

### DistributionService

Orquesta el proceso de distribución.

**Responsabilidades:**
- Coordinar distribución de cuentas
- Persistir resultados
- Consultar historial

### RankingService

Gestiona rankings de agentes.

**Responsabilidades:**
- Calcular scores basados en métricas
- Actualizar rankings
- Obtener top performers

### RotationService

Gestiona rotación de cuentas.

**Responsabilidades:**
- Ejecutar rotaciones (completa, parcial, por desempeño)
- Seleccionar cuentas a rotar
- Redistribuir cuentas rotadas

## Consideraciones de Escalabilidad

### Migración a Base de Datos

Para migrar de repositorios en memoria a base de datos:

1. Crear nuevas implementaciones de repositorios:

```javascript
class MongoAgentRepository extends IAgentRepository {
  constructor(mongoClient) {
    this.collection = mongoClient.db().collection('agents');
  }

  async getAll() {
    return await this.collection.find().toArray();
  }

  async save(agent) {
    await this.collection.updateOne(
      { id: agent.id },
      { $set: agent.toJSON() },
      { upsert: true }
    );
    return agent;
  }
}
```

2. Actualizar DependencyContainer:

```javascript
registerRepositories() {
  const mongoClient = new MongoClient(process.env.MONGO_URI);
  this.instances.set('agentRepository', new MongoAgentRepository(mongoClient));
}
```

3. No requiere cambios en servicios ni casos de uso

### Escalabilidad Horizontal

Para manejar mayor carga:

1. Implementar cache con Redis
2. Queue system para distribuciones asíncronas
3. API REST stateless
4. Load balancing

## Testing

### Testing por Capas

```javascript
// Test de entidad
describe('Agent', () => {
  it('should update ranking', () => {
    const agent = new Agent({ id: '1', currentRanking: 5 });
    agent.updateRanking(3);
    expect(agent.currentRanking).toBe(3);
  });
});

// Test de servicio con mock
describe('RankingService', () => {
  it('should calculate rankings', async () => {
    const mockRepo = {
      getAll: jest.fn().mockResolvedValue([agent1, agent2]),
      saveAll: jest.fn()
    };

    const service = new RankingService(mockRepo);
    await service.calculateRankings();

    expect(mockRepo.saveAll).toHaveBeenCalled();
  });
});

// Test de caso de uso
describe('ExecuteDistributionUseCase', () => {
  it('should execute distribution with ranking update', async () => {
    const mockDistService = { executeDistribution: jest.fn() };
    const mockRankingService = { calculateRankings: jest.fn() };

    const useCase = new ExecuteDistributionUseCase(
      mockDistService,
      mockRankingService
    );

    await useCase.execute({ updateRankings: true });

    expect(mockRankingService.calculateRankings).toHaveBeenCalled();
    expect(mockDistService.executeDistribution).toHaveBeenCalled();
  });
});
```

## Conclusión

Esta arquitectura proporciona:

1. **Mantenibilidad**: Código organizado y fácil de entender
2. **Escalabilidad**: Fácil migración a producción
3. **Testabilidad**: Componentes aislados y mockeables
4. **Extensibilidad**: Nuevas funcionalidades sin modificar existente
5. **Flexibilidad**: Cambio de implementaciones sin afectar lógica

La aplicación de principios SOLID y patrones de diseño garantiza un código robusto y profesional.
