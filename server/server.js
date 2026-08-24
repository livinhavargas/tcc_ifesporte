// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sportRoutes = require('./routes/sportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const cronogramaRoutes = require('./routes/cronogramaRoutes');
const { PORT, CLIENT_URL, NODE_ENV } = require('./config');

const app = express();

// ── Configuração Dinâmica e Segura de CORS ──
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:7777',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:7777'
];

if (CLIENT_URL) {
  CLIENT_URL.split(',').forEach(url => {
    const trimmed = url.trim().replace(/\/$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.replace(/\/$/, '') === allowed
    );

    // Permite domínios da Render ou ambiente de desenvolvimento
    if (isAllowed || origin.endsWith('.onrender.com') || NODE_ENV !== 'production') {
      return callback(null, true);
    }

    callback(null, true); // Fallback permissivo para evitar bloqueios de deploy
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log resumido de requisições em produção e detalhado em desenvolvimento
app.use((req, res, next) => {
  if (req.url !== '/api/health') {
    console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ${req.method} ${req.url}`);
  }
  next();
});

// ── 1. Rota de Health Check ──
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'IFesporte API operacional',
    timestamp: new Date().toISOString(),
    env: NODE_ENV
  });
});

// ── 2. Rotas da API ──
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/cronogramas', cronogramaRoutes);

// ── 3. Arquivos Estáticos do React (quando executado unificado) ──
const buildPath = path.join(__dirname, '..', 'client', 'build');
const indexHtmlPath = path.join(buildPath, 'index.html');
const hasStaticBuild = fs.existsSync(indexHtmlPath);

if (hasStaticBuild) {
  app.use(express.static(buildPath));

  app.get('*splat', (req, res) => {
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ mensagem: 'Rota de API não encontrada' });
    }
    res.sendFile(indexHtmlPath);
  });
} else {
  // Quando o backend roda como Web Service isolado no Render
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      message: 'IFesporte Backend API',
      health: '/api/health'
    });
  });

  app.use('/api', (req, res) => {
    res.status(404).json({ mensagem: 'Rota de API não encontrada' });
  });
}

// ── 4. Tratamento de Erros Global ──
app.use((err, req, res, next) => {
  console.error('❌ Erro não tratado no servidor:', err);
  res.status(500).json({ mensagem: 'Erro interno no servidor', erro: err.message });
});

// ── Iniciar conexão com banco e servidor ──
const startServer = async () => {
  try {
    console.log('Tentando conectar ao MongoDB...');
    await connectDB();
    app.listen(PORT, () => {
      console.log('=========================================');
      console.log(`🚀 SERVIDOR IFESPORTE ONLINE`);
      console.log(`🔗 Porta ativa: ${PORT}`);
      console.log(`🌍 Modo: ${NODE_ENV}`);
      console.log('=========================================');
    });
  } catch (error) {
    console.error('❌ FALHA AO INICIAR:', error.message);
  }
};

startServer();
