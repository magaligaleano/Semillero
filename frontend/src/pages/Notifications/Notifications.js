import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Alert,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Announcement,
  Assignment,
  School,
  Schedule,
  CheckCircle,
  MarkEmailRead,
  MarkEmailUnread,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <Assignment color="primary" />;
      case 'announcement':
        return <Announcement color="info" />;
      case 'course':
        return <School color="secondary" />;
      case 'grade':
        return <CheckCircle color="success" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'assignment':
        return 'Tarea';
      case 'announcement':
        return 'Anuncio';
      case 'course':
        return 'Curso';
      case 'grade':
        return 'Calificación';
      default:
        return 'Notificación';
    }
  };

  return (
    <ListItem
      sx={{
        bgcolor: notification.read ? 'transparent' : 'action.hover',
        borderRadius: 1,
        mb: 1,
        '&:hover': { bgcolor: 'action.selected' }
      }}
      secondaryAction={
        <Box>
          <Tooltip title={notification.read ? 'Marcar como no leído' : 'Marcar como leído'}>
            <IconButton 
              size="small" 
              onClick={() => onMarkRead(notification.id, !notification.read)}
            >
              {notification.read ? <MarkEmailUnread /> : <MarkEmailRead />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton 
              size="small" 
              onClick={() => onDelete(notification.id)}
              color="error"
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.paper' }}>
          {getIcon(notification.type)}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: notification.read ? 400 : 600,
                flexGrow: 1 
              }}
            >
              {notification.title}
            </Typography>
            <Chip 
              label={getTypeLabel(notification.type)}
              size="small"
              variant="outlined"
            />
            {!notification.read && (
              <Badge color="primary" variant="dot" />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              {notification.message}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {notification.courseName && `${notification.courseName} • `}
                {new Date(notification.createdAt).toLocaleString()}
              </Typography>
              {notification.actionUrl && (
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => window.open(notification.actionUrl, '_blank')}
                >
                  Ver
                </Button>
              )}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    assignments: 0,
    announcements: 0
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Por ahora, vamos a simular notificaciones basadas en cursos y anuncios
      const coursesResponse = await axios.get('/api/classroom/courses');
      const courses = coursesResponse.data.courses || [];
      
      const mockNotifications = [];
      
      // Generar notificaciones de ejemplo
      courses.forEach((course, index) => {
        // Notificación de bienvenida al curso
        mockNotifications.push({
          id: `course-${course.googleClassroomId}`,
          type: 'course',
          title: `Bienvenido/a a ${course.name}`,
          message: 'Te has unido exitosamente a este curso. Revisa el material disponible.',
          courseName: course.name,
          read: index % 3 === 0, // Algunos leídos, otros no
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          actionUrl: `https://classroom.google.com/c/${course.googleClassroomId}`
        });
      });

      // Agregar notificaciones del sistema
      mockNotifications.push(
        {
          id: 'system-1',
          type: 'announcement',
          title: 'Bienvenido/a a Semillero Digital',
          message: 'Tu cuenta ha sido configurada exitosamente. Explora todas las funcionalidades disponibles.',
          read: false,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Hace 1 hora
        },
        {
          id: 'system-2',
          type: 'assignment',
          title: 'Conecta con Google Classroom',
          message: 'Para ver tus tareas y cursos, asegúrate de que tu cuenta esté conectada correctamente.',
          read: false,
          createdAt: new Date(Date.now() - 30 * 60 * 1000), // Hace 30 minutos
        }
      );

      // Ordenar por fecha (más recientes primero)
      mockNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setNotifications(mockNotifications);
      calculateStats(mockNotifications);
      
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
      setError('No se pudieron cargar las notificaciones.');
      
      // Fallback: mostrar notificaciones básicas del sistema
      const fallbackNotifications = [
        {
          id: 'fallback-1',
          type: 'announcement',
          title: 'Bienvenido/a a Semillero Digital',
          message: 'Tu cuenta ha sido configurada exitosamente.',
          read: false,
          createdAt: new Date(),
        }
      ];
      setNotifications(fallbackNotifications);
      calculateStats(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (notificationsList) => {
    const stats = {
      total: notificationsList.length,
      unread: notificationsList.filter(n => !n.read).length,
      assignments: notificationsList.filter(n => n.type === 'assignment').length,
      announcements: notificationsList.filter(n => n.type === 'announcement').length
    };
    setStats(stats);
  };

  const handleMarkRead = async (notificationId, read) => {
    try {
      // Actualizar localmente (en una implementación real, esto sería una API call)
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, read }
          : notification
      );
      setNotifications(updatedNotifications);
      calculateStats(updatedNotifications);
    } catch (error) {
      console.error('Error actualizando notificación:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      // Eliminar localmente (en una implementación real, esto sería una API call)
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      calculateStats(updatedNotifications);
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const handleMarkAllRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    calculateStats(updatedNotifications);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 1: // No leídas
        return notifications.filter(n => !n.read);
      case 2: // Tareas
        return notifications.filter(n => n.type === 'assignment');
      case 3: // Anuncios
        return notifications.filter(n => n.type === 'announcement');
      default: // Todas
        return notifications;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Notificaciones</Typography>
        <Typography>Cargando notificaciones...</Typography>
      </Box>
    );
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Notificaciones
            {stats.unread > 0 && (
              <Badge badgeContent={stats.unread} color="primary" sx={{ ml: 2 }} />
            )}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {stats.unread > 0 && (
              <Button
                variant="outlined"
                onClick={handleMarkAllRead}
              >
                Marcar todas como leídas
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadNotifications}
              disabled={loading}
            >
              Actualizar
            </Button>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          Mantente al día con las últimas actualizaciones de tus cursos
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} Mostrando notificaciones básicas del sistema.
        </Alert>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={`Todas (${stats.total})`}
            icon={<NotificationsIcon />}
          />
          <Tab 
            label={`No leídas (${stats.unread})`}
            icon={<Badge badgeContent={stats.unread} color="primary"><MarkEmailUnread /></Badge>}
          />
          <Tab 
            label={`Tareas (${stats.assignments})`}
            icon={<Assignment />}
          />
          <Tab 
            label={`Anuncios (${stats.announcements})`}
            icon={<Announcement />}
          />
        </Tabs>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay notificaciones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeTab === 1 ? 'Todas las notificaciones están leídas' : 'No hay notificaciones en esta categoría'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredNotifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                  {index < filteredNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Notifications;
