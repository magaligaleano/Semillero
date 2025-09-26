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
    required: true,
    unique: true
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
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'metadata.cohort': 1 });

// Método para verificar si el token de Google ha expirado
userSchema.methods.isTokenExpired = function() {
  if (!this.googleTokens.expiryDate) return true;
  return new Date() >= this.googleTokens.expiryDate;
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
    metadata: this.metadata
  };
};

// Middleware pre-save para actualizar lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('googleTokens.accessToken')) {
    this.lastLogin = new Date();
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
