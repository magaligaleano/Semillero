const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/teachers
// @desc    Obtener lista de profesores
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await User.find({ 
      role: { $in: ['teacher', 'coordinator'] }, 
      isActive: true 
    })
    .select('-googleTokens')
    .sort({ name: 1 });

    res.json({
      teachers: teachers.map(teacher => teacher.getPublicProfile()),
      total: teachers.length
    });

  } catch (error) {
    console.error('Error obteniendo profesores:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los profesores'
    });
  }
});

module.exports = router;
