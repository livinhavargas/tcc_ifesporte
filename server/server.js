// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sportRoutes = require('./routes/sportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const cronogramaRoutes = require('./routes/cronogramaRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const { PORT } = require('./config');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log ultra-detalhado de requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('Dados recebidos:', req.body);
  }
  next();
});

// 1. ROTAS DA API (Sempre primeiro)
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/cronogramas', cronogramaRoutes);
app.use('/api/schedules', scheduleRoutes);

// 2. ARQUIVOS ESTÁTICOS DO REACT
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// 3. Rota catch-all para o React Router (Express 5 exige um nome após o asterisco)
app.get('*splat', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ mensagem: 'Rota de API não encontrada' });
  }
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      if (!res.headersSent) {
        res.status(500).send(err);
      }
    }
  });
});

// 4. TRATAMENTO DE ERROS GLOBAL
app.use((err, req, res, next) => {
  console.error('!!! ERRO NÃO TRATADO NO SERVIDOR !!!');
  console.error(err.stack);
  res.status(500).json({ mensagem: 'Erro interno no servidor', erro: err.message });
});

// Iniciar conexão com banco e depois o servidor
const startServer = async () => {
  try {
    console.log('Tentando conectar ao MongoDB...');
    await connectDB();
    app.listen(PORT, () => {
      console.log('=========================================');
      console.log(`🚀 SERVIDOR UNIFICADO ONLINE`);
      console.log(`🔗 Endereço: http://localhost:${PORT}`);
      console.log('=========================================');
    });
  } catch (error) {
    console.error('❌ FALHA AO INICIAR:', error.message);
  }
};

startServer();
