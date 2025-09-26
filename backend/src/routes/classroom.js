const express = require('express');
const { google } = require('googleapis');
const { auth, checkGoogleToken } = require('../middleware/auth');
const { setCredentials } = require('../config/googleAuth');
const Course = require('../models/Course');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/classroom/courses
// @desc    Obtener cursos de Google Classroom del usuario
// @access  Private
router.get('/courses', auth, async (req, res) => {
  try {
    const user = req.userDoc;
    
    // Verificar si el usuario tiene tokens de Google
    if (!user.googleTokens || !user.googleTokens.accessToken) {
      return res.status(400).json({
        error: 'Google OAuth requerido',
        message: 'Para acceder a Google Classroom, debes autenticarte con Google OAuth',
        requiresGoogleAuth: true
      });
    }

    // Verificar si el token ha expirado
    if (user.isTokenExpired()) {
      return res.status(401).json({
        error: 'Token de Google expirado',
        message: 'Tu sesión con Google ha expirado, por favor reautentícate',
        requiresReauth: true
      });
    }
    
    // Configurar cliente de Google Classroom
    const authClient = setCredentials(user.googleTokens);
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    // Obtener cursos según el rol del usuario
    let coursesResponse;
    if (user.role === 'teacher' || user.role === 'coordinator') {
      // Profesores y coordinadores ven cursos donde son propietarios o profesores
      coursesResponse = await classroom.courses.list({
        teacherId: 'me',
        courseStates: ['ACTIVE']
      });
    } else {
      // Estudiantes ven cursos donde están inscritos
      coursesResponse = await classroom.courses.list({
        studentId: 'me',
        courseStates: ['ACTIVE']
      });
    }

    const courses = coursesResponse.data.courses || [];

    // Sincronizar cursos con la base de datos local
    const syncedCourses = [];
    for (const course of courses) {
      let localCourse = await Course.findOne({ 
        googleClassroomId: course.id 
      });

      if (!localCourse) {
        // Crear nuevo curso en la base de datos
        localCourse = new Course({
          googleClassroomId: course.id,
          name: course.name,
          section: course.section,
          description: course.description,
          room: course.room,
          ownerId: course.ownerId,
          creationTime: new Date(course.creationTime),
          updateTime: new Date(course.updateTime),
          enrollmentCode: course.enrollmentCode,
          courseState: course.courseState,
          alternateLink: course.alternateLink,
          teacherFolder: course.teacherFolder,
          calendarId: course.calendarId
        });
      } else {
        // Actualizar curso existente
        localCourse.name = course.name;
        localCourse.section = course.section;
        localCourse.description = course.description;
        localCourse.updateTime = new Date(course.updateTime);
        localCourse.courseState = course.courseState;
      }

      localCourse.stats.lastSyncDate = new Date();
      await localCourse.save();
      syncedCourses.push(localCourse.getBasicInfo());
    }

    res.json({
      courses: syncedCourses,
      total: syncedCourses.length,
      syncDate: new Date()
    });

  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    
    if (error.code === 401) {
      return res.status(401).json({
        error: 'Token de Google inválido',
        message: 'Debes reautenticarte con Google',
        requiresReauth: true
      });
    }

    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los cursos'
    });
  }
});

// @route   GET /api/classroom/courses/:courseId/students
// @desc    Obtener estudiantes de un curso específico
// @access  Private
router.get('/courses/:courseId/students', auth, checkGoogleToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.userDoc;

    // Verificar que el usuario tenga permisos para ver estudiantes
    if (user.role === 'student') {
      return res.status(403).json({
        error: 'Permisos insuficientes',
        message: 'Los estudiantes no pueden ver la lista de otros estudiantes'
      });
    }

    const authClient = setCredentials(user.googleTokens);
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    // Obtener estudiantes del curso
    const studentsResponse = await classroom.courses.students.list({
      courseId: courseId
    });

    const students = studentsResponse.data.students || [];

    // Enriquecer datos con información local
    const enrichedStudents = [];
    for (const student of students) {
      const localUser = await User.findOne({ 
        googleId: student.userId 
      });

      enrichedStudents.push({
        googleId: student.userId,
        profile: student.profile,
        localData: localUser ? localUser.getPublicProfile() : null
      });
    }

    res.json({
      courseId,
      students: enrichedStudents,
      total: enrichedStudents.length
    });

  } catch (error) {
    console.error('Error obteniendo estudiantes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los estudiantes del curso'
    });
  }
});

// @route   GET /api/classroom/courses/:courseId/coursework
// @desc    Obtener tareas de un curso específico
// @access  Private
router.get('/courses/:courseId/coursework', auth, checkGoogleToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.userDoc;

    const authClient = setCredentials(user.googleTokens);
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    // Obtener tareas del curso
    const courseworkResponse = await classroom.courses.courseWork.list({
      courseId: courseId,
      courseWorkStates: ['PUBLISHED']
    });

    const coursework = courseworkResponse.data.courseWork || [];

    // Si es estudiante, obtener también las entregas
    let submissions = [];
    if (user.role === 'student') {
      for (const work of coursework) {
        try {
          const submissionResponse = await classroom.courses.courseWork.studentSubmissions.list({
            courseId: courseId,
            courseWorkId: work.id,
            userId: 'me'
          });
          
          if (submissionResponse.data.studentSubmissions) {
            submissions.push(...submissionResponse.data.studentSubmissions);
          }
        } catch (submissionError) {
          console.warn(`No se pudieron obtener entregas para tarea ${work.id}:`, submissionError.message);
        }
      }
    }

    res.json({
      courseId,
      coursework,
      submissions: user.role === 'student' ? submissions : undefined,
      total: coursework.length
    });

  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las tareas del curso'
    });
  }
});

// @route   GET /api/classroom/courses/:courseId/announcements
// @desc    Obtener anuncios de un curso específico
// @access  Private
router.get('/courses/:courseId/announcements', auth, checkGoogleToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.userDoc;

    const authClient = setCredentials(user.googleTokens);
    const classroom = google.classroom({ version: 'v1', auth: authClient });

    // Obtener anuncios del curso
    const announcementsResponse = await classroom.courses.announcements.list({
      courseId: courseId,
      announcementStates: ['PUBLISHED']
    });

    const announcements = announcementsResponse.data.announcements || [];

    res.json({
      courseId,
      announcements,
      total: announcements.length
    });

  } catch (error) {
    console.error('Error obteniendo anuncios:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener los anuncios del curso'
    });
  }
});

module.exports = router;
