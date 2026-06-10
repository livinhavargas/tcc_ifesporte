// backend/server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./mongo');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sportRoutes = require('./routes/sportRoutes');
const eventRoutes = require('./routes/eventRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const { PORT } = require('./config');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sports', sportRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/schedules', scheduleRoutes);

app.listen(PORT, () => console.log(`Servidor rodando na porta http://localhost:${PORT}`));
