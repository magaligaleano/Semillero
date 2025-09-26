# 🐳 Configuración Docker para Semillero Digital

## Requisitos Previos

- Docker instalado (con Docker Compose v2)
- Node.js 18+ (para el desarrollo local)

## 🚀 Inicio Rápido

### 1. Levantar MongoDB con Docker

```bash
# Levantar solo la base de datos
npm run docker:up

# Ver logs de los contenedores
npm run docker:logs

# Verificar que MongoDB esté funcionando
docker ps
```

### 2. Ejecutar la aplicación

```bash
# Opción 1: Levantar Docker y la app en un comando
npm run dev:docker

# Opción 2: Paso a paso
npm run docker:up
sleep 5
npm run dev
```

## 📊 Servicios Disponibles

### MongoDB
- **Puerto**: 27017
- **Usuario**: semillero-user
- **Contraseña**: semillero-dev-password
- **Base de datos**: semillero-digital

### Mongo Express (Interfaz Web)
- **URL**: http://localhost:8081
- **Usuario**: admin
- **Contraseña**: semillero123

### Aplicación
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🔧 Comandos Útiles

```bash
# Detener contenedores
npm run docker:down

# Reiniciar completamente (borra datos)
npm run docker:reset

# Ver logs en tiempo real
npm run docker:logs

# Conectarse a MongoDB directamente
docker exec -it semillero-mongodb mongosh -u admin -p semillero123

# Ver estado de contenedores
docker ps
```

## 🗃️ Estructura de Datos

Al inicializar, MongoDB crea:
- Usuario administrador: `admin@semillero.dev`
- Colecciones: `users`, `courses`, `notifications`
- Usuario de aplicación con permisos de lectura/escritura

## 🔄 Cambiar entre MongoDB Atlas y Docker

### Para usar Docker (desarrollo):
1. Asegúrate de que `backend/.env.development` tenga:
   ```
   MONGODB_URI=mongodb://semillero-user:semillero-dev-password@localhost:27017/semillero-digital?authSource=semillero-digital
   ```

### Para usar MongoDB Atlas (producción):
1. Usa el archivo `backend/.env` con tu URI de Atlas
2. Establece `NODE_ENV=production`

## ⚠️ Solución de Problemas

### Error: "MongoDB connection failed"
```bash
# Verificar que Docker esté ejecutándose
docker ps

# Reiniciar contenedores
npm run docker:reset
```

### Error: "Port already in use"
```bash
# Ver qué está usando el puerto
lsof -i :27017
lsof -i :8081

# Detener contenedores existentes
docker stop $(docker ps -q)
```

### Limpiar completamente Docker
```bash
# Detener y eliminar todo
docker compose down -v
docker system prune -f
```
