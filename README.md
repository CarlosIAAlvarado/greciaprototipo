# Sistema de Distribución Híbrida de Cuentas

Prototipo funcional de un sistema de distribución inteligente de cuentas de clientes entre agentes de ventas, utilizando un modelo híbrido que combina equidad y meritocracia.

## Características Principales

- **Distribución Híbrida**: 50% equitativa + 50% basada en ranking de desempeño
- **Arquitectura Limpia**: Implementación con principios SOLID y DDD
- **Microservicios**: Separación clara de responsabilidades
- **Interfaz Interactiva**: Dashboard en tiempo real con visualizaciones
- **Sistema de Rotación**: Rotación automática y configurable de cuentas
- **Generador de Datos**: Datos de prueba realistas para demos

## Arquitectura

```
src/
├── domain/                    # Capa de dominio
│   ├── entities/             # Entidades del negocio
│   ├── services/             # Servicios de dominio
│   └── repositories/         # Interfaces de repositorios
├── infrastructure/           # Implementaciones de infraestructura
│   └── repositories/         # Repositorios en memoria
├── application/              # Casos de uso
│   └── use-cases/           # Lógica de aplicación
├── presentation/             # Capa de presentación
│   ├── api/                 # API del sistema
│   └── controllers/         # Controladores
├── components/               # Componentes React
├── hooks/                    # React hooks personalizados
└── utils/                    # Utilidades

```

## Requisitos Previos

- Node.js 18+
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd GRECIA\ PROTOTIPO
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Abrir navegador en `http://localhost:3000`

## Uso del Prototipo

### 1. Generar Datos de Prueba

1. Seleccionar tamaño del dataset (pequeño, mediano, grande)
2. Hacer clic en "Generar Datos de Prueba"
3. El sistema creará agentes y cuentas con datos realistas

### 2. Ejecutar Distribución

1. Hacer clic en "Ejecutar Distribución"
2. El sistema:
   - Calcula rankings basados en métricas
   - Distribuye 50% de cuentas equitativamente
   - Distribuye 50% según ranking con ponderación
   - Muestra resultados en gráfico y tabla

### 3. Ejecutar Rotación

1. Hacer clic en "Ejecutar Rotación (20%)"
2. El sistema rota 20% de cuentas de menor valor
3. Redistribuye las cuentas rotadas

### 4. Visualizar Resultados

- **Gráfico de Barras**: Muestra distribución visual por agente
- **Tabla Detallada**: Rankings, métricas y asignaciones
- **Estadísticas**: Promedios, desviación estándar, rangos

## Algoritmo de Distribución

### Fase 1: Distribución Equitativa (50%)

```javascript
cuentas_equitativas = total_cuentas * 0.5
cuentas_por_agente = cuentas_equitativas / numero_agentes
```

### Fase 2: Distribución por Ranking (50%)

```javascript
peso_agente = (total_agentes - posicion + 1) / suma_total_pesos
cuentas_adicionales = peso_agente * cuentas_restantes
```

### Ejemplo con 1000 Cuentas y 10 Agentes

| Ranking | Equitativas | Por Ranking | Total |
|---------|-------------|-------------|-------|
| 1       | 50          | 91          | 141   |
| 2       | 50          | 82          | 132   |
| 3       | 50          | 73          | 123   |
| ...     | ...         | ...         | ...   |
| 10      | 50          | 9           | 59    |

## Principios SOLID Aplicados

### Single Responsibility Principle (SRP)
- Cada servicio tiene una única responsabilidad
- `DistributionService`: solo distribución
- `RankingService`: solo cálculo de rankings
- `RotationService`: solo rotación

### Open/Closed Principle (OCP)
- Sistema de estrategias extensible
- `IDistributionStrategy` permite nuevas estrategias sin modificar código existente

### Liskov Substitution Principle (LSP)
- Todas las implementaciones de repositorios son intercambiables
- Se puede cambiar `InMemoryRepository` por `DatabaseRepository` sin cambios

### Interface Segregation Principle (ISP)
- Interfaces específicas para cada repositorio
- No hay métodos innecesarios en las interfaces

