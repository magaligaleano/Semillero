import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  TextField,
  Grid,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  School,
  CalendarToday,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    preferences: {
      notifications: {
        email: user?.preferences?.notifications?.email ?? true,
        push: user?.preferences?.notifications?.push ?? true,
      },
      language: user?.preferences?.language || 'es',
      timezone: user?.preferences?.timezone || 'America/Argentina/Buenos_Aires',
    },
    metadata: {
      cohort: user?.metadata?.cohort || '',
      specialization: user?.metadata?.specialization || '',
      enrollmentDate: user?.metadata?.enrollmentDate || '',
      graduationDate: user?.metadata?.graduationDate || '',
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetear formulario
    setFormData({
      preferences: {
        notifications: {
          email: user?.preferences?.notifications?.email ?? true,
          push: user?.preferences?.notifications?.push ?? true,
        },
        language: user?.preferences?.language || 'es',
        timezone: user?.preferences?.timezone || 'America/Argentina/Buenos_Aires',
      },
      metadata: {
        cohort: user?.metadata?.cohort || '',
        specialization: user?.metadata?.specialization || '',
        enrollmentDate: user?.metadata?.enrollmentDate || '',
        graduationDate: user?.metadata?.graduationDate || '',
      },
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      await axios.put(`/api/students/${user.id}`, formData);
      
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value,
        },
      },
    }));
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      student: 'Estudiante',
      teacher: 'Profesor',
      coordinator: 'Coordinador',
      admin: 'Administrador'
    };
    return roleNames[role] || role;
  };

  return (
    <Box className="fade-in">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Mi Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona tu información personal y preferencias
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Info Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={user?.picture}
                alt={user?.name}
                sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              
              <Chip 
                label={getRoleDisplayName(user?.role)}
                color="primary"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Último acceso: {user?.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString('es-AR')
                      : 'Nunca'
                    }
                  </Typography>
                </Box>
                
                {user?.metadata?.cohort && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Cohorte {user.metadata.cohort}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Details Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Información Personal
                </Typography>
                
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={handleEdit}
                  >
                    Editar
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      Guardar
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                {/* Información Académica */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Información Académica
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Cohorte"
                    value={formData.metadata.cohort}
                    onChange={(e) => handleInputChange('metadata', 'cohort', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Especialización"
                    value={formData.metadata.specialization}
                    onChange={(e) => handleInputChange('metadata', 'specialization', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Inscripción"
                    type="date"
                    value={formData.metadata.enrollmentDate ? 
                      new Date(formData.metadata.enrollmentDate).toISOString().split('T')[0] : ''
                    }
                    onChange={(e) => handleInputChange('metadata', 'enrollmentDate', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fecha de Graduación"
                    type="date"
                    value={formData.metadata.graduationDate ? 
                      new Date(formData.metadata.graduationDate).toISOString().split('T')[0] : ''
                    }
                    onChange={(e) => handleInputChange('metadata', 'graduationDate', e.target.value)}
                    disabled={!isEditing}
                    variant={isEditing ? 'outlined' : 'filled'}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Preferencias */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Preferencias de Notificaciones
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.preferences.notifications.email}
                        onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'email', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Recibir notificaciones por email"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.preferences.notifications.push}
                        onChange={(e) => handleNestedInputChange('preferences', 'notifications', 'push', e.target.checked)}
                        disabled={!isEditing}
                      />
                    }
                    label="Recibir notificaciones push"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Perfil actualizado correctamente
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
