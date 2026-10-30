const {
  CLIENT_URL,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM
} = require('../config');

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  console.warn('[EmailService] Pacote nodemailer não encontrado. Usando modo de simulação.');
}

const getBaseClientUrl = () => {
  if (CLIENT_URL) {
    const firstUrl = CLIENT_URL.split(',')[0].trim().replace(/\/$/, '');
    if (firstUrl) return firstUrl;
  }
  return 'http://localhost:3000';
};

const isSmtpConfigured = () => {
  return Boolean(nodemailer && SMTP_HOST && SMTP_USER && SMTP_PASS);
};

const createTransporter = () => {
  if (!isSmtpConfigured()) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Boolean(SMTP_SECURE) || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

/**
 * Envia e-mail de confirmação de cadastro e verificação de endereço de e-mail,
 * com resumo de transparência em conformidade com a LGPD (Lei nº 13.709/2018).
 */
const sendWelcomeAndVerificationEmail = async ({
  to,
  nome,
  tipo,
  verificationToken,
  lgpdConsentDate = new Date(),
  versaoTermos = '1.0'
}) => {
  const baseUrl = getBaseClientUrl();
  const verificationUrl = `${baseUrl}/verificar-email?token=${encodeURIComponent(verificationToken)}`;
  const papelLabel = tipo === 'estudante' ? 'Estudante / Atleta' : (tipo || 'Usuário');
  const dataFormatada = new Date(lgpdConsentDate).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo'
  });

  const subject = 'Bem-vindo(a) ao IFesporte! Confirme seu e-mail e veja os detalhes do seu cadastro';

  const textContent = [
    `Olá, ${nome}!`,
    '',
    `Seu cadastro no sistema IFesporte como ${papelLabel} foi realizado com sucesso.`,
    '',
    'Para confirmar e verificar seu endereço de e-mail, acesse o link abaixo:',
    verificationUrl,
    '',
    '--- TRANSPARÊNCIA E PRIVACIDADE (LGPD - Lei nº 13.709/2018) ---',
    `• Termos de Uso e Política de Privacidade aceitos em: ${dataFormatada} (Versão ${versaoTermos})`,
    '• Finalidade do tratamento: Gestão esportiva institucional, acompanhamento físico/técnico e comunicação acadêmica.',
    '• Direitos do Titular (Art. 18 da LGPD): Você pode consultar, corrigir ou atualizar seus dados a qualquer momento acessando a área "Meu Perfil" no sistema.',
    '',
    'Se você não realizou este cadastro, ignore esta mensagem ou entre em contato com a coordenação esportiva.',
    '',
    'Atenciosamente,',
    'Equipe IFesporte'
  ].join('\n');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Confirmação de Cadastro - IFesporte</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.06);border:1px solid #e2e8f0;">
            <tr>
              <td style="background:linear-gradient(135deg,#1E5EFF 0%,#0F3299 100%);padding:32px 28px;text-align:center;color:#ffffff;">
                <h1 style="margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">IFesporte</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Confirmação de Cadastro e Verificação de E-mail</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 28px;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">Olá, ${nome}!</h2>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155;">
                  Seja muito bem-vindo(a) ao <strong>IFesporte</strong>! Recebemos o seu cadastro com o perfil de <strong>${papelLabel}</strong>.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#334155;">
                  Você já pode acessar sua conta normalmente. Para validar seu endereço de e-mail e garantir a segurança das comunicações da sua conta, clique no botão abaixo:
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${verificationUrl}" style="display:inline-block;background-color:#1E5EFF;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;">
                    Confirmar Meu E-mail
                  </a>
                </div>
                <p style="margin:0 0 24px;font-size:12px;line-height:1.5;color:#64748b;word-break:break-all;">
                  Caso o botão não funcione, copie e cole este link no seu navegador:<br/>
                  <a href="${verificationUrl}" style="color:#1E5EFF;">${verificationUrl}</a>
                </p>
                <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #1E5EFF;border-radius:8px;padding:16px 20px;margin-top:24px;">
                  <h3 style="margin:0 0 8px;font-size:14px;color:#0f172a;">🔒 Registro de Privacidade e LGPD (Lei nº 13.709/2018)</h3>
                  <p style="margin:0 0 6px;font-size:13px;color:#475569;line-height:1.5;">
                    <strong>Consentimento registrado em:</strong> ${dataFormatada} (Termos v${versaoTermos})
                  </p>
                  <p style="margin:0 0 6px;font-size:13px;color:#475569;line-height:1.5;">
                    <strong>Finalidade do tratamento:</strong> Gestão esportiva institucional, organização de treinos e eventos, avaliações físicas/técnicas e comunicação acadêmica.
                  </p>
                  <p style="margin:0;font-size:13px;color:#475569;line-height:1.5;">
                    <strong>Seus direitos (Art. 18 da LGPD):</strong> Você pode visualizar, corrigir ou atualizar seus dados pessoais a qualquer momento na página <em>Meu Perfil</em>.
                  </p>
                </div>
                <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;line-height:1.5;text-align:center;">
                  Se você não realizou este cadastro no IFesporte, por favor desconsidere este e-mail.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  const transporter = createTransporter();

  if (!transporter) {
    console.log('================================================================');
    console.log('📧 [SIMULAÇÃO DE E-MAIL - IFESPORTE] (SMTP não configurado no .env)');
    console.log(`Para: ${to}`);
    console.log(`Assunto: ${subject}`);
    console.log(`Link de Verificação: ${verificationUrl}`);
    console.log(`Consentimento LGPD registrado em: ${dataFormatada} (v${versaoTermos})`);
    console.log('================================================================');
    return {
      sent: true,
      simulated: true,
      verificationUrl
    };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: textContent,
      html: htmlContent
    });

    console.log(`📧 E-mail de confirmação enviado para ${to} (MessageId: ${info.messageId})`);
    return {
      sent: true,
      simulated: false,
      messageId: info.messageId,
      verificationUrl
    };
  } catch (error) {
    console.error(`⚠️ Falha ao enviar e-mail via SMTP para ${to}:`, error.message);
    console.log(`🔗 Link de verificação gerado (fallback log): ${verificationUrl}`);
    return {
      sent: false,
      simulated: true,
      error: error.message,
      verificationUrl
    };
  }
};

module.exports = {
  sendWelcomeAndVerificationEmail,
  getBaseClientUrl,
  isSmtpConfigured
};

