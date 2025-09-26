import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assignment,
  Schedule,
  CheckCircle,
  Warning,
  OpenInNew,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TaskCard = ({ task, onViewDetails }) => {
  const getDueDateColor = (dueDate) => {
    if (!dueDate) return 'default';
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'error';
    if (diffDays <= 1) return 'warning';
    if (diffDays <= 3) return 'info';
    return 'success';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'TURNED_IN':
        return <CheckCircle color="success" />;
      case 'LATE':
        return <Warning color="error" />;
      default:
        return <Schedule color="action" />;
    }
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Assignment />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {task.courseName}
            </Typography>
            {task.description && (
              <Typography variant="body2" sx={{ mb: 2 }}>
                {task.description.substring(0, 150)}
                {task.description.length > 150 && '...'}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {getStatusIcon(task.status)}
            <Tooltip title="Ver en Google Classroom">
              <IconButton 
                size="small" 
                onClick={() => window.open(task.alternateLink, '_blank')}
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={task.status === 'TURNED_IN' ? 'Entregado' : 'Pendiente'}
              color={task.status === 'TURNED_IN' ? 'success' : 'default'}
              size="small"
            />
            {task.dueDate && (
              <Chip 
                label={`Vence: ${new Date(task.dueDate).toLocaleDateString()}`}
                color={getDueDateColor(task.dueDate)}
                size="small"
              />
            )}
            {task.points && (
              <Chip 
                label={`${task.points} pts`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => onViewDetails(task)}
          >
            Ver Detalles
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

const Tasks = () => {
  const { user, isStudent } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    overdue: 0
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Primero obtener cursos
      const coursesResponse = await axios.get('/api/classroom/courses');
      const courses = coursesResponse.data.courses || [];
      
      if (courses.length === 0) {
        setTasks([]);
        setError('No tienes cursos disponibles. Conecta con Google Classroom para ver tus tareas.');
        return;
      }

      // Obtener tareas de todos los cursos
      const allTasks = [];
      for (const course of courses) {
        try {
          const tasksResponse = await axios.get(`/api/classroom/courses/${course.googleClassroomId}/coursework`);
          const courseTasks = tasksResponse.data.coursework || [];
          
          courseTasks.forEach(task => {
            allTasks.push({
              ...task,
              courseName: course.name,
              courseId: course.googleClassroomId
            });
          });
        } catch (courseError) {
          console.warn(`Error cargando tareas del curso ${course.name}:`, courseError);
        }
      }

      setTasks(allTasks);
      calculateStats(allTasks);
      
    } catch (err) {
      console.error('Error cargando tareas:', err);
      if (err.response?.status === 401) {
        setError('Tu sesión con Google ha expirado. Por favor, reautentícate.');
      } else {
        setError('No se pudieron cargar las tareas. Verifica tu conexión con Google Classroom.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tasksList) => {
    const now = new Date();
    const stats = {
      total: tasksList.length,
      pending: 0,
      completed: 0,
      overdue: 0
    };

    tasksList.forEach(task => {
      if (task.state === 'TURNED_IN') {
        stats.completed++;
      } else {
        stats.pending++;
        if (task.dueDate && new Date(task.dueDate) < now) {
          stats.overdue++;
        }
      }
    });

    setStats(stats);
  };

  const handleViewDetails = (task) => {
    // Abrir en Google Classroom
    window.open(task.alternateLink, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Tareas</Typography>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando tareas...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Mis Tareas
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTasks}
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          {isStudent 
            ? 'Gestiona tus tareas y entregas de Google Classroom'
            : 'Revisa las tareas asignadas a tus estudiantes'
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={loadTasks} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 600 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Tareas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 600 }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 600 }}>
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" sx={{ fontWeight: 600 }}>
                {stats.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vencidas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tasks List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Lista de Tareas
          </Typography>
          
          {tasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay tareas disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {error ? 'Revisa tu conexión con Google Classroom' : 'Todas las tareas están al día'}
              </Typography>
            </Box>
          ) : (
            <Box>
              {tasks.map((task, index) => (
                <TaskCard 
                  key={`${task.courseId}-${task.id}-${index}`}
                  task={task}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Tasks;
