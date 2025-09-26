const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Obtener token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        message: 'No se proporcionó token de autorización'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada'
      });
    }

    // Agregar usuario a la request
    req.user = decoded.user;
    req.userDoc = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        message: 'El token proporcionado no es válido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'El token ha expirado, por favor inicia sesión nuevamente'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

// Middleware para verificar roles específicos
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Acceso denegado',
        message: 'Debes estar autenticado para acceder a este recurso'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        message: `Se requiere uno de los siguientes roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware para verificar que el token de Google no ha expirado
const checkGoogleToken = async (req, res, next) => {
  try {
    const user = req.userDoc;
    
    if (!user.googleTokens.accessToken) {
      return res.status(401).json({ 
        error: 'Token de Google no disponible',
        message: 'Debes reautenticarte con Google'
      });
    }

    if (user.isTokenExpired()) {
      return res.status(401).json({ 
        error: 'Token de Google expirado',
        message: 'Tu sesión con Google ha expirado, por favor reautentícate',
        requiresReauth: true
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando token de Google:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  auth,
  authorize,
  checkGoogleToken
};
