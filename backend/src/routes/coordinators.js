const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// @route   GET /api/coordinators/dashboard
// @desc    Obtener métricas del dashboard para coordinadores
// @access  Private
router.get('/dashboard', auth, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    // Métricas básicas
    const totalStudents = await User.countDocuments({ 
      role: 'student', 
      isActive: true 
    });

    const totalTeachers = await User.countDocuments({ 
      role: 'teacher', 
      isActive: true 
    });

    const totalCourses = await Course.countDocuments({ 
      courseState: 'ACTIVE' 
    });

    // Estudiantes por cohorte
    const studentsByCohort = await User.aggregate([
      { 
        $match: { 
          role: 'student', 
          isActive: true,
          'metadata.cohort': { $exists: true, $ne: null }
        } 
      },
      { 
        $group: { 
          _id: '$metadata.cohort', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $sort: { _id: 1 } 
      }
    ]);

    // Estudiantes por programa
    const studentsByProgram = await User.aggregate([
      { 
        $match: { 
          role: 'student', 
          isActive: true,
          'metadata.specialization': { $exists: true, $ne: null }
        } 
      },
      { 
        $group: { 
          _id: '$metadata.specialization', 
          count: { $sum: 1 } 
        } 
      },
      { 
        $sort: { count: -1 } 
      }
    ]);

    // Actividad reciente (últimos logins)
    const recentActivity = await User.find({
      isActive: true,
      lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // última semana
    })
    .select('name email role lastLogin metadata.cohort')
    .sort({ lastLogin: -1 })
    .limit(10);

    res.json({
      metrics: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeUsersLastWeek: recentActivity.length
      },
      distribution: {
        studentsByCohort,
        studentsByProgram
      },
      recentActivity: recentActivity.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        cohort: user.metadata?.cohort,
        lastLogin: user.lastLogin
      }))
    });

  } catch (error) {
    console.error('Error obteniendo métricas del dashboard:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las métricas'
    });
  }
});

// @route   GET /api/coordinators/reports/attendance
// @desc    Generar reporte de asistencia
// @access  Private
router.get('/reports/attendance', auth, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const { cohort, startDate, endDate } = req.query;

    // Por ahora retornamos estructura básica
    // En una implementación completa, esto se conectaría con Google Calendar
    res.json({
      message: 'Reporte de asistencia - Funcionalidad en desarrollo',
      parameters: { cohort, startDate, endDate },
      note: 'Esta funcionalidad se implementará conectando con Google Calendar API'
    });

  } catch (error) {
    console.error('Error generando reporte de asistencia:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// @route   GET /api/coordinators/reports/progress
// @desc    Generar reporte de progreso de estudiantes
// @access  Private
router.get('/reports/progress', auth, authorize('coordinator', 'admin'), async (req, res) => {
  try {
    const { cohort, courseId } = req.query;

    // Por ahora retornamos estructura básica
    res.json({
      message: 'Reporte de progreso - Funcionalidad en desarrollo',
      parameters: { cohort, courseId },
      note: 'Esta funcionalidad se implementará analizando entregas de Google Classroom'
    });

  } catch (error) {
    console.error('Error generando reporte de progreso:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
