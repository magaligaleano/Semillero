# Semillero Digital - Plataforma Complementaria

Una aplicación web que complementa Google Classroom para mejorar el seguimiento de estudiantes, comunicación y métricas en Semillero Digital.

## 🎯 Objetivos

- **Seguimiento del progreso**: Vista consolidada del avance por alumno, clase y profesor
- **Comunicación clara**: Notificaciones importantes sin pérdidas
- **Métricas ágiles**: Datos de asistencia, participación y entregas de manera eficiente

## 🏗️ Arquitectura

```
semillero-platform/
├── backend/          # API REST con Node.js + Express
├── frontend/         # Aplicación React
└── docs/            # Documentación del proyecto
```

## 🚀 Tecnologías

### Backend
- Node.js + Express.js
- Google Classroom API
- Google OAuth 2.0
- MongoDB/PostgreSQL (por definir)
- JWT para autenticación

### Frontend
- React 18
- Material-UI o Tailwind CSS
- Axios para API calls
- React Router para navegación

## 📋 Funcionalidades Principales

### Core Features
- [x] Estructura base del proyecto
- [ ] Integración con Google Classroom API
- [ ] Sistema de autenticación con Google
- [ ] Dashboard de estudiantes
- [ ] Dashboard de profesores
- [ ] Dashboard de coordinadores
- [ ] Seguimiento de progreso
- [ ] Sistema de notificaciones

### Features Opcionales
- [ ] Notificaciones automáticas (Email, WhatsApp, Telegram)
- [ ] Reportes gráficos de avance
- [ ] Módulo de asistencia con Google Calendar
- [ ] Sistema de roles avanzado

## 🛠️ Instalación y Desarrollo

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd semillero-platform

# Ejecutar script de configuración automática
./scripts/dev-setup.sh

# O instalación manual:
npm run install:all

# Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Editar archivos .env con tus credenciales

# Ejecutar en modo desarrollo
npm run dev
```

### Comandos Disponibles
```bash
npm run dev              # Ejecutar backend y frontend simultáneamente
npm run dev:backend      # Solo backend (puerto 5000)
npm run dev:frontend     # Solo frontend (puerto 3000)
npm run install:all      # Instalar todas las dependencias
npm run build           # Construir frontend para producción
npm run test            # Ejecutar tests
npm run lint            # Verificar código con ESLint
```

## 📝 Configuración Detallada

### 1. Google Cloud Platform
1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar APIs necesarias:
   - Google Classroom API
   - Google OAuth2 API
   - Google Calendar API (opcional)
3. Crear credenciales OAuth 2.0
4. Configurar pantalla de consentimiento

### 2. Variables de Entorno
Ver archivos `.env.example` en backend y frontend para configuración completa.

### 3. Base de Datos
- **Desarrollo**: MongoDB local o MongoDB Atlas
- **Producción**: MongoDB Atlas (recomendado)

📚 **Documentación completa**: [docs/SETUP.md](docs/SETUP.md)

## 📚 Documentación

- **[Guía de Configuración](docs/SETUP.md)** - Instalación y configuración detallada
- **[Documentación de API](docs/API.md)** - Endpoints y ejemplos de uso
- **[Guía de Despliegue](docs/DEPLOYMENT.md)** - Despliegue en producción

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Producción
Ver [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para opciones de despliegue en:
- Vercel + Railway (recomendado para MVP)
- Heroku
- Docker + VPS
- AWS

## 🧪 Testing

```bash
npm test                 # Ejecutar todos los tests
cd backend && npm test   # Tests del backend
cd frontend && npm test  # Tests del frontend
```

## 🤝 Contribución

Este proyecto es parte de la Vibeathon de Semillero Digital. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si encuentras problemas o tienes preguntas:
- Revisa la [documentación](docs/)
- Crea un [issue](../../issues) en GitHub
- Contacta al equipo de Semillero Digital

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ para Semillero Digital**
