# Guía de Deployment

## Opciones de Deployment

### Opción 1: Vercel (Recomendado para Prototipo)

#### Características
- Deployment automático desde Git
- HTTPS gratuito
- CDN global
- Zero-config para React/Vite

#### Pasos

1. **Preparar el proyecto**
```bash
npm run build
```

2. **Instalar Vercel CLI**
```bash
npm install -g vercel
```

3. **Deploy**
```bash
vercel
```

4. **Configuración**
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

5. **Variables de entorno** (futuro)
```bash
vercel env add VITE_API_URL
```

#### URL Ejemplo
```
https://sistema-distribucion-cuentas.vercel.app
```

### Opción 2: Netlify

#### Características
- Similar a Vercel
- Integración con Git
- Deploy previews
- Functions serverless

#### Pasos

1. **Conectar repositorio**
   - Ir a app.netlify.com
   - New site from Git
   - Seleccionar repositorio

2. **Configuración**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **netlify.toml** (opcional)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Opción 3: GitHub Pages

#### Características
- Gratuito para repos públicos
- Integrado con GitHub
- Ideal para prototipos

#### Pasos

1. **Instalar gh-pages**
```bash
npm install --save-dev gh-pages
```

2. **Actualizar package.json**
```json
{
  "homepage": "https://username.github.io/repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy**
```bash
npm run deploy
```

### Opción 4: Docker + Cloud (AWS/Azure/GCP)

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Comandos
```bash
docker build -t sistema-distribucion .
docker run -p 80:80 sistema-distribucion
```

#### Deploy a AWS ECS
```bash
aws ecr create-repository --repository-name sistema-distribucion
docker tag sistema-distribucion:latest <aws-account-id>.dkr.ecr.region.amazonaws.com/sistema-distribucion
docker push <aws-account-id>.dkr.ecr.region.amazonaws.com/sistema-distribucion
```

## Preparación para Producción

### 1. Optimizaciones de Build

**vite.config.js**
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'charts-vendor': ['recharts'],
        },
      },
    },
  },
})
```

### 2. Variables de Entorno

**Crear .env.production**
```env
VITE_API_URL=https://api.ejemplo.com
VITE_ENV=production
```

**Usar en código**
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

### 3. Configuración de CORS (Backend futuro)

```javascript
app.use(cors({
  origin: ['https://sistema-distribucion.vercel.app'],
  credentials: true
}));
```

### 4. Monitoreo

**Instalar Sentry (Opcional)**
```bash
npm install @sentry/react
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_ENV,
});
```

## Checklist Pre-Deployment

### Código
- [ ] Todos los tests pasan
- [ ] No hay console.log en producción
- [ ] Variables de entorno configuradas
- [ ] Build exitoso localmente (`npm run build`)

### Seguridad
- [ ] Dependencias actualizadas (`npm audit fix`)
- [ ] Secrets no expuestos en código
- [ ] HTTPS configurado
- [ ] CORS configurado correctamente

### Rendimiento
- [ ] Imágenes optimizadas
- [ ] Code splitting implementado
- [ ] Lazy loading de componentes
- [ ] Bundle size < 500KB

### SEO y Accesibilidad
- [ ] Meta tags configurados
- [ ] Open Graph tags
- [ ] Favicon
- [ ] Accesibilidad (ARIA labels)

## Configuración de CI/CD

### GitHub Actions

**/.github/workflows/deploy.yml**
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'
```

## Migración a Backend Real

### Paso 1: API REST

**Crear servidor Express**
```javascript
import express from 'express';
import { container } from './infrastructure/DependencyContainer.js';

const app = express();
const api = new DistributionAPI(container);

app.post('/api/distribution/execute', async (req, res) => {
  const result = await api.executeDistribution(req.body);
  res.json(result);
});

app.get('/api/distribution/stats', async (req, res) => {
  const result = await api.getStats();
  res.json(result);
});

app.listen(3001, () => {
  console.log('API running on port 3001');
});
```

### Paso 2: Configurar Base de Datos

**MongoDB**
```javascript
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI);
await client.connect();

const agentRepository = new MongoAgentRepository(client);
```

**PostgreSQL**
```javascript
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const agentRepository = new PostgresAgentRepository(pool);
```

### Paso 3: Actualizar Frontend

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class DistributionAPIClient {
  async executeDistribution(params) {
    const response = await fetch(`${API_URL}/api/distribution/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return response.json();
  }
}
```

## Rollback en Producción

### Vercel
```bash
vercel rollback
```

### Docker
```bash
docker stop <container-id>
docker run <previous-image>
```

### Manual
```bash
git revert <commit-hash>
git push origin main
```

## Monitoreo Post-Deployment

### Métricas a Monitorear

1. **Disponibilidad**
   - Uptime > 99.5%
   - Response time < 200ms

2. **Errores**
   - Error rate < 0.1%
   - No critical errors

3. **Uso**
   - Usuarios activos
   - Distribuciones ejecutadas
   - Tiempo promedio de uso

### Herramientas Recomendadas

- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible
- **Errors**: Sentry, LogRocket
- **Performance**: Lighthouse, WebPageTest

## Mantenimiento

### Actualizaciones de Dependencias

**Mensual**
```bash
npm outdated
npm update
npm audit fix
```

### Backups

**Base de Datos**
```bash
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)
```

**Código**
- Git commits regulares
- Tags para releases
- Branches de producción protegidos

## Costos Estimados

### Prototipo (Actual)
- **Vercel/Netlify**: $0/mes (tier gratuito)
- **GitHub**: $0/mes (repo público)
- **Total**: $0/mes

### Producción Básica
- **Vercel Pro**: $20/mes
- **MongoDB Atlas**: $9/mes (M2)
- **Sentry**: $26/mes
- **Total**: ~$55/mes

### Producción Escalada
- **AWS ECS**: $50-100/mes
- **RDS PostgreSQL**: $30/mes
- **CloudWatch**: $10/mes
- **Total**: ~$90-140/mes

## Soporte y Troubleshooting

### Problemas Comunes

**Error: CORS**
- Verificar configuración de CORS en backend
- Agregar dominio a allowlist

**Error: Build fallido**
- Verificar versión de Node.js
- Limpiar cache: `npm clean-cache --force`
- Reinstalar: `rm -rf node_modules && npm install`

**Error: Timeout**
- Aumentar timeout en Vercel
- Optimizar queries de base de datos

### Logs

**Vercel**
```bash
vercel logs <deployment-url>
```

**Docker**
```bash
docker logs <container-id>
```

## Conclusión

Este prototipo está listo para deployment inmediato en plataformas como Vercel o Netlify.

Para producción con backend real:
1. Implementar API REST
2. Conectar base de datos
3. Configurar autenticación
4. Setup CI/CD
5. Monitoreo y alertas

**Tiempo estimado**: 2-3 semanas para producción completa
