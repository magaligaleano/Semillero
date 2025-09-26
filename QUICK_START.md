# 🚀 Inicio Rápido - Semillero Digital

## ⚡ En 5 minutos

```bash
# 1. Clonar e instalar
git clone <repository-url>
cd semillero-digital-platform
npm run install:all

# 2. Configurar entorno
cp backend/.env.example backend/.env

# 3. Iniciar MongoDB
npm run docker:up

# 4. Crear usuarios de prueba
cd backend && npm run seed && cd ..

# 5. Iniciar aplicación
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **MongoDB UI**: http://localhost:8081

## 👥 Login Rápido

Ve a http://localhost:3001 y usa cualquiera de estos usuarios:

| Usuario | Email | Password | Rol |
|---------|-------|----------|-----|
| **Admin** | `admin@semillero.dev` | `admin123` | Administrador |
| **Coordinador** | `coordinador@semillero.dev` | `coord123` | Coordinador |
| **Profesor** | `profesor@semillero.dev` | `prof123` | Profesor |
| **Estudiante** | `test@semillero.dev` | `test123` | Estudiante |

## 🎯 Qué Probar

### Como Administrador
1. Login con `admin@semillero.dev` / `admin123`
2. Ver dashboard con estadísticas completas
3. Navegar por todas las secciones

### Como Estudiante
1. Login con `test@semillero.dev` / `test123`
2. Ver dashboard de estudiante
3. Intentar acceder a Google Classroom (mostrará botón de conexión)

### Google OAuth (Opcional)
1. Configurar credenciales en `backend/.env`
2. Usar "Continuar con Google" en login
3. Acceder a funcionalidades completas de Classroom

## 🔧 Comandos Útiles

```bash
# Reiniciar todo
npm run docker:reset && npm run dev

# Ver logs
npm run docker:logs

# Solo backend
npm run dev:backend

# Solo frontend  
npm run dev:frontend
```

## 🚨 Problemas Comunes

**Puerto ocupado**: Cambiar a 3001 o matar proceso
```bash
lsof -ti:3000 | xargs kill -9
```

**MongoDB no conecta**: Verificar Docker
```bash
docker ps
npm run docker:up
```

**Sin usuarios**: Ejecutar migración
```bash
cd backend && npm run seed
```

---

📖 **Documentación completa**: [README.md](README.md)
