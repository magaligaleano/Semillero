const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  googleClassroomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  room: {
    type: String,
    trim: true
  },
  ownerId: {
    type: String,
    required: true
  },
  creationTime: {
    type: Date,
    required: true
  },
  updateTime: {
    type: Date,
    required: true
  },
  enrollmentCode: {
    type: String,
    trim: true
  },
  courseState: {
    type: String,
    enum: ['ACTIVE', 'ARCHIVED', 'PROVISIONED', 'DECLINED', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  alternateLink: {
    type: String,
    trim: true
  },
  teacherFolder: {
    id: String,
    title: String,
    alternateLink: String
  },
  calendarId: {
    type: String,
    trim: true
  },
  // Metadatos específicos de Semillero
  semilleroMetadata: {
    cohort: {
      type: String,
      trim: true
    },
    program: {
      type: String,
      trim: true
    },
    startDate: Date,
    endDate: Date,
    isMainCourse: {
      type: Boolean,
      default: false
    },
    tags: [String]
  },
  // Estadísticas del curso
  stats: {
    totalStudents: { type: Number, default: 0 },
    totalTeachers: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 0 },
    totalAnnouncements: { type: Number, default: 0 },
    lastSyncDate: Date
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
courseSchema.index({ googleClassroomId: 1 });
courseSchema.index({ ownerId: 1 });
courseSchema.index({ courseState: 1 });
courseSchema.index({ 'semilleroMetadata.cohort': 1 });
courseSchema.index({ 'semilleroMetadata.program': 1 });

// Método para obtener información básica del curso
courseSchema.methods.getBasicInfo = function() {
  return {
    id: this._id,
    googleClassroomId: this.googleClassroomId,
    name: this.name,
    section: this.section,
    description: this.description,
    courseState: this.courseState,
    semilleroMetadata: this.semilleroMetadata,
    stats: this.stats
  };
};

module.exports = mongoose.model('Course', courseSchema);
