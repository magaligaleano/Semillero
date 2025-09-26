import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  School,
  People,
  Assignment,
  MoreVert,
  OpenInNew,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CourseCard = ({ course, onViewDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenClassroom = () => {
    window.open(course.alternateLink, '_blank');
    handleMenuClose();
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <School />
          </Avatar>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {course.name}
        </Typography>

        {course.section && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Sección: {course.section}
          </Typography>
        )}

        {course.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {course.description.length > 100 
              ? `${course.description.substring(0, 100)}...` 
              : course.description}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={course.courseState} 
            color={course.courseState === 'ACTIVE' ? 'success' : 'default'}
            size="small"
          />
          {course.semilleroMetadata?.cohort && (
            <Chip 
              label={`Cohorte ${course.semilleroMetadata.cohort}`}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People fontSize="small" color="action" />
              <Typography variant="caption">
                {course.stats?.totalStudents || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Assignment fontSize="small" color="action" />
              <Typography variant="caption">
                {course.stats?.totalAssignments || 0}
              </Typography>
            </Box>
          </Box>
          
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => onViewDetails(course)}
          >
            Ver Detalles
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenClassroom}>
          <OpenInNew fontSize="small" sx={{ mr: 1 }} />
          Abrir en Classroom
        </MenuItem>
        <MenuItem onClick={() => onViewDetails(course)}>
          Ver Detalles
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Courses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/classroom/courses');
      setCourses(response.data.courses || []);
    } catch (err) {
      console.error('Error cargando cursos:', err);
      setError(err.response?.data?.message || 'Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (course) => {
    // Por ahora solo mostramos un alert, en el futuro se podría abrir un modal o navegar a una página de detalles
    alert(`Detalles del curso: ${course.name}\nID: ${course.googleClassroomId}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando cursos...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Mis Cursos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Cursos sincronizados desde Google Classroom
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadCourses}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          {error.includes('Token') && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Tu sesión con Google ha expirado. Por favor, cierra sesión e inicia sesión nuevamente.
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {/* Courses Grid */}
      {courses.length > 0 ? (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.googleClassroomId}>
              <CourseCard 
                course={course} 
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No hay cursos disponibles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {error 
                ? 'No se pudieron cargar los cursos. Verifica tu conexión e intenta nuevamente.'
                : 'Aún no tienes cursos asignados en Google Classroom.'
              }
            </Typography>
            <Button variant="outlined" onClick={loadCourses}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {courses.length > 0 && (
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total: {courses.length} curso{courses.length !== 1 ? 's' : ''} • 
            Última sincronización: {new Date().toLocaleString('es-AR')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Courses;
