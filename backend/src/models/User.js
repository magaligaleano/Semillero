const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Permite que sea null para usuarios sin Google OAuth
  },
  password: {
    type: String,
    minlength: 6
  },
  authMethod: {
    type: String,
    enum: ['google', 'local', 'both'],
    default: 'local'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  picture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'coordinator', 'admin'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Date
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    language: { type: String, default: 'es' },
    timezone: { type: String, default: 'America/Argentina/Buenos_Aires' }
  },
  metadata: {
    cohort: String,
    enrollmentDate: Date,
    graduationDate: Date,
    specialization: String
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 }, { sparse: true }); // sparse permite valores null
userSchema.index({ role: 1 });
userSchema.index({ 'metadata.cohort': 1 });

// Método para verificar si el token de Google ha expirado
userSchema.methods.isTokenExpired = function() {
  if (!this.googleTokens.expiryDate) return true;
  return new Date() >= this.googleTokens.expiryDate;
};

// Método para hashear password
userSchema.methods.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
};

// Método para verificar password
userSchema.methods.comparePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Método para obtener información pública del usuario
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    picture: this.picture,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    authMethod: this.authMethod,
    metadata: this.metadata
  };
};

// Middleware pre-save para hashear password y actualizar lastLogin
userSchema.pre('save', async function(next) {
  // Hashear password si fue modificado
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Actualizar lastLogin si se modificaron los tokens de Google
  if (this.isModified('googleTokens.accessToken')) {
    this.lastLogin = new Date();
  }
  
  next();
});

module.exports = mongoose.model('User', userSchema);
