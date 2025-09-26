# 🌱 Semillero Digital - Plataforma Complementaria

Una aplicación web completa que complementa Google Classroom para mejorar el seguimiento de estudiantes, comunicación y métricas en Semillero Digital. Desarrollada para la **Vibeathon 2024**.

## 🎯 Objetivos

- **Seguimiento del progreso**: Vista consolidada del avance por alumno, clase y profesor
- **Comunicación clara**: Notificaciones importantes sin pérdidas  
- **Métricas ágiles**: Datos de asistencia, participación y entregas de manera eficiente
- **Accesibilidad**: Soporte para usuarios con y sin Google OAuth

## 🏗️ Arquitectura

```
semillero-digital-platform/
├── backend/              # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/      # Configuración de BD y Google OAuth
│   │   ├── middleware/  # Autenticación y validaciones
│   │   ├── models/      # Modelos de MongoDB
│   │   ├── routes/      # Endpoints de la API
│   │   └── migrations/  # Scripts de migración de datos
├── frontend/            # Aplicación React con Material-UI
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── contexts/    # Context API (Auth, etc.)
│   │   ├── pages/       # Páginas principales
│   │   └── utils/       # Utilidades y helpers
└── docker-compose.yml   # MongoDB local con Docker
```

## 🚀 Tecnologías

### Backend
- **Node.js + Express.js** - Servidor y API REST
- **MongoDB + Mongoose** - Base de datos con Docker
- **Google Classroom API** - Integración con Google Classroom
- **Google OAuth 2.0** - Autenticación con Google
- **JWT + bcrypt** - Autenticación local y seguridad
- **express-validator** - Validación de datos

### Frontend  
- **React 18** - Framework principal
- **Material-UI (MUI)** - Componentes y diseño
- **React Router** - Navegación SPA
- **Axios** - Cliente HTTP
- **Context API** - Manejo de estado global

### DevOps & Tools
- **Docker + Docker Compose** - MongoDB local
- **Nodemon** - Hot reload en desarrollo
- **Concurrently** - Ejecución paralela de procesos

## ✨ Funcionalidades Implementadas

### 🔐 Sistema de Autenticación Dual
- [x] **Login tradicional** con email/password
- [x] **Google OAuth 2.0** para acceso completo a Classroom
- [x] **Registro de usuarios** con validación
- [x] **Roles de usuario**: Admin, Coordinador, Profesor, Estudiante
- [x] **JWT tokens** para sesiones seguras

### 👥 Gestión de Usuarios
- [x] **Usuarios de prueba** preconfigurados
- [x] **Perfiles de usuario** con información completa
- [x] **Sistema de roles** con permisos diferenciados
- [x] **Migración de datos** automatizada

### 📊 Dashboard Inteligente
- [x] **Dashboard adaptativo** según rol de usuario
- [x] **Estadísticas personalizadas** por rol
- [x] **Integración con Google Classroom** (para usuarios OAuth)
- [x] **Manejo inteligente de errores** y estados

### 🎨 Interfaz de Usuario
- [x] **Diseño responsive** con Material-UI
- [x] **Tema moderno** y accesible
- [x] **Navegación intuitiva** con sidebar
- [x] **Componentes reutilizables** y consistentes
- [x] **Loading states** y feedback visual

### 🔧 Funcionalidades Técnicas
- [x] **API REST completa** con documentación
- [x] **Middleware de autenticación** robusto
- [x] **Validación de datos** en frontend y backend
- [x] **Manejo de errores** centralizado
- [x] **Logging detallado** para debugging

## 🛠️ Instalación y Desarrollo

### ⚡ Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd semillero-digital-platform

# 2. Instalar dependencias
npm run install:all

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales de Google OAuth

# 4. Iniciar MongoDB con Docker
npm run docker:up

# 5. Ejecutar migraciones (crear usuarios de prueba)
cd backend && npm run seed

# 6. Iniciar aplicación en modo desarrollo
npm run dev
```

### 🐳 Configuración con Docker

La aplicación usa Docker para MongoDB local:

```bash
# Iniciar servicios de Docker
npm run docker:up

# Ver logs de MongoDB
npm run docker:logs

# Reiniciar y limpiar datos
npm run docker:reset

