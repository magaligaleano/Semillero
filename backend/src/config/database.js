const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configuración de conexión más robusta
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout después de 5s en lugar de 30s por defecto
      socketTimeoutMS: 45000, // Cerrar sockets después de 45s de inactividad
      maxPoolSize: 10, // Mantener hasta 10 conexiones de socket
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`📊 MongoDB conectado: ${conn.connection.host}`);
    console.log(`🏷️  Base de datos: ${conn.connection.name}`);
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconectado');
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Parece que MongoDB no está ejecutándose.');
      console.log('🐳 Para usar Docker: npm run docker:up');
      console.log('🌐 Para usar Atlas: verifica tu conexión y configuración');
    }
    
    console.log('⚠️  Servidor continuará sin conexión a la base de datos');
    
    // En desarrollo, no cerramos el servidor para permitir desarrollo sin DB
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
