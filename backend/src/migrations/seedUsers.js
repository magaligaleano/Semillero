const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const seedUsers = [
  {
    email: 'admin@semillero.dev',
    password: 'admin123',
    name: 'Administrador Semillero',
    role: 'admin',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Admin',
      enrollmentDate: new Date('2024-01-01'),
      specialization: 'Administración'
    }
  },
  {
    email: 'coordinador@semillero.dev',
    password: 'coord123',
    name: 'María Coordinadora',
    role: 'coordinator',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Staff-2024',
      enrollmentDate: new Date('2024-01-15'),
      specialization: 'Coordinación Académica'
    }
  },
  {
    email: 'profesor@semillero.dev',
    password: 'prof123',
    name: 'Carlos Profesor',
    role: 'teacher',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Docentes-2024',
      enrollmentDate: new Date('2024-02-01'),
      specialization: 'Desarrollo Web'
    }
  },
  {
    email: 'estudiante1@semillero.dev',
    password: 'est123',
    name: 'Ana Estudiante',
    role: 'student',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Cohorte-2024-A',
      enrollmentDate: new Date('2024-03-01'),
      specialization: 'Frontend Development'
    }
  },
  {
    email: 'estudiante2@semillero.dev',
    password: 'est123',
    name: 'Luis Estudiante',
    role: 'student',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Cohorte-2024-A',
      enrollmentDate: new Date('2024-03-01'),
      specialization: 'Backend Development'
    }
  },
  {
    email: 'test@semillero.dev',
    password: 'test123',
    name: 'Usuario Test',
    role: 'student',
    authMethod: 'local',
    isActive: true,
    metadata: {
      cohort: 'Test-2024',
      enrollmentDate: new Date(),
      specialization: 'Testing'
    }
  }
];

const runSeed = async () => {
  try {
    console.log('🌱 Iniciando migración de usuarios...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Conectado a MongoDB');

    // Limpiar usuarios existentes (opcional - comentar si no quieres borrar)
    // await User.deleteMany({ authMethod: 'local' });
    // console.log('🧹 Usuarios locales existentes eliminados');

    // Crear usuarios de prueba
    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  Usuario ${userData.email} ya existe, saltando...`);
        continue;
      }

      const user = new User(userData);
      await user.save();
      console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
    }

    console.log('\n🎉 Migración completada exitosamente!');
    console.log('\n📋 Usuarios de prueba creados:');
    console.log('┌─────────────────────────────┬──────────────┬─────────────┐');
    console.log('│ Email                       │ Password     │ Rol         │');
    console.log('├─────────────────────────────┼──────────────┼─────────────┤');
    seedUsers.forEach(user => {
      console.log(`│ ${user.email.padEnd(27)} │ ${user.password.padEnd(12)} │ ${user.role.padEnd(11)} │`);
    });
    console.log('└─────────────────────────────┴──────────────┴─────────────┘');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeed();
}

module.exports = { seedUsers, runSeed };