# Detener servicios
npm run docker:down
```

### 📋 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Backend (5000) + Frontend (3000)
npm run dev:backend      # Solo backend
npm run dev:frontend     # Solo frontend
npm run dev:docker       # Docker + aplicación

# Instalación
npm run install:all      # Instalar todas las dependencias

# Base de datos
npm run docker:up        # Iniciar MongoDB
npm run docker:down      # Detener MongoDB
npm run docker:reset     # Reiniciar con datos limpios

# Migraciones
cd backend && npm run seed        # Crear usuarios de prueba
cd backend && npm run seed:users  # Alias del comando anterior

# Construcción y testing
npm run build           # Build para producción
npm run test            # Ejecutar tests
npm run lint            # Verificar código con ESLint
```

## 📝 Configuración Detallada

### 🔑 Variables de Entorno (backend/.env)

```bash
# Servidor
PORT=5000
NODE_ENV=development

# MongoDB (Docker local)
MONGODB_URI=mongodb://semillero-user:semillero-dev-password@localhost:27017/semillero-digital?authSource=semillero-digital

# Google OAuth 2.0 (REQUERIDO para funcionalidades de Classroom)
GOOGLE_CLIENT_ID=tu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_google_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

### 🌐 Google Cloud Platform (Opcional)

Para funcionalidades completas de Google Classroom:

1. **Crear proyecto** en [Google Cloud Console](https://console.cloud.google.com/)
2. **Habilitar APIs**:
   - Google Classroom API
   - Google OAuth2 API
3. **Crear credenciales OAuth 2.0**:
   - Tipo: Aplicación web
   - URIs de redirección: `http://localhost:5000/auth/google/callback`
4. **Configurar pantalla de consentimiento**
5. **Copiar credenciales** al archivo `.env`

> **Nota**: Sin Google OAuth, la aplicación funciona con autenticación local pero sin acceso a Google Classroom.

### 🗄️ Base de Datos

**MongoDB con Docker (Recomendado para desarrollo)**:
- Usuario: `semillero-user`
- Password: `semillero-dev-password`
- Base de datos: `semillero-digital`
- Puerto: `27017`
- Interfaz web: http://localhost:8081 (Mongo Express)

**MongoDB Atlas (Para producción)**:
- Cambiar `MONGODB_URI` en `.env`
- Configurar IP whitelist
- Usar credenciales de Atlas

## 👥 Usuarios de Prueba

Después de ejecutar `npm run seed`, tendrás estos usuarios disponibles:

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| `admin@semillero.dev` | `admin123` | **Admin** | Acceso completo al sistema |
| `coordinador@semillero.dev` | `coord123` | **Coordinador** | Gestión de cursos y profesores |
| `profesor@semillero.dev` | `prof123` | **Profesor** | Gestión de clases y estudiantes |
| `estudiante1@semillero.dev` | `est123` | **Estudiante** | Vista de estudiante |
| `test@semillero.dev` | `test123` | **Estudiante** | Usuario de pruebas generales |

## 🎮 Cómo Usar la Aplicación

### 1️⃣ **Acceso Inicial**
```
🌐 Frontend: http://localhost:3001
🔧 Backend API: http://localhost:5000
📊 MongoDB UI: http://localhost:8081
```

### 2️⃣ **Login**
1. Ve a http://localhost:3001
2. **Opción A - Login Tradicional**:
   - Haz clic en "Ver usuarios de prueba"
   - Selecciona cualquier usuario (auto-completa credenciales)
   - Haz clic en "Iniciar Sesión"
3. **Opción B - Google OAuth**:
   - Haz clic en "Continuar con Google"
   - Autoriza la aplicación (requiere configuración previa)

### 3️⃣ **Navegación**
- **Dashboard**: Vista principal con estadísticas según tu rol
- **Cursos**: Gestión de cursos (requiere Google OAuth)
- **Usuarios**: Administración de usuarios (solo Admin/Coordinador)
- **Notificaciones**: Sistema de alertas
- **Perfil**: Configuración personal

### 4️⃣ **Funcionalidades por Rol**

**👑 Administrador**:
- Gestión completa de usuarios
- Acceso a todas las secciones
- Configuración del sistema

**📋 Coordinador**:
- Dashboard con métricas generales
- Gestión de profesores y estudiantes
- Reportes y estadísticas

