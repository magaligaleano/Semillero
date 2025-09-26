import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  School,
  Assignment,
  TrendingUp,
  People,
  Notifications,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, mr: 2 }}>
          {icon}
        </Avatar>
        <Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, isStudent, isTeacher, isCoordinator } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos según el rol del usuario
      let response;
      if (isCoordinator) {
        response = await axios.get('/api/coordinators/dashboard');
      } else {
        // Para estudiantes y profesores, cargar cursos
        response = await axios.get('/api/classroom/courses');
      }
      
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    let greeting = 'Hola';
    
    if (hour < 12) greeting = 'Buenos días';
    else if (hour < 18) greeting = 'Buenas tardes';
    else greeting = 'Buenas noches';
    
    return `${greeting}, ${user?.name?.split(' ')[0]}!`;
  };

  const getRoleSpecificStats = () => {
    if (isCoordinator && dashboardData?.metrics) {
      return [
        {
          title: 'Total Estudiantes',
          value: dashboardData.metrics.totalStudents,
          icon: <People />,
          color: 'primary',
        },
        {
          title: 'Total Profesores',
          value: dashboardData.metrics.totalTeachers,
          icon: <School />,
          color: 'secondary',
        },
        {
          title: 'Cursos Activos',
          value: dashboardData.metrics.totalCourses,
          icon: <Assignment />,
          color: 'success',
        },
        {
          title: 'Actividad Semanal',
          value: dashboardData.metrics.activeUsersLastWeek,
          icon: <TrendingUp />,
          color: 'info',
          subtitle: 'usuarios activos',
        },
      ];
    } else if (dashboardData?.courses) {
      return [
        {
          title: 'Mis Cursos',
          value: dashboardData.courses.length,
          icon: <School />,
          color: 'primary',
        },
        {
          title: 'Tareas Pendientes',
          value: 0, // Por implementar
          icon: <Assignment />,
          color: 'warning',
        },
        {
          title: 'Progreso General',
          value: '85%', // Por implementar
          icon: <TrendingUp />,
          color: 'success',
        },
        {
          title: 'Notificaciones',
          value: 0,
          icon: <Notifications />,
          color: 'info',
        },
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          {getWelcomeMessage()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Chip 
            label={user?.role === 'student' ? 'Estudiante' : 
                  user?.role === 'teacher' ? 'Profesor' : 
                  user?.role === 'coordinator' ? 'Coordinador' : 'Usuario'}
            color="primary" 
            variant="outlined" 
          />
          {user?.metadata?.cohort && (
            <Chip 
              label={`Cohorte ${user.metadata.cohort}`}
              color="secondary" 
              variant="outlined" 
            />
          )}
          <Chip 
            icon={<CalendarToday />}
            label={new Date().toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
            variant="outlined" 
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button onClick={loadDashboardData} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {getRoleSpecificStats().map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity / Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actividad Reciente
              </Typography>
              
              {isCoordinator && dashboardData?.recentActivity ? (
                <Box>
                  {dashboardData.recentActivity.slice(0, 5).map((activity, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        py: 1,
                        borderBottom: index < 4 ? 1 : 0,
                        borderColor: 'divider'
                      }}
                    >
                      <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                        {activity.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2">
                          {activity.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Último acceso: {new Date(activity.lastLogin).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={activity.role} 
                        size="small" 
                        variant="outlined"
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay actividad reciente para mostrar
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Acciones Rápidas
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<School />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Ver Cursos
                </Button>
                
                {!isStudent && (
                  <Button 
                    variant="outlined" 
                    startIcon={<People />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Gestionar Estudiantes
                  </Button>
                )}
                
                {isCoordinator && (
                  <Button 
                    variant="outlined" 
                    startIcon={<TrendingUp />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Ver Reportes
                  </Button>
                )}
                
                <Button 
                  variant="outlined" 
                  startIcon={<Notifications />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Notificaciones
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
