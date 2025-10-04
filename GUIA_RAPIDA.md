# Guía Rápida de Uso

## Inicio Rápido

### 1. Instalación

```bash
cd "GRECIA PROTOTIPO"
npm install
npm run dev
```

### 2. Abrir en Navegador

Visitar: `http://localhost:3000`

## Flujo de Demostración (5 minutos)

### Paso 1: Generar Datos de Prueba

1. En el panel "Configuración", seleccionar tamaño del dataset:
   - **Pequeño**: 5 agentes, 100 cuentas
   - **Mediano**: 10 agentes, 1000 cuentas (recomendado)
   - **Grande**: 25 agentes, 5000 cuentas

2. Hacer clic en **"Generar Datos de Prueba"**

3. El sistema creará:
   - Agentes con nombres realistas
   - Cuentas de empresas ficticias
   - Métricas de desempeño aleatorias

**Tiempo: 30 segundos**

### Paso 2: Ejecutar Distribución

1. Hacer clic en **"Ejecutar Distribución"**

2. El sistema ejecutará:
   - Cálculo de rankings basado en métricas
   - Distribución 50% equitativa
   - Distribución 50% por ranking
   - Generación de estadísticas

3. Observar:
   - **Gráfico de barras** con distribución visual
   - **Tabla detallada** con rankings y asignaciones
   - **Panel de resumen** con estadísticas clave

**Tiempo: 1-2 minutos**

### Paso 3: Analizar Resultados

**Gráfico de Barras:**
- Barras azules: Cuentas equitativas (iguales para todos)
- Barras verdes: Cuentas por ranking (más para top performers)
- Altura total: Total de cuentas asignadas

**Tabla de Distribución:**
- Rankings ordenados (1 = mejor desempeño)
- Top 3 destacados con fondo amarillo
- Columnas:
  - Equitativas: Siempre 50 cuentas (con dataset mediano)
  - Por Ranking: Variable según posición
  - Total: Suma de ambas

**Panel de Resumen:**
- Total Cuentas: Total distribuido
- Promedio: Cuentas promedio por agente
- Desv. Estándar: Medida de equidad
- Rango: Mínimo y máximo asignado

**Tiempo: 1-2 minutos**

### Paso 4: Simular Rotación

1. Hacer clic en **"Ejecutar Rotación (20%)"**

2. El sistema:
   - Selecciona 20% de cuentas de menor valor de cada agente
   - Las marca como disponibles
   - Las redistribuye usando el mismo algoritmo

3. Observar cambios en la distribución

**Tiempo: 1 minuto**

## Casos de Uso de Demostración

### Demo 1: Comparar Equidad vs Meritocracia

**Objetivo:** Mostrar el balance entre equidad y meritocracia

1. Generar datos (mediano)
2. Ejecutar distribución
3. Explicar:
   - Todos reciben base equitativa (50 cuentas)
   - Top performer recibe +91 adicionales = 141 total
   - Bottom performer recibe +9 adicionales = 59 total
   - **Diferencia**: 141 vs 59 (2.4x más)

**Argumentos:**
- Equitativo: Todos tienen base garantizada
- Meritocrático: Top performers premiados
- Motivacional: Incentivo para mejorar ranking

### Demo 2: Impacto de Rankings

**Objetivo:** Mostrar cómo cambia la distribución con diferentes rankings

1. Generar datos
2. Ejecutar distribución
3. Observar tabla de rankings
4. Explicar fórmula de ponderación:

```
Peso = (Total_Agentes - Posición + 1)

Ejemplo con 10 agentes:
Ranking 1: Peso = 10
Ranking 5: Peso = 6
Ranking 10: Peso = 1

Cuentas = Peso / Suma_Pesos * Total_Disponible
```

### Demo 3: Simulación de Rotación

**Objetivo:** Demostrar mitigación de riesgos

1. Ejecutar distribución inicial
2. Anotar asignaciones
3. Ejecutar rotación
4. Comparar cambios
5. Explicar:
   - Evita estancamiento de cuentas
   - Renueva oportunidades
   - 20% semanal = renovación completa en 5 semanas

### Demo 4: Escalabilidad

**Objetivo:** Mostrar que funciona con diferentes tamaños

1. Probar con dataset pequeño (5 agentes, 100 cuentas)
2. Probar con dataset mediano (10 agentes, 1000 cuentas)
3. Probar con dataset grande (25 agentes, 5000 cuentas)
4. Mostrar que:
   - Algoritmo es consistente
   - Tiempo de procesamiento < 2 segundos
   - Estadísticas se mantienen proporcionales