**👨‍🏫 Profesor**:
- Vista de sus cursos y estudiantes
- Gestión de tareas y calificaciones
- Comunicación con estudiantes

**🎓 Estudiante**:
- Vista de sus cursos inscritos
- Seguimiento de tareas y progreso
- Notificaciones importantes

## 🔧 Desarrollo y API

### 📡 Endpoints Principales

```bash
# Autenticación
POST /api/auth/login          # Login tradicional
POST /api/auth/register       # Registro de usuario
GET  /api/auth/google         # Iniciar OAuth con Google
GET  /api/auth/me             # Información del usuario actual

# Usuarios
GET  /api/users               # Listar usuarios (Admin/Coordinador)
PUT  /api/users/:id           # Actualizar usuario

# Google Classroom
GET  /api/classroom/courses   # Cursos de Classroom (requiere OAuth)
GET  /api/classroom/students  # Estudiantes de un curso

# Dashboard
GET  /api/coordinators/dashboard  # Datos del dashboard
```

### 🧪 Testing y Debugging

```bash
# Logs del servidor
npm run dev:backend

# Logs de MongoDB
npm run docker:logs

# Probar endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@semillero.dev", "password": "test123"}'
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
# Frontend: http://localhost:3001
# Backend: http://localhost:5000
# MongoDB: Docker local
```

### Producción
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Heroku, VPS
- **Base de datos**: MongoDB Atlas
- **Variables de entorno**: Configurar en plataforma de despliegue

## 🚨 Solución de Problemas

### ❌ Errores Comunes

**"Cannot connect to MongoDB"**
```bash
# Verificar que Docker esté ejecutándose
docker ps

# Reiniciar MongoDB
npm run docker:reset
```

**"Google OAuth not configured"**
- Configurar variables `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env`
- O usar login tradicional sin Google OAuth

**"Port already in use"**
```bash
# Cambiar puertos en package.json o matar procesos
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
```

**"Users not found"**
```bash
# Ejecutar migración de usuarios
cd backend && npm run seed
```

### 🔍 Debugging

```bash
# Ver logs detallados
npm run dev:backend  # Logs del servidor
npm run docker:logs  # Logs de MongoDB

# Verificar conexión a base de datos
curl http://localhost:5000/api/auth/me

# Verificar usuarios en base de datos
# Ir a http://localhost:8081 (Mongo Express)
```

## 🎯 Roadmap

### 🚧 Próximas Funcionalidades
- [ ] **Notificaciones en tiempo real** con WebSockets
- [ ] **Reportes avanzados** con gráficos y métricas
- [ ] **Integración con Google Calendar** para horarios
- [ ] **Sistema de mensajería** entre usuarios
- [ ] **Módulo de asistencia** automatizado
- [ ] **App móvil** con React Native
- [ ] **Notificaciones push** y por email
- [ ] **Integración con WhatsApp** para alertas

### 🎨 Mejoras de UI/UX
- [ ] **Tema oscuro** y personalización
- [ ] **PWA** (Progressive Web App)
- [ ] **Accesibilidad** mejorada
- [ ] **Internacionalización** (i18n)

## 🤝 Contribución

Este proyecto es parte de la **Vibeathon 2024** de Semillero Digital. Para contribuir:

1. **Fork** el proyecto
2. **Crea una rama** para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/NuevaFuncionalidad`)
5. **Abre un Pull Request**

### 📋 Guidelines
- Seguir las convenciones de código existentes
- Agregar tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario
- Usar commits descriptivos en español

## 📞 Soporte

Si encuentras problemas o tienes preguntas:

- 📖 **Documentación**: Revisa este README completo
- 🐛 **Bugs**: Crea un [issue](../../issues) en GitHub
- 💬 **Preguntas**: Contacta al equipo de Semillero Digital
- 📧 **Email**: [contacto@semillerodigital.com](mailto:contacto@semillerodigital.com)

## 👥 Equipo

Desarrollado con ❤️ por el equipo de **Semillero Digital** para la **Vibeathon 2024**.

## 📄 Licencia

MIT License - Ver archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**🌱 Semillero Digital - Transformando vidas a través de la tecnología**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://semillerodigital.com)
[![Vibeathon 2024](https://img.shields.io/badge/Vibeathon-2024-blue.svg)](https://vibeathon.com)

</div>
