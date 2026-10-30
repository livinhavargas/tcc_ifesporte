// Exportando variáveis de ambiente
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config(); // Fallback para .env na raiz de execução

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'ifesporte_jwt_secret_dev_key_2026',
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI,
  PORT: process.env.PORT || 7777,
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'IFesporte <no-reply@ifesporte.edu.br>'
};
