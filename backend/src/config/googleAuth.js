const { google } = require('googleapis');

// Configuración de OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Scopes necesarios para Google Classroom
const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

// Generar URL de autorización
const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });
};

// Obtener tokens de acceso
const getTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    // Manejar errores específicos de OAuth
    if (error.message.includes('invalid_grant')) {
      throw new Error('Código de autorización expirado o inválido. Por favor, intenta iniciar sesión nuevamente.');
    }
    throw new Error(`Error obteniendo tokens: ${error.message}`);
  }
};

// Configurar credenciales
const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
};

// Refrescar token de acceso
const refreshAccessToken = async (refreshToken) => {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    throw new Error(`Error refrescando token: ${error.message}`);
  }
};

// Obtener información del usuario
const getUserInfo = async (accessToken) => {
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const { data } = await oauth2.userinfo.get();
    return data;
  } catch (error) {
    throw new Error(`Error obteniendo información del usuario: ${error.message}`);
  }
};

module.exports = {
  oauth2Client,
  SCOPES,
  getAuthUrl,
  getTokens,
  setCredentials,
  refreshAccessToken,
  getUserInfo
};
