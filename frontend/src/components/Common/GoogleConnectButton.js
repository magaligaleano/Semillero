import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const GoogleConnectButton = ({ title = "Conectar con Google Classroom", description = "Para acceder a todas las funcionalidades de Google Classroom, conecta tu cuenta de Google." }) => {
  const { getAuthUrl } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleConnect = async () => {
    try {
      setIsConnecting(true);
      setError('');
      
      const authUrl = await getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Error al conectar con Google. Por favor, intenta de nuevo.');
      setIsConnecting(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ mt: 2, mb: 2 }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Google sx={{ fontSize: 48, color: '#4285f4', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={<Google />}
          onClick={handleGoogleConnect}
          disabled={isConnecting}
          sx={{
            backgroundColor: '#4285f4',
            '&:hover': {
              backgroundColor: '#3367d6',
            },
          }}
        >
          {isConnecting ? 'Conectando...' : 'Conectar con Google'}
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Esto te redirigirá a Google para autorizar el acceso a Classroom
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GoogleConnectButton;
