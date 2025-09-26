# Guía de Configuración - Semillero Digital Platform

Esta guía te ayudará a configurar y ejecutar la plataforma complementaria de Semillero Digital.

## 📋 Prerrequisitos

- Node.js 18+ y npm 8+
- MongoDB (local o Atlas)
- Cuenta de Google Cloud Platform
- Git

## 🚀 Instalación Rápida

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd semillero-platform
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Configurar variables de entorno**
```bash
# Backend
cp backend/.env.example backend/.env
# Frontend
cp frontend/.env.example frontend/.env
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

## ⚙️ Configuración Detallada

### 1. Google Cloud Platform Setup

#### Crear Proyecto en Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Google Classroom API
   - Google OAuth2 API
   - Google Calendar API (opcional)

#### Configurar OAuth 2.0
1. Ve a "Credenciales" en el menú lateral
2. Clic en "Crear credenciales" > "ID de cliente de OAuth 2.0"
3. Configura la pantalla de consentimiento OAuth
4. Crea credenciales para aplicación web:
   - **URIs de origen autorizados**: `http://localhost:3000`
   - **URIs de redirección autorizados**: `http://localhost:5000/auth/google/callback`

#### Crear Service Account (Opcional)
1. Ve a "Credenciales" > "Crear credenciales" > "Cuenta de servicio"
2. Descarga el archivo JSON de credenciales
3. Guárdalo como `backend/credentials/service-account-key.json`

### 2. Configuración de Variables de Entorno

#### Backend (.env)
```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/semillero-digital

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Service Account (opcional)
GOOGLE_APPLICATION_CREDENTIALS=./credentials/service-account-key.json
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_CLIENT_ID=tu_client_id_aqui
REACT_APP_ENVIRONMENT=development
```

### 3. Base de Datos

#### MongoDB Local
```bash
# Instalar MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Iniciar servicio
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### MongoDB Atlas (Recomendado)
1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster gratuito
3. Configura acceso de red (0.0.0.0/0 para desarrollo)
4. Crea un usuario de base de datos
5. Obtén la URI de conexión y úsala en `MONGODB_URI`

## 🏃‍♂️ Ejecutar la Aplicación

### Desarrollo
```bash
# Ejecutar backend y frontend simultáneamente
npm run dev

# O ejecutar por separado
npm run dev:backend  # Puerto 5000
npm run dev:frontend # Puerto 3000
```

### Producción
```bash
# Construir frontend
npm run build

# Ejecutar backend
npm start
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests del backend
cd backend && npm test

# Tests del frontend
cd frontend && npm test
```

## 📝 Verificación de la Instalación

1. **Backend**: Visita `http://localhost:5000/health`
   - Deberías ver: `{"status": "OK", "message": "Semillero Digital API funcionando correctamente"}`

2. **Frontend**: Visita `http://localhost:3000`
   - Deberías ver la página de login

3. **Autenticación**: Intenta hacer login con Google
   - Deberías ser redirigido al dashboard después del login exitoso

## 🔧 Solución de Problemas

### Error: "GOOGLE_CLIENT_ID no definido"
- Verifica que hayas copiado correctamente las variables de entorno
- Asegúrate de que el archivo `.env` esté en la carpeta correcta

### Error: "MongoDB connection failed"
- Verifica que MongoDB esté ejecutándose
- Comprueba la URI de conexión en `MONGODB_URI`

### Error: "Token de Google inválido"
- Verifica que las URLs de redirección en Google Cloud Console coincidan
- Asegúrate de que el `GOOGLE_CLIENT_SECRET` sea correcto

### Error de CORS
- Verifica que `FRONTEND_URL` en el backend coincida con la URL del frontend
- En desarrollo, debería ser `http://localhost:3000`

## 📚 Recursos Adicionales

- [Documentación de Google Classroom API](https://developers.google.com/classroom)
- [Documentación de React](https://reactjs.org/docs)
- [Documentación de Express.js](https://expressjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)

## 🆘 Soporte

Si encuentras problemas durante la configuración:

1. Revisa los logs en la consola
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que todas las dependencias estén instaladas
4. Contacta al equipo de desarrollo de Semillero Digital