## Preguntas Frecuentes de Demos

### ¿Por qué 50/50?

**R:** Balance óptimo entre:
- **50% equitativo**: Garantiza base justa, reduce conflictos
- **50% meritocrático**: Incentiva desempeño, retiene talento

**Configurable:** Se puede ajustar a 30/70, 70/30, etc. según cultura organizacional

### ¿Cómo se calculan los rankings?

**R:** Fórmula ponderada:

```
Score = (ConversionRate * 0.4) + (TotalSales * 0.4) + (ClosedAccounts * 0.2)
```

**Criterios:**
- 40% Tasa de conversión
- 40% Volumen de ventas
- 20% Cuentas cerradas

**Configurable:** Pesos ajustables según prioridades del negocio

### ¿Qué pasa si hay cuentas sobrantes?

**R:** Se asignan a top performers en orden de ranking

### ¿Cada cuánto se actualiza el ranking?

**R:** Configurable (semanal, mensual, trimestral)

**Recomendado:** Semanal para mantener motivación

### ¿Funciona con equipos grandes?

**R:** Sí, probado con:
- 5 agentes
- 25 agentes
- Escalable a 100+

## Funcionalidades Adicionales

### Actualizar Estadísticas

Botón **"Actualizar Estadísticas"**: Recarga datos sin ejecutar nueva distribución

### Limpiar Datos

Para reiniciar demo:
1. Cambiar preset
2. Generar nuevos datos (reemplaza automáticamente)

### Interpretar Métricas

**Desviación Estándar:**
- < 10: Distribución muy equitativa
- 10-20: Balance equidad/meritocracia
- > 20: Fuerte énfasis meritocrático

**Rango (Min-Max):**
- Diferencia pequeña: Equitativo
- Diferencia grande: Meritocrático
- Ideal: 1.5x - 2.5x

## Escenarios de Negocio

### Escenario 1: Equipo Nuevo

**Situación:** Agentes recién contratados, sin historial

**Solución:**
- Distribución 100% equitativa inicial
- Después de 1 mes, cambiar a 70/30
- Después de 3 meses, cambiar a 50/50

### Escenario 2: Alta Rotación

**Situación:** Mucha rotación de personal

**Solución:**
- Rotación semanal al 30%
- Distribución 60/40 (más equitativa)
- Monitoreo constante

### Escenario 3: Elite Sales Team

**Situación:** Equipo experimentado, altamente competitivo

**Solución:**
- Distribución 30/70 (más meritocrática)
- Rotación mensual al 10%
- Rankings quincenales

## Métricas de Éxito

Para validar el sistema en producción:

1. **Equidad**
   - Desviación estándar < 15%
   - Satisfacción de agentes > 80%

2. **Desempeño**
   - Tasa de conversión +10%
   - Retención de talento +15%

3. **Operacional**
   - Tiempo de distribución < 5 segundos
   - Uptime > 99.5%

## Tips para Presentaciones

### Inicio Impactante

"¿Cómo distribuirías 1000 clientes entre 10 vendedores de forma justa pero que también premie el esfuerzo?"

### Demostración Fluida

1. Generar datos (30s)
2. Ejecutar distribución (30s)
3. Explicar gráfico (1m)
4. Mostrar tabla (1m)
5. Ejecutar rotación (30s)
6. Q&A (2m)

**Total: 5-7 minutos**

### Puntos Clave

1. "Todos ganan": Base equitativa garantizada
2. "Los mejores ganan más": Incentivo claro
3. "Rotación previene estancamiento": Mitigación de riesgos
4. "Configurable": Adaptable a cultura organizacional

### Manejo de Objeciones

**"Es injusto que el #1 reciba 2x más"**
- R: Todos tienen base equitativa. El extra es por mérito demostrable.

**"¿Qué pasa si un agente nuevo tiene mala suerte?"**
- R: Rotación semanal da nuevas oportunidades constantemente.

**"Los rankings pueden ser manipulados"**
- R: Métricas objetivas (conversión, ventas). Auditoría automática.

## Soporte Técnico

### El servidor no inicia

```bash
npm install
npm run dev
```

### No se ven los gráficos

Verificar que Recharts esté instalado:

```bash
npm install recharts
```

### Errores de consola

Abrir DevTools (F12) y revisar consola para detalles

## Recursos Adicionales

- **README.md**: Documentación completa
- **ARQUITECTURA_TECNICA.md**: Detalles de implementación
- **src/**: Código fuente con comentarios

## Contacto

Para soporte o consultas sobre el prototipo, contactar al equipo de desarrollo.