### Dependency Inversion Principle (DIP)
- Dependencias inyectadas mediante `DependencyContainer`
- Código de alto nivel no depende de implementaciones concretas

## Patrones de Diseño

- **Repository Pattern**: Abstracción de persistencia
- **Strategy Pattern**: Estrategias de distribución intercambiables
- **Dependency Injection**: Gestión de dependencias centralizada
- **Use Case Pattern**: Lógica de aplicación encapsulada

## Configuración

### Cambiar Porcentaje de Distribución

Editar `src/infrastructure/DependencyContainer.js`:

```javascript
this.instances.set('distributionStrategy',
  new HybridDistributionStrategy(0.6) // 60% equitativa, 40% ranking
);
```

### Modificar Criterios de Ranking

Editar `src/domain/services/RankingService.js`:

```javascript
calculateScore(metrics) {
  const conversionWeight = 0.5; // Cambiar pesos
  const salesWeight = 0.3;
  const closedAccountsWeight = 0.2;
  // ...
}
```

### Ajustar Porcentaje de Rotación

```javascript
await api.executeRotation({
  rotationType: 'partial',
  percentage: 0.3 // 30% de rotación
});
```

## API del Sistema

### Ejecutar Distribución
```javascript
const result = await api.executeDistribution({
  updateRankings: true,
  type: 'initial'
});
```

### Obtener Estadísticas
```javascript
const stats = await api.getStats();
```

### Ejecutar Rotación
```javascript
const result = await api.executeRotation({
  rotationType: 'partial', // 'full', 'partial', 'performance_based'
  percentage: 0.2
});
```

### Generar Datos de Prueba
```javascript
const result = await api.generateTestData('medium'); // 'small', 'medium', 'large'
```

## Estructura de Datos

### Agent
```javascript
{
  id: string,
  name: string,
  email: string,
  active: boolean,
  currentRanking: number,
  joinDate: Date,
  metrics: {
    conversionRate: number,
    totalSales: number,
    closedAccounts: number
  }
}
```

### Account
```javascript
{
  id: string,
  clientName: string,
  potentialValue: number,
  segment: string,
  status: 'active' | 'inactive' | 'closed',
  assignedAgent: string,
  assignmentDate: Date,
  priority: 'high' | 'medium' | 'low'
}
```

### Distribution
```javascript
{
  id: string,
  distributionDate: Date,
  type: string,
  assignments: [{
    agentId: string,
    equitableAccounts: number,
    rankingAccounts: number,
    totalAccounts: number,
    accountsList: string[]
  }],
  parameters: {
    equitablePercentage: number,
    rankingPercentage: number,
    weightingSystem: string
  }
}
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview de build de producción

## Tecnologías Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Recharts** - Visualización de datos
- **JavaScript ES6+** - Lenguaje base

## 🔒 Seguridad (v2.0)

### Características de Seguridad Implementadas

- ✅ **Autenticación JWT**: Sistema completo de login con tokens seguros
- ✅ **Sistema de Roles**: Admin, Supervisor, Agente con permisos específicos
- ✅ **Auditoría Completa**: Registro de todas las operaciones del sistema
- ✅ **Backups Automáticos**: Respaldo programado de la base de datos
- ✅ **Variables de Entorno**: Credenciales protegidas y configurables
- ✅ **CORS Configurado**: Control de orígenes permitidos

Ver [SECURITY.md](SECURITY.md) para documentación completa de seguridad.

### Inicio Rápido con Seguridad

1. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

2. **Crear usuario administrador:**
```bash
node server/scripts/init-admin.js
```

3. **Iniciar servidor seguro:**
```bash
npm run server
```

4. **Login por primera vez:**
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

## Próximas Mejoras

- [x] Persistencia en base de datos real (MongoDB) ✅
- [x] Autenticación y autorización ✅
- [x] Sistema de auditoría ✅
- [x] Backups automáticos ✅
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Sistema de notificaciones
- [ ] Tests unitarios y de integración
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)

## Licencia

MIT

## Contacto

Para soporte o consultas sobre este prototipo, contactar al equipo de desarrollo.
