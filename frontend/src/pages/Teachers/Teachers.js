import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Alert,
  Grid,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Email,
  Person,
  MoreVert,
  School,
  SupervisorAccount,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const TeacherCard = ({ teacher, onSendEmail, onViewProfile }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'coordinator':
        return <SupervisorAccount />;
      case 'teacher':
        return <School />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'coordinator':
        return 'primary';
      case 'teacher':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'coordinator':
        return 'Coordinador';
      case 'teacher':
        return 'Profesor';
      default:
        return 'Usuario';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={teacher.picture} 
            alt={teacher.name}
            sx={{ width: 56, height: 56 }}
          >
            {teacher.name?.charAt(0).toUpperCase()}
          </Avatar>
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
          {teacher.name}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {teacher.email}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={getRoleIcon(teacher.role)}
            label={getRoleLabel(teacher.role)}
            color={getRoleColor(teacher.role)}
            size="small"
          />
          <Chip 
            label={teacher.isActive ? 'Activo' : 'Inactivo'}
            color={teacher.isActive ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Box>

        {teacher.metadata?.cohort && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Cohorte: {teacher.metadata.cohort}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary">
          Último acceso: {teacher.lastLogin 
            ? new Date(teacher.lastLogin).toLocaleDateString('es-AR')
            : 'Nunca'
          }
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<Email />}
            onClick={() => onSendEmail(teacher)}
            fullWidth
          >
            Contactar
          </Button>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { onViewProfile(teacher); handleMenuClose(); }}>
          <Person fontSize="small" sx={{ mr: 1 }} />
          Ver Perfil
        </MenuItem>
        <MenuItem onClick={() => { onSendEmail(teacher); handleMenuClose(); }}>
          <Email fontSize="small" sx={{ mr: 1 }} />
          Enviar Email
        </MenuItem>
      </Menu>
    </Card>
  );
};

const Teachers = () => {
  const { user, isStudent, isTeacher } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verificar permisos - solo coordinadores pueden ver esta página
  if (isStudent || isTeacher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No tienes permisos para ver esta página. Solo coordinadores pueden acceder a la lista de profesores.
        </Alert>
      </Box>
    );
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/api/teachers');
      setTeachers(response.data.teachers || []);
    } catch (err) {
      console.error('Error cargando profesores:', err);
      setError(err.response?.data?.message || 'Error al cargar los profesores');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (teacher) => {
    window.open(`mailto:${teacher.email}`, '_blank');
  };

  const handleViewProfile = (teacher) => {
    // En una implementación completa, esto navegaría al perfil del profesor
    alert(`Ver perfil de ${teacher.name}`);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando profesores...</Typography>
      </Box>
    );
  }

  const coordinators = teachers.filter(t => t.role === 'coordinator');
  const regularTeachers = teachers.filter(t => t.role === 'teacher');

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Equipo Docente
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coordinadores y profesores de Semillero Digital
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Coordinators Section */}
      {coordinators.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Coordinadores
          </Typography>
          <Grid container spacing={3}>
            {coordinators.map((coordinator) => (
              <Grid item xs={12} sm={6} md={4} key={coordinator.id}>
                <TeacherCard 
                  teacher={coordinator}
                  onSendEmail={handleSendEmail}
                  onViewProfile={handleViewProfile}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Teachers Section */}
      {regularTeachers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Profesores
          </Typography>
          <Grid container spacing={3}>
            {regularTeachers.map((teacher) => (
              <Grid item xs={12} sm={6} md={4} key={teacher.id}>
                <TeacherCard 
                  teacher={teacher}
                  onSendEmail={handleSendEmail}
                  onViewProfile={handleViewProfile}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty State */}
      {teachers.length === 0 && !loading && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No hay profesores registrados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Aún no hay profesores o coordinadores registrados en el sistema.
            </Typography>
            <Button variant="outlined" onClick={loadTeachers}>
              Actualizar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {teachers.length > 0 && (
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total: {coordinators.length} coordinador{coordinators.length !== 1 ? 'es' : ''} • {' '}
            {regularTeachers.length} profesor{regularTeachers.length !== 1 ? 'es' : ''}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Teachers;
