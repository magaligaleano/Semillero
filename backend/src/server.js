const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const classroomRoutes = require('./routes/classroom');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const coordinatorRoutes = require('./routes/coordinators');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Conectar a la base de datos
connectDB();

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// Rate limiting - Temporalmente deshabilitado para desarrollo
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana de tiempo
//   message: {
//     error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
//   },
//   trustProxy: false, // Deshabilitar trust proxy para evitar el error
//   skip: (req) => {
//     // Saltar rate limiting para rutas de callback de OAuth
//     return req.path.includes('/auth/google/callback');
//   }
// });
// app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Semillero Digital API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Ruta especial para callback de Google (sin /api)
app.use('/auth', authRoutes);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/classroom', classroomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `No se pudo encontrar ${req.originalUrl} en este servidor`
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV}`);
  console.log(`📚 API disponible en: http://localhost:${PORT}/api`);
  console.log(`🔗 Servidor accesible desde: http://0.0.0.0:${PORT}`);
});
