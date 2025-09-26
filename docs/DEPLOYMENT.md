# Guía de Despliegue - Semillero Digital Platform

Esta guía explica cómo desplegar la plataforma en diferentes entornos de producción.

## 🚀 Opciones de Despliegue

### 1. Vercel + Railway (Recomendado para MVP)

#### Frontend en Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desde la carpeta frontend
cd frontend
vercel

# 3. Configurar variables de entorno en Vercel Dashboard
# REACT_APP_API_URL=https://tu-backend.railway.app
```

#### Backend en Railway
```bash
# 1. Conectar repositorio en railway.app
# 2. Configurar variables de entorno:
# - NODE_ENV=production
# - MONGODB_URI=mongodb+srv://...
# - GOOGLE_CLIENT_ID=...
# - GOOGLE_CLIENT_SECRET=...
# - JWT_SECRET=...
# - FRONTEND_URL=https://tu-frontend.vercel.app

# 3. Railway detectará automáticamente el backend
```

### 2. Heroku (Alternativa)

#### Preparar para Heroku
```bash
# 1. Crear Procfile en la raíz
echo "web: cd backend && npm start" > Procfile

# 2. Crear heroku-postbuild script en package.json raíz
# "heroku-postbuild": "cd frontend && npm install && npm run build"
```

#### Desplegar
```bash
# 1. Crear app en Heroku
heroku create semillero-digital-platform

# 2. Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set GOOGLE_CLIENT_ID=...
heroku config:set GOOGLE_CLIENT_SECRET=...
heroku config:set JWT_SECRET=...

# 3. Desplegar
git push heroku main
```

### 3. Docker + VPS

#### Dockerfile para Backend
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Dockerfile para Frontend
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/semillero
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### 4. AWS (Producción Escalable)

#### Arquitectura Recomendada
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate o EC2
- **Base de datos**: MongoDB Atlas o DocumentDB
- **Load Balancer**: Application Load Balancer

#### Configuración S3 + CloudFront
```bash
# 1. Construir frontend
cd frontend && npm run build

# 2. Subir a S3
aws s3 sync build/ s3://semillero-digital-frontend

# 3. Configurar CloudFront distribution
# Origin: S3 bucket
# Default root object: index.html
# Error pages: 404 -> /index.html (para React Router)
```

## 🔧 Configuración de Producción

### Variables de Entorno Críticas

#### Backend
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/semillero
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://api.semillerodigital.com/auth/google/callback
JWT_SECRET=your_super_secure_jwt_secret_here
FRONTEND_URL=https://platform.semillerodigital.com
```

#### Frontend
```env
REACT_APP_API_URL=https://api.semillerodigital.com
REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
REACT_APP_ENVIRONMENT=production
```

### Configuración de Google Cloud (Producción)

1. **Crear proyecto de producción** en Google Cloud Console
2. **Configurar dominios autorizados**:
   - JavaScript origins: `https://platform.semillerodigital.com`
   - Redirect URIs: `https://api.semillerodigital.com/auth/google/callback`
3. **Configurar pantalla de consentimiento** para usuarios externos
4. **Solicitar verificación** si es necesario

### Base de Datos

#### MongoDB Atlas (Recomendado)
```bash
# 1. Crear cluster de producción
# 2. Configurar IP whitelist (0.0.0.0/0 o IPs específicas)
# 3. Crear usuario de base de datos
# 4. Obtener connection string
```

#### Backup y Monitoreo
```bash
# Configurar backups automáticos en MongoDB Atlas
# Configurar alertas de monitoreo
# Configurar logs de aplicación
```

## 📊 Monitoreo y Logs

### Logging en Producción
```javascript
// backend/src/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Health Checks
```javascript
// Endpoint de health check mejorado
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    checks: {
      database: 'OK',
      googleApi: 'OK'
    }
  };

  try {
    // Verificar conexión a MongoDB
    await mongoose.connection.db.admin().ping();
  } catch (error) {
    health.checks.database = 'ERROR';
    health.status = 'ERROR';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

## 🔒 Seguridad en Producción

### Configuraciones Importantes
```javascript
// Configuración de seguridad adicional
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*.googleusercontent.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "*.googleapis.com"]
    }
  }
}));

// Rate limiting más estricto
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de requests por IP
  message: 'Demasiadas solicitudes desde esta IP'
});
```

### HTTPS y Certificados
```bash
# Para VPS con Let's Encrypt
sudo certbot --nginx -d api.semillerodigital.com
sudo certbot --nginx -d platform.semillerodigital.com
```

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          # Deploy backend to Railway
          
  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          # Deploy frontend to Vercel
```

## 📋 Checklist de Despliegue

### Pre-despliegue
- [ ] Configurar variables de entorno de producción
- [ ] Configurar Google Cloud para producción
- [ ] Configurar base de datos de producción
- [ ] Configurar dominios y DNS
- [ ] Configurar certificados SSL
- [ ] Ejecutar tests
- [ ] Revisar logs de seguridad

### Post-despliegue
- [ ] Verificar health checks
- [ ] Probar flujo de autenticación
- [ ] Verificar integración con Google Classroom
- [ ] Configurar monitoreo y alertas
- [ ] Configurar backups
- [ ] Documentar URLs de producción
- [ ] Notificar al equipo

### URLs de Producción (Ejemplo)
- **Frontend**: https://platform.semillerodigital.com
- **Backend API**: https://api.semillerodigital.com
- **Health Check**: https://api.semillerodigital.com/health
- **Documentación**: https://docs.semillerodigital.com

## 🆘 Troubleshooting

### Problemas Comunes

#### Error de CORS en producción
```javascript
// Verificar configuración de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### Error de Google OAuth
- Verificar URLs de redirección en Google Cloud Console
- Verificar que el dominio esté autorizado
- Verificar variables de entorno

#### Error de conexión a base de datos
- Verificar IP whitelist en MongoDB Atlas
- Verificar credenciales de conexión
- Verificar conectividad de red

### Logs Útiles
```bash
# Ver logs en tiempo real (Railway)
railway logs

# Ver logs en Heroku
heroku logs --tail

# Ver logs en Docker
docker logs container_name -f
```
