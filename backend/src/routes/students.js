const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/students
// @desc    Obtener lista de estudiantes (solo coordinadores y profesores)
// @access  Private
router.get('/', auth, authorize('teacher', 'coordinator', 'admin'), async (req, res) => {
  try {
    const { cohort, program, page = 1, limit = 20 } = req.query;
    
    const query = { role: 'student', isActive: true };
    
    if (cohort) {
      query['metadata.cohort'] = cohort;
    }
    
    if (program) {
      query['metadata.specialization'] = program;
    }

    const skip = (page - 1) * limit;
    
    const students = await User.find(query)
      .select('-googleTokens')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'metadata.enrollmentDate': -1 });

    const total = await User.countDocuments(query);

    res.json({
      students: students.map(student => student.getPublicProfile()),
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: students.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los estudiantes'
    });
  }
});

// @route   GET /api/students/:id
// @desc    Obtener información de un estudiante específico
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    const student = await User.findById(id).select('-googleTokens');
    
    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }

    // Los estudiantes solo pueden ver su propia información
    if (requestingUser.role === 'student' && requestingUser.id !== id) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: 'Solo puedes ver tu propia información'
      });
    }

    res.json(student.getPublicProfile());

  } catch (error) {
    console.error('Error obteniendo estudiante:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Actualizar información de un estudiante
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const updates = req.body;

    // Los estudiantes solo pueden actualizar su propia información
    if (requestingUser.role === 'student' && requestingUser.id !== id) {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: 'Solo puedes actualizar tu propia información'
      });
    }

    // Campos que pueden ser actualizados
    const allowedUpdates = ['preferences', 'metadata'];
    const filteredUpdates = {};

    allowedUpdates.forEach(field => {
      if (updates[field]) {
        filteredUpdates[field] = updates[field];
      }
    });

    const student = await User.findByIdAndUpdate(
      id,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-googleTokens');

    if (!student) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }

    res.json({
      message: 'Información actualizada correctamente',
      student: student.getPublicProfile()
    });

  } catch (error) {
    console.error('Error actualizando estudiante:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
