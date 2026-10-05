import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import { addNotification } from '../../utils/notifications';
import { apiUrl } from '../../services/api';
import { 
  ArrowLeft, Edit2, Trash2, Calendar, 
  Users, Activity, MessageSquare, AlertCircle 
} from 'lucide-react';

const VisualizarAnalise = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userType = localStorage.getItem('tipo');
  const isStudent = (userType || '').toLowerCase() === 'estudante';

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(apiUrl(`/api/analysis/${id}`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      } else {
        setError('Análise esportiva não encontrada.');
      }
    } catch (err) {
      console.error('Erro ao buscar análise:', err);
      setError('Erro de conexão ao buscar análise.');
    } finally {
      setLoading(false);
    }
  };

  const getSportRouteId = (mod) => {
    const norm = (mod || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (norm.includes('atletismo')) return 'atletismo';
    if (norm.includes('badminton')) return 'badminton';
    if (norm.includes('tenis de mesa') || norm.includes('tênis de mesa')) return 'tenis-de-mesa';
    if (norm.includes('xadrez')) return 'xadrez';
    if (norm.includes('basquete')) return 'basquete';
    if (norm.includes('futsal')) return 'futsal';
    if (norm.includes('futebol')) return 'futebol';
    if (norm.includes('handebol')) return 'handebol';
    if (norm.includes('volei de praia') || norm.includes('vôlei de praia')) return 'volei-praia';
    if (norm.includes('volei') || norm.includes('vôlei') || norm.includes('voleibol')) return 'voleibol';
    return 'futsal';
  };

  const getBackUrl = () => {
    if (isStudent) return '/analises';
    if (!analysis) return '/esportes';
    const sportRouteId = getSportRouteId(analysis.modalidade);
    let query = `tab=analises&genero=${encodeURIComponent(analysis.categoria || 'Geral')}`;
    
    if (analysis.modalidade && analysis.modalidade.includes(' - ')) {
      const parts = analysis.modalidade.split(' - ').map(s => s.trim());
      if (parts.length > 1) query += `&cat=${encodeURIComponent(parts[1])}`;
      if (parts.length > 2) query += `&sub=${encodeURIComponent(parts[2])}`;
    } else if (sportRouteId === 'atletismo' && analysis.subtipoProva) {
      query += `&sub=${encodeURIComponent(analysis.subtipoProva)}`;
    }
    
    return `/esportes/${sportRouteId}?${query}`;
  };

  const handleDelete = async () => {
    if (isStudent) return;
    if (!window.confirm('Tem certeza que deseja excluir esta análise esportiva?')) return;
    try {
      const response = await fetch(apiUrl(`/api/analysis/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        addNotification('Análise Excluída', 'O registro foi removido com sucesso.');
        navigate(getBackUrl());
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
        </div>
      </Layout>
    );
  }

  if (error || !analysis) {
    return (
      <Layout>
        <div style={{ width: '100%', maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            padding: '48px 24px'
          }}>
            <AlertCircle size={48} style={{ color: 'var(--error)', marginBottom: '16px' }} />
            <h4 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
              {error || 'Análise não encontrada'}
            </h4>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', marginBottom: '24px' }}>
              O registro que você está tentando acessar pode ter sido removido ou o link está incorreto.
            </p>
            <Link to={isStudent ? "/analises" : "/esportes"} className="btn btn-primary" style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontWeight: 600 }}>
              {isStudent ? 'Voltar para Análises' : 'Voltar para Esportes'}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const { modalidade, categoria, subtipoProva, data, equipeAdversaria, resultado, placar, aluno, atletas, dadosEspecificos = {}, observacoes } = analysis;

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '16px' }} className="d-none-print">
          {isStudent ? (
            <>
              <Link to="/analises" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                Análises
              </Link>
              <span>/</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                {modalidade}
              </span>
            </>
          ) : (
            <>
              <Link to="/esportes" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                Esportes
              </Link>
              <span>/</span>
              <Link to={getBackUrl()} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                {modalidade} ({categoria || 'Geral'})
              </Link>
              <span>/</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Registro de Partida / Prova
              </span>
            </>
          )}
        </div>

        {/* Top Header Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-secondary rounded-circle" 
              style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => navigate(getBackUrl())}
              title={isStudent ? "Voltar para Análises" : "Voltar para a modalidade"}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>
                Registro Técnico: {modalidade}
              </h1>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
                {subtipoProva || (equipeAdversaria ? `Confronto contra ${equipeAdversaria}` : 'Avaliação Esportiva')}
              </p>
            </div>
          </div>

          {!isStudent && (
            <div style={{ display: 'flex', gap: '10px' }} className="d-none-print">
              <button 
                className="btn btn-outline-primary"
                onClick={() => navigate(`/analises/editar/${id}`)}
                style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Edit2 size={16} /> Editar
              </button>
              <button 
                className="btn btn-outline-danger"
                onClick={handleDelete}
                style={{ padding: '8px 18px', fontWeight: 600, borderRadius: 'var(--radius-md)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> Excluir
              </button>
            </div>
          )}
        </div>

        {/* Banner Principal do Resultado / Placar */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SportIcon sport={modalidade} size={32} />
            </div>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem' }}>
                  {modalidade}
                </span>
                <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8125rem' }}>
                  {categoria || 'Geral'}
                </span>
                {subtipoProva && (
                  <span className="badge" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: '0.8125rem' }}>
                    {subtipoProva}
                  </span>
                )}
              </div>
              {equipeAdversaria && (
                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', fontSize: '1.25rem' }}>
                  vs {equipeAdversaria}
                </h3>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                <Calendar size={14} />
                <span>Data: <strong>{new Date(data || Date.now()).toLocaleDateString('pt-BR')}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {resultado && (
              <div className="badge" style={{
                background: resultado === 'Vitória' ? 'var(--success-light)' : resultado === 'Derrota' ? 'var(--danger-light)' : 'var(--warning-light)',
                color: resultado === 'Vitória' ? 'var(--success)' : resultado === 'Derrota' ? 'var(--danger)' : 'var(--warning-text)',
                fontSize: '1rem',
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {resultado}
              </div>
            )}
            {placar !== undefined && placar !== null && (
              <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--text)', lineHeight: 1 }}>
                {typeof placar === 'object' ? `${placar.nos || 0} x ${placar.adv || 0}` : String(placar)}
              </div>
            )}
            {dadosEspecificos?.colocacao && (
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', marginTop: '4px' }}>
                Colocação: {dadosEspecificos.colocacao}
              </div>
            )}
            {dadosEspecificos?.tempo && (
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                Tempo: {dadosEspecificos.tempo}
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Card Atleta(s) Vinculado(s) */}
          {(aluno || (Array.isArray(atletas) && atletas.length > 0)) && (
            <div className="col-12">
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '16px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: 'var(--primary)' }} />
                  Atleta(s) Avaliado(s)
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
                  {aluno && (
                    <div style={{
                      background: 'var(--bg)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9375rem'
                      }}>
                        {aluno.nome ? aluno.nome.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'block' }}>
                          {aluno.nome}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {aluno.turma || aluno.serie || 'Principal'} {aluno.matricula ? `· ${aluno.matricula}` : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {Array.isArray(atletas) && atletas.map(at => (
                    <div key={at._id || at} style={{
                      background: 'var(--bg)',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '38px', height: '38px', borderRadius: '50%',
                        background: 'var(--primary)', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9375rem'
                      }}>
                        {at.nome ? at.nome.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'block' }}>
                          {at.nome || at}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {at.turma || at.serie || ''} {at.matricula ? `· ${at.matricula}` : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Estatísticas Técnicas e Específicas */}
          <div className="col-12">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--primary)' }} />
                Estatísticas e Dados Técnicos Registrados
              </h5>

              {Object.keys(dadosEspecificos).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
                  {Object.entries(dadosEspecificos).map(([key, val]) => {
                    if (val === '' || val === null || val === undefined) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    const formatted = Array.isArray(val) ? val.join(', ') : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);

                    return (
                      <div key={key} style={{
                        background: 'var(--bg)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 16px',
                        border: '1px solid var(--border-light)'
                      }}>
                        <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                          {label}
                        </span>
                        <strong style={{ fontSize: '0.9375rem', color: 'var(--text)', wordBreak: 'break-word' }}>
                          {formatted}
                        </strong>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
                  Nenhum dado estatístico adicional registrado nesta análise.
                </p>
              )}
            </div>
          </div>

          {/* Observações do Treinador */}
          {observacoes && (
            <div className="col-12">
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '12px', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
                  Observações do Treinador
                </h5>
                <div style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 18px',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {observacoes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-start' }} className="d-none-print">
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(getBackUrl())}
            style={{ borderRadius: 'var(--radius-md)', padding: '8px 20px', fontWeight: 600, fontSize: '0.875rem' }}
          >
            ← Voltar para {modalidade} ({categoria || 'Geral'})
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default VisualizarAnalise;
