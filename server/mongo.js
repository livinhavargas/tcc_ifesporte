const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

const connectDB = async () => {
  try {
    console.log('Tentando conectar ao MongoDB em:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      readPreference: 'primary',
      directConnection: false, // OBRIGA a buscar o nó primário se estiver em cluster
    });

    console.log('✅ MongoDB conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar no MongoDB:', error.message);
    // Não vamos matar o processo aqui, para podermos ver os logs de requisição no terminal
  }
};

module.exports = connectDB;
