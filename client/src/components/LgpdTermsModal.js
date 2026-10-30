import React from 'react';
import { ShieldCheck, Lock, FileText, UserCheck, HeartPulse, Mail, X, Check } from 'lucide-react';

export const LGPD_TERMS_VERSION = '1.0';

const LgpdTermsModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lgpd-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '88vh',
          background: 'var(--bg-card)',
          color: 'var(--text)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <h5 id="lgpd-modal-title" style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
                Termos de Uso e Política de Privacidade (LGPD)
              </h5>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                Em conformidade com a Lei nº 13.709/2018 • Versão {LGPD_TERMS_VERSION}
              </small>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.875rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <p style={{ margin: 0 }}>
            O sistema <strong>IFesporte</strong> compromete-se com a privacidade, a transparência e a proteção dos dados pessoais de estudantes, atletas, professores e treinadores, em estrita observância à <strong>Lei Geral de Proteção de Dados Pessoais (LGPD – Lei nº 13.709/2018)</strong>.
          </p>

          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <FileText size={16} style={{ color: 'var(--primary)' }} />
              1. Finalidade e Necessidade do Tratamento (Art. 6º, I e III)
            </h6>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>
              Os dados pessoais coletados no cadastro são utilizados exclusivamente para finalidades institucionais, acadêmicas e esportivas: identificação do estudante/atleta ou treinador, formação de equipes e turmas, gestão de cronogramas e eventos esportivos, análises técnicas de desempenho e acompanhamento de aptidão física.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <HeartPulse size={16} style={{ color: 'var(--error)' }} />
              2. Dados Físicos, Médicos e de Saúde (Art. 11 da LGPD)
            </h6>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>
              Informações antropométricas (peso, altura, IMC) e de saúde (alergias, lesões anteriores e restrições médicas) são tratadas com proteção reforçada. Sua coleta visa resguardar a integridade física do estudante/atleta durante treinos, aulas de Educação Física e competições, bem como subsidiar avaliações físicas pedagógicas (protocolo PROESP-Br).
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <UserCheck size={16} style={{ color: 'var(--primary)' }} />
              3. Dados de Estudantes e Responsáveis Legais (Art. 14 da LGPD)
            </h6>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>
              O tratamento de dados de estudantes adolescentes é realizado sempre em seu melhor interesse pedagógico e desportivo, mantendo-se o registro do nome e telefone do responsável legal para comunicações institucionais e situações de emergência.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <Lock size={16} style={{ color: 'var(--primary)' }} />
              4. Segurança, Acesso Restrito e Não Comercialização (Art. 46 da LGPD)
            </h6>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>
              As senhas são armazenadas de forma criptografada (hash unidirecional) e o acesso às fichas técnicas e médicas é restrito à equipe de professores, treinadores e coordenadores autenticados no sistema. O IFesporte não comercializa nem compartilha dados pessoais com terceiros para fins publicitários.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <Mail size={16} style={{ color: 'var(--primary)' }} />
              5. Verificação de E-mail e Direitos do Titular (Art. 18 da LGPD)
            </h6>
            <p style={{ margin: 0, fontSize: '0.825rem' }}>
              Ao concluir o cadastro, você receberá um e-mail de confirmação contendo um link para validar seu endereço eletrônico e o comprovante do seu consentimento. A qualquer momento, você tem direito ao acesso, à visualização e à correção de seus dados diretamente na página <strong>Meu Perfil</strong>, bem como a solicitar esclarecimentos ou a exclusão de sua conta junto à coordenação esportiva.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline-secondary fw-bold px-4 rounded-3"
          >
            Fechar
          </button>
          {onAccept && (
            <button
              type="button"
              onClick={() => {
                onAccept();
                onClose();
              }}
              className="btn btn-primary fw-bold px-4 rounded-3"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Check size={16} />
              Li e Concordo com os Termos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LgpdTermsModal;

