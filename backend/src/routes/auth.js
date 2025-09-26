const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { 
  getAuthUrl, 
  getTokens, 
  getUserInfo,
  refreshAccessToken 
} = require('../config/googleAuth');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/auth/google
// @desc    Obtener URL de autorización de Google
// @access  Public
router.get('/google', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generando URL de autorización:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo generar la URL de autorización'
    });
  }
});

// @route   GET /auth/google/callback (sin /api para coincidir con Google OAuth)
// @desc    Manejar callback de Google OAuth y procesar directamente
// @access  Public
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      console.error('Error en OAuth:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }

    // Procesar el código directamente aquí
    try {
      // Obtener tokens de Google
      const tokens = await getTokens(code);
      
      // Obtener información del usuario
      const userInfo = await getUserInfo(tokens.access_token);

      // Verificar si MongoDB está conectado
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.log('⚠️  MongoDB no conectado, creando usuario temporal');
        
        // Generar JWT token sin base de datos
        const jwtToken = jwt.sign(
          { 
            userId: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            role: 'student' // Rol por defecto
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${jwtToken}`);
      }

      // Buscar o crear usuario en la base de datos
      let user = await User.findOne({ 
        $or: [
          { googleId: userInfo.id },
          { email: userInfo.email }
        ]
      });

      if (user) {
        // Usuario existente - actualizar información
        user.name = userInfo.name;
        user.picture = userInfo.picture;
        user.accessToken = tokens.access_token;
        user.refreshToken = tokens.refresh_token || user.refreshToken;
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Nuevo usuario - crear registro
        user = new User({
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          role: 'student', // Rol por defecto
          lastLogin: new Date()
        });
        await user.save();
      }

      // Generar JWT token
      const jwtToken = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );

      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${jwtToken}`);
      
    } catch (authError) {
      console.error('Error procesando autenticación:', authError);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    
  } catch (error) {
    console.error('Error en callback de Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=callback_error`);
  }
});

// @route   POST /api/auth/google/callback
// @desc    Manejar callback de Google OAuth
// @access  Public
router.post('/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Código de autorización requerido' 
      });
    }

    // Obtener tokens de Google
    const tokens = await getTokens(code);
    
    // Obtener información del usuario
    const userInfo = await getUserInfo(tokens.access_token);

    // Buscar o crear usuario en la base de datos
    let user = await User.findOne({ 
      $or: [
        { googleId: userInfo.id },
        { email: userInfo.email }
      ]
    });

    if (user) {
      // Actualizar tokens y información del usuario existente
      user.googleTokens = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date)
      };
      user.name = userInfo.name;
      user.picture = userInfo.picture;
      user.lastLogin = new Date();
    } else {
      // Crear nuevo usuario
      // Determinar rol basado en el dominio del email o configuración
      let role = 'student'; // Por defecto
      
      // Lógica para asignar roles automáticamente
      if (userInfo.email.includes('@semillerodigital.org') || 
          userInfo.email.includes('@coordinador.')) {
        role = 'coordinator';
      } else if (userInfo.email.includes('@profesor.') || 
                 userInfo.email.includes('@teacher.')) {
        role = 'teacher';
      }
      
      user = new User({
        email: userInfo.email,
        googleId: userInfo.id,
        name: userInfo.name,
        picture: userInfo.picture,
        role: role,
        googleTokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: new Date(tokens.expiry_date)
        }
      });
    }

    await user.save();

    // Generar JWT
    const payload = {
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.json({
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error en callback de Google:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo completar la autenticación'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Obtener información del usuario autenticado
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-googleTokens');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    res.json(user.getPublicProfile());
  } catch (error) {
    console.error('Error obteniendo información del usuario:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refrescar token de acceso
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.googleTokens.refreshToken) {
      return res.status(401).json({ 
        error: 'Token de actualización no disponible' 
      });
    }

    // Refrescar token de Google
    const newTokens = await refreshAccessToken(user.googleTokens.refreshToken);
    
    // Actualizar tokens en la base de datos
    user.googleTokens.accessToken = newTokens.access_token;
    user.googleTokens.expiryDate = new Date(newTokens.expiry_date);
    
    if (newTokens.refresh_token) {
      user.googleTokens.refreshToken = newTokens.refresh_token;
    }

    await user.save();

    res.json({ 
      message: 'Token actualizado correctamente',
      expiryDate: user.googleTokens.expiryDate
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo refrescar el token'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Cerrar sesión del usuario
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // En una implementación más compleja, aquí podrías invalidar el token
    // o mantener una lista negra de tokens
    
    res.json({ 
      message: 'Sesión cerrada correctamente' 
    });
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
});

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario con email y password
// @access  Public
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Nombre debe tener al menos 2 caracteres'),
  body('role')
    .optional()
    .isIn(['student', 'teacher', 'coordinator', 'admin'])
    .withMessage('Rol inválido')
], async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { email, password, name, role = 'student' } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        error: 'El usuario ya existe',
        message: 'Ya existe una cuenta con este email'
      });
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      name,
      role,
      authMethod: 'local',
      lastLogin: new Date()
    });

    await user.save();

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo registrar el usuario'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login con email y password
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido es requerido'),
  body('password')
    .notEmpty()
    .withMessage('Password es requerido')
], async (req, res) => {
  try {
    // Validar entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o password incorrectos'
      });
    }

    // Verificar si el usuario tiene password (no solo Google OAuth)
    if (!user.password) {
      return res.status(401).json({
        error: 'Método de autenticación inválido',
        message: 'Esta cuenta solo puede acceder con Google OAuth'
      });
    }

    // Verificar password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o password incorrectos'
      });
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Cuenta desactivada',
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudo completar el login'
    });
  }
});

module.exports = router;
