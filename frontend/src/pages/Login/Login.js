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
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const Login = () => {
  const { login, getAuthUrl, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processedCode, setProcessedCode] = useState(null);

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
                Inicia sesión con tu cuenta de Google para acceder a la plataforma
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Google />}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                backgroundColor: '#4285f4',
                '&:hover': {
                  backgroundColor: '#3367d6',
                },
              }}
            >
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Utiliza la misma cuenta de Google que usas en Google Classroom
              </Typography>
            </Box>
          </CardContent>

          {/* Footer */}
          <Box
            sx={{
              backgroundColor: 'grey.50',
              p: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ¿Problemas para acceder? Contacta al equipo de Semillero Digital
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
