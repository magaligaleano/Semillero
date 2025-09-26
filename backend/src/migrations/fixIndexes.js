const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fixIndexes = async () => {
  try {
    console.log('🔧 Arreglando índices de MongoDB...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Obtener índices existentes
    const indexes = await collection.indexes();
    console.log('📋 Índices existentes:', indexes.map(i => i.name));

    // Eliminar índice problemático de googleId si existe
    try {
      await collection.dropIndex('googleId_1');
      console.log('🗑️  Índice googleId_1 eliminado');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Índice googleId_1 no existe, continuando...');
      } else {
        throw error;
      }
    }

    // Crear nuevo índice sparse para googleId
    await collection.createIndex({ googleId: 1 }, { sparse: true, unique: true });
    console.log('✅ Nuevo índice sparse para googleId creado');

    console.log('🎉 Índices arreglados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error arreglando índices:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  fixIndexes();
}

module.exports = { fixIndexes };
