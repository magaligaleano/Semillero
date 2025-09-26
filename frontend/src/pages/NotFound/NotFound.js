import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
} from '@mui/material';
import {
  Home,
  ArrowBack,
  SearchOff,
} from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

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
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              color: 'white',
              p: 4,
            }}
          >
            <SearchOff sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              404
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Página no encontrada
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              ¡Oops! Parece que te perdiste
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              La página que estás buscando no existe o ha sido movida. 
              Verifica la URL o regresa al inicio.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<Home />}
                onClick={handleGoHome}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Ir al Inicio
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={handleGoBack}
                sx={{
                  py: 1.5,
                  px: 3,
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Volver Atrás
              </Button>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              backgroundColor: 'grey.50',
              p: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Si crees que esto es un error, contacta al equipo de soporte
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;
