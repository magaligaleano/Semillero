// Script de inicialización para MongoDB
// Este script se ejecuta cuando se crea el contenedor por primera vez

// Crear la base de datos y usuario para desarrollo
db = db.getSiblingDB('semillero-digital');

// Crear usuario para la aplicación
db.createUser({
  user: 'semillero-user',
  pwd: 'semillero-dev-password',
  roles: [
    {
      role: 'readWrite',
      db: 'semillero-digital'
    }
  ]
});

// Crear colecciones básicas con algunos datos de ejemplo
db.createCollection('users');
db.createCollection('courses');
db.createCollection('notifications');

// Insertar un usuario administrador de ejemplo
db.users.insertOne({
  googleId: 'admin-example',
  email: 'admin@semillero.dev',
  name: 'Administrador Semillero',
  role: 'coordinator',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('✅ Base de datos inicializada correctamente');
print('📊 Usuario administrador creado: admin@semillero.dev');
print('🔑 Usuario de aplicación: semillero-user');
