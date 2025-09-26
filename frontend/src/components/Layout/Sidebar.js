import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard,
  School,
  People,
  PersonAdd,
  BarChart,
  Assignment,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isStudent, isTeacher, isCoordinator, isAdmin } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['student', 'teacher', 'coordinator', 'admin'],
    },
    {
      text: 'Cursos',
      icon: <School />,
      path: '/courses',
      roles: ['student', 'teacher', 'coordinator', 'admin'],
    },
    {
      text: 'Estudiantes',
      icon: <People />,
      path: '/students',
      roles: ['teacher', 'coordinator', 'admin'],
    },
    {
      text: 'Profesores',
      icon: <PersonAdd />,
      path: '/teachers',
      roles: ['coordinator', 'admin'],
    },
    {
      text: 'Reportes',
      icon: <BarChart />,
      path: '/reports',
      roles: ['coordinator', 'admin'],
    },
    {
      text: 'Tareas',
      icon: <Assignment />,
      path: '/tasks',
      roles: ['student', 'teacher', 'coordinator', 'admin'],
    },
    {
      text: 'Notificaciones',
      icon: <Notifications />,
      path: '/notifications',
      roles: ['student', 'teacher', 'coordinator', 'admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      
      {/* User Info Section */}
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="subtitle2" noWrap>
          Bienvenido/a
        </Typography>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
          {user?.name?.split(' ')[0]}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {user?.metadata?.cohort && `Cohorte ${user.metadata.cohort}`}
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Semillero Digital v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      ) : (
        <Drawer
          variant="persistent"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
