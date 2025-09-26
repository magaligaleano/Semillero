import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Container,
  Paper,
  TextField,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Collapse,
  Chip,
  Grid,
} from '@mui/material';
import { 
  Google, 
  Email, 
  Lock, 
  Person, 
  Visibility, 
  VisibilityOff 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Login = () => {
  const { login, loginWithCredentials, register, getAuthUrl, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processedCode, setProcessedCode] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const testUsers = [
    { email: 'admin@semillero.dev', password: 'admin123', role: 'admin', name: 'Administrador' },
    { email: 'coordinador@semillero.dev', password: 'coord123', role: 'coordinator', name: 'Coordinador' },
    { email: 'profesor@semillero.dev', password: 'prof123', role: 'teacher', name: 'Profesor' },
    { email: 'estudiante1@semillero.dev', password: 'est123', role: 'student', name: 'Estudiante 1' },
    { email: 'test@semillero.dev', password: 'test123', role: 'student', name: 'Usuario Test' },
  ];

  // Manejar callback de Google OAuth
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      let errorMessage = 'Error en la autorización con Google. Por favor, intenta de nuevo.';
      
      switch (error) {
        case 'auth_failed':
          errorMessage = 'Error al procesar la autenticación. Por favor, intenta de nuevo.';
          break;
        case 'no_code':
          errorMessage = 'No se recibió código de autorización. Por favor, intenta de nuevo.';
          break;
        case 'callback_error':
          errorMessage = 'Error en el callback de Google. Por favor, intenta de nuevo.';
          break;
      }
      
      setError(errorMessage);
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Si recibimos un token directamente del backend
    if (token) {
      handleTokenSuccess(token);
    }
  }, [searchParams]);

  const handleTokenSuccess = (token) => {
    // Guardar token y redirigir
    localStorage.setItem('token', token);
    // Limpiar URL
    window.history.replaceState({}, document.title, window.location.pathname);
    // Recargar para que AuthContext detecte el token
    window.location.reload();
  };

  const handleGoogleCallback = async (code) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(code);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
        // Limpiar URL después de error
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
      // Limpiar URL después de error
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTestUserLogin = (testUser) => {
    setFormData({
      ...formData,
      email: testUser.email,
      password: testUser.password
    });
    setTabValue(0); // Cambiar a la pestaña de login
  };

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      const result = await loginWithCredentials(formData.email, formData.password);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.email || !formData.password || !formData.name) {
      setError('Por favor, completa todos los campos');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const result = await register(formData.email, formData.password, formData.name);
      
      if (!result.success) {
        setError(result.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error inesperado. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Error al conectar con Google. Por favor, intenta de nuevo.');
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingSpinner message="Iniciando sesión..." />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              color: 'white',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Semillero Digital
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Plataforma Complementaria
            </Typography>
          </Box>

          {/* Content */}
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Bienvenido/a
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Accede a la plataforma con tu método preferido
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {isLoading && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {tabValue === 0 ? 'Iniciando sesión...' : 'Registrando usuario...'}
              </Alert>
            )}

            {/* Tabs para alternar entre Login y Registro */}
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Iniciar Sesión" />
              <Tab label="Registrarse" />
            </Tabs>

            {/* Formulario de Login */}
            {tabValue === 0 && (
              <Box component="form" onSubmit={handleCredentialsLogin}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Box>
            )}

            {/* Formulario de Registro */}
            {tabValue === 1 && (
              <Box component="form" onSubmit={handleRegister}>
                <TextField
                  fullWidth
                  name="name"
                  label="Nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  helperText="Mínimo 6 caracteres"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                  sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
              </Box>
            )}

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                O continúa con
              </Typography>
            </Divider>

            {/* Google Login Button */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                borderColor: '#4285f4',
                color: '#4285f4',
                '&:hover': {
                  borderColor: '#3367d6',
                  backgroundColor: 'rgba(66, 133, 244, 0.04)',
                },
              }}
            >
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0 
                  ? 'Utiliza la misma cuenta de Google que usas en Google Classroom'
                  : 'Al registrarte, aceptas nuestros términos y condiciones'
                }
              </Typography>
            </Box>
          </CardContent>

          {/* Footer */}
          <Box
            sx={{
              backgroundColor: 'grey.50',
              p: 2,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                ¿Problemas para acceder? Contacta al equipo de Semillero Digital
              </Typography>
              <Button
                size="small"
                onClick={() => setShowTestUsers(!showTestUsers)}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                {showTestUsers ? 'Ocultar' : 'Ver'} usuarios de prueba
              </Button>
            </Box>

            <Collapse in={showTestUsers}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                👥 Usuarios de Prueba Disponibles
              </Typography>
              <Grid container spacing={1}>
                {testUsers.map((user, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 1.5, 
                        cursor: 'pointer',
                        '&:hover': { 
                          backgroundColor: 'action.hover',
                          borderColor: 'primary.main'
                        }
                      }}
                      onClick={() => handleTestUserLogin(user)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {user.name}
                        </Typography>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={
                            user.role === 'admin' ? 'error' :
                            user.role === 'coordinator' ? 'warning' :
                            user.role === 'teacher' ? 'info' : 'default'
                          }
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        📧 {user.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        🔑 {user.password}
                      </Typography>
                      <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: 'block' }}>
                        👆 Haz clic para usar estas credenciales
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Collapse>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
