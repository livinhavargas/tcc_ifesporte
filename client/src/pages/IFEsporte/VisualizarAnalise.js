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
import { isPrimeiroLugar } from './components/AtletismoForm';

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

  const isAtletismo = (modalidade || '').toLowerCase().includes('atletismo');
  const colocacao = dadosEspecificos?.colocacao || dadosEspecificos?.classificacaoFinalPontos || dadosEspecificos?.classificacao;
  const displayResultado = isAtletismo ? (isPrimeiroLugar(colocacao) ? 'Vitória' : null) : resultado;

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
              {equipeAdversaria ? (
                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', fontSize: '1.25rem' }}>
                  vs {equipeAdversaria}
                </h3>
              ) : subtipoProva ? (
                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: '0 0 6px', fontSize: '1.25rem' }}>
                  {subtipoProva}
                </h3>
              ) : null}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                <Calendar size={14} />
                <span>Data: <strong>{new Date(data || Date.now()).toLocaleDateString('pt-BR')}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            {displayResultado && (
              <div className="badge" style={{
                background: displayResultado === 'Vitória' ? 'var(--success-light)' : displayResultado === 'Derrota' ? 'var(--danger-light)' : 'var(--warning-light)',
                color: displayResultado === 'Vitória' ? 'var(--success)' : displayResultado === 'Derrota' ? 'var(--danger)' : 'var(--warning-text)',
                fontSize: '1rem',
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                {displayResultado}
              </div>
            )}
            {placar !== undefined && placar !== null && (
              <div style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--text)', lineHeight: 1 }}>
                {typeof placar === 'object' ? `${placar.nos || 0} x ${placar.adv || 0}` : String(placar)}
              </div>
            )}
            {(dadosEspecificos?.colocacao || dadosEspecificos?.classificacaoFinalPontos) && (
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)', marginTop: '4px' }}>
                Classificação: {dadosEspecificos.colocacao || dadosEspecificos.classificacaoFinalPontos}
              </div>
            )}
            {dadosEspecificos?.tempo && (
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                Tempo: {dadosEspecificos.tempo}
              </div>
            )}
            {dadosEspecificos?.alturaConseguida && (
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                Altura Conseguida: {dadosEspecificos.alturaConseguida}
              </div>
            )}
            {dadosEspecificos?.distanciaConseguida && (
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginTop: '4px' }}>
                Distância Conseguida: {dadosEspecificos.distanciaConseguida}
              </div>
            )}
          </div>
        </div>

        <div className="row g-4">
          {/* Card Atleta(s) Vinculado(s) */}
          {(aluno || (Array.isArray(atletas) && atletas.length > 0) || dadosEspecificos?.nomeAtleta || dadosEspecificos?.nomeDupla) && (
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

                  {!aluno && (dadosEspecificos?.nomeAtleta || dadosEspecificos?.nomeDupla) && (
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
                        {(dadosEspecificos.nomeAtleta || dadosEspecificos.nomeDupla).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'block' }}>
                          {dadosEspecificos.nomeAtleta || dadosEspecificos.nomeDupla}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {dadosEspecificos.nomeDupla ? 'Nossa Dupla' : 'Nosso Atleta'}
                        </span>
                      </div>
                    </div>
                  )}

                  {Array.isArray(atletas) && atletas
                    .filter(at => {
                      const atId = String(at?._id || at);
                      const alId = String(aluno?._id || aluno || '');
                      return atId !== alId;
                    })
                    .map(at => (
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                  {Object.entries(dadosEspecificos).map(([key, val]) => {
                    if (val === '' || val === null || val === undefined) return null;
                    if (key === 'atleta1' || key === 'atleta2') return null;
                    if (key === 'atleta1Nome' || key === 'atleta2Nome' || key === 'nomeAtleta' || key === 'nomeDupla') return null;
                    if (key === 'penaltisCobrancas' && dadosEspecificos.penaltisParticipantes) return null;
                    if (key === 'cartoes' && (dadosEspecificos.cartoes1T || dadosEspecificos.cartoes2T)) return null;
                    if (key.startsWith('placarSet') && typeof val === 'object' && val !== null && (parseInt(val.nos, 10) || 0) === 0 && (parseInt(val.adv, 10) || 0) === 0) return null;

                    const LABELS_MAP = {
                      placar1Tempo: 'Placar 1º Tempo',
                      placar2Tempo: 'Placar 2º Tempo',
                      penaltisAcertos: 'Gols por Pênalti',
                      penaltisErros: 'Pênaltis Perdidos',
                      penaltisParticipantes: 'Jogadores na Disputa de Pênaltis',
                      penaltisSofridos1T: 'Pênaltis Sofridos (1º Tempo)',
                      penaltisCometidos1T: 'Pênaltis Cometidos (1º Tempo)',
                      penaltisErrados1T: 'Pênaltis Errados (1º Tempo)',
                      penaltisDefendidos1T: 'Pênaltis Defendidos (1º Tempo)',
                      penaltisSofridos2T: 'Pênaltis Sofridos (2º Tempo)',
                      penaltisCometidos2T: 'Pênaltis Cometidos (2º Tempo)',
                      penaltisErrados2T: 'Pênaltis Errados (2º Tempo)',
                      penaltisDefendidos2T: 'Pênaltis Defendidos (2º Tempo)',
                      faltasSofridas1T: 'Faltas Sofridas (1º Tempo)',
                      faltasCometidas1T: 'Faltas Cometidas (1º Tempo)',
                      faltasSofridas2T: 'Faltas Sofridas (2º Tempo)',
                      faltasCometidas2T: 'Faltas Cometidas (2º Tempo)',
                      cartoes1T: 'Cartões (1º Tempo)',
                      cartoes2T: 'Cartões (2º Tempo)',
                      cartoes: 'Cartões Registrados',
                      foiParaPenaltis: 'Disputa de Pênaltis',
                      // Basquete - Cestas de 2 Pontos
                      cestas2PontosFeitas1T: 'Cestas de 2 Pontos Feitas (1º Tempo)',
                      cestas2PontosSofridas1T: 'Cestas de 2 Pontos Sofridas (1º Tempo)',
                      cestas2PontosFeitas2T: 'Cestas de 2 Pontos Feitas (2º Tempo)',
                      cestas2PontosSofridas2T: 'Cestas de 2 Pontos Sofridas (2º Tempo)',
                      // Basquete - Cestas de 3 Pontos
                      cestas3PontosFeitas1T: 'Cestas de 3 Pontos Feitas (1º Tempo)',
                      cestas3PontosSofridas1T: 'Cestas de 3 Pontos Sofridas (1º Tempo)',
                      cestas3PontosFeitas2T: 'Cestas de 3 Pontos Feitas (2º Tempo)',
                      cestas3PontosSofridas2T: 'Cestas de 3 Pontos Sofridas (2º Tempo)',
                      // Basquete - Lances Livres
                      lancesLivresFeitos1T: 'Lances Livres Feitos (1º Tempo)',
                      lancesLivresSofridos1T: 'Lances Livres Sofridos (1º Tempo)',
                      lancesLivresFeitos2T: 'Lances Livres Feitos (2º Tempo)',
                      lancesLivresSofridos2T: 'Lances Livres Sofridos (2º Tempo)',
                      lancesLivresAFavorQtd: 'Lances Livres a Favor',
                      lancesLivresContraQtd: 'Lances Livres Contra',
                      // Tênis de Mesa e Xadrez
                      formatoPartida: 'Individual ou em Dupla',
                      nomeAtleta: 'Nome do Atleta',
                      nomeDupla: 'Nome da Dupla',
                      corPecas: 'Cor com a qual o atleta está jogando',
                      cor: 'Cor com a qual o atleta está jogando',
                      // Voleibol, Vôlei de Praia e Tênis de Mesa
                      pontosCadaSet: 'Pontos de Cada Set (Histórico)',
                      placarSet1: 'Placar 1º Set',
                      placarSet2: 'Placar 2º Set',
                      placarSet3: 'Placar 3º Set',
                      placarSet4: 'Placar 4º Set',
                      placarSet5: 'Placar 5º Set',
                      acesFavorSet1: 'Aces a favor (1º Set)',
                      acesContraSet1: 'Aces contra (1º Set)',
                      acesFavorSet2: 'Aces a favor (2º Set)',
                      acesContraSet2: 'Aces contra (2º Set)',
                      acesFavorSet3: 'Aces a favor (3º Set)',
                      acesContraSet3: 'Aces contra (3º Set)',
                      acesFavorSet4: 'Aces a favor (4º Set)',
                      acesContraSet4: 'Aces contra (4º Set)',
                      acesFavorSet5: 'Aces a favor (5º Set)',
                      qualidadeSaque: 'Qualidade do Saque',
                      qualidadePasse: 'Qualidade do Passe',
                      qualidadeAtaque: 'Qualidade do Ataque',
                      levantamentosZona: 'Levantamentos (Zona)',
                      qualidadeLevantamento: 'Qualidade do Levantamento',
                      qualidadeBloqueio: 'Qualidade do Bloqueio',
                      // Atletismo
                      genero: 'Gênero',
                      quantidadeAdversarios: 'Adversários',
                      quantidadeEquipes: 'Equipes',
                      colocacao: 'Classificação',
                      tempo: 'Tempo',
                      raia: 'Raia',
                      tempoVencedor: 'Tempo do Vencedor / Vencedores',
                      alturaPartida: 'Altura de Partida',
                      tentativasPartida: 'Tentativas na Altura de Partida',
                      alturasPosteriores: 'Alturas Posteriores',
                      tentativasPosteriores: 'Tentativas nas Alturas Posteriores',
                      alturaConseguida: 'Altura Conseguida',
                      alturaVencedor: 'Altura do Vencedor',
                      distanciasTentativas: 'Distância em Cada Tentativa',
                      distanciaConseguida: 'Distância Conseguida',
                      distanciaVencedor: 'Distância do Vencedor',
                      classificacaoFinalPontos: 'Classificação Final',
                      classificacaoFinalVencedorPontos: 'Classificação Final do Vencedor',
                      atletasRevezamento: 'Atletas do Revezamento',
                      pentatlo: 'Provas Específicas do Pentatlo'
                    };

                    const label = LABELS_MAP[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    let formatted = val;

                    if (key === 'qualidadeSaque') {
                      const mapCat = {
                        'Ace': 'Positivo — Ace',
                        'Passe quebrado': 'Positivo — Passe quebrado',
                        'Bola viva': 'Médio — Bola viva',
                        'Saque fácil': 'Médio — Saque fácil',
                        'Erro (rede/fora)': 'Negativo — Erro (rede/fora)'
                      };
                      formatted = mapCat[val] || val;
                    } else if (key === 'qualidadeAtaque') {
                      const mapCat = {
                        'Ponto direto': 'Positivo — Ponto direto',
                        'Bloqueio explorado': 'Positivo — Bloqueio explorado',
                        'Bola defendida': 'Médio — Bola defendida',
                        'Ataque amortecido': 'Médio — Ataque amortecido',
                        'Erro (rede/fora)': 'Negativo — Erro (rede/fora)',
                        'Toco (bloqueado)': 'Negativo — Toco (bloqueado)'
                      };
                      formatted = mapCat[val] || val;
                    } else if (key === 'foiParaPenaltis') {
                      formatted = val ? 'Sim, decidida nos pênaltis' : 'Não';
                    } else if (key === 'distanciasTentativas' && Array.isArray(val)) {
                      const attempts = val.map((d, i) => d ? `T${i + 1}: ${d}` : null).filter(Boolean);
                      formatted = attempts.length > 0 ? attempts.join(' | ') : 'Nenhuma marca registrada';
                    } else if ((key === 'tentativasPartida' || key === 'tentativasPosteriores') && Array.isArray(val)) {
                      const attempts = val.map((t, i) => t ? `T${i + 1}: ${t}` : null).filter(Boolean);
                      formatted = attempts.length > 0 ? attempts.join(' | ') : 'Nenhuma tentativa registrada';
                    } else if (key === 'atletasRevezamento' && Array.isArray(val)) {
                      const nomes = val.map((id, i) => {
                        const a = (Array.isArray(atletas) ? atletas : []).find(x => (x._id || x) === id);
                        return a ? (a.nome || a) : (id ? `Atleta ${i + 1}` : null);
                      }).filter(Boolean);
                      formatted = nomes.join(', ') || `${val.length} atletas`;
                    } else if (key === 'pentatlo' && typeof val === 'object' && val !== null) {
                      const p = val;
                      const parts = [];
                      if (p.barreirasColocacao || p.barreirasTempo || p.barreirasTempoVencedor) {
                        parts.push(`Classificação 100m/110m com Barreiras: [Classif: ${p.barreirasColocacao || '-'} | Tempo: ${p.barreirasTempo || '-'} | Vencedor: ${p.barreirasTempoVencedor || '-'}]`);
                      }
                      if (p.alturaColocacao || p.alturaMarca || p.alturaVencedor) {
                        parts.push(`Classificação Salto em Altura: [Classif: ${p.alturaColocacao || '-'} | Altura: ${p.alturaMarca || p.saltoAlturaAltura || '-'} | Vencedor: ${p.alturaVencedor || '-'}]`);
                      }
                      if (p.pesoColocacao || p.pesoMarca || p.pesoVencedor) {
                        parts.push(`Classificação Arremesso de Peso: [Classif: ${p.pesoColocacao || '-'} | Distância: ${p.pesoMarca || p.arremessoPesoDistancia || '-'} | Vencedor: ${p.pesoVencedor || '-'}]`);
                      }
                      if (p.distanciaColocacao || p.distanciaMarca || p.distanciaVencedor) {
                        parts.push(`Classificação Salto em Distância: [Classif: ${p.distanciaColocacao || '-'} | Distância: ${p.distanciaMarca || p.saltoDistanciaDistancia || '-'} | Vencedor: ${p.distanciaVencedor || '-'}]`);
                      }
                      if (p.corrida800mColocacao || p.corrida800mTempo || p.corrida800mTempoVencedor) {
                        parts.push(`Classificação 800m: [Classif: ${p.corrida800mColocacao || '-'} | Tempo: ${p.corrida800mTempo || '-'} | Vencedor: ${p.corrida800mTempoVencedor || '-'}]`);
                      }
                      formatted = parts.length > 0 ? parts.join('\n') : 'Dados não informados';
                    } else if (key === 'placar1Tempo' || key === 'placar2Tempo' || key.startsWith('placarSet')) {
                      formatted = typeof val === 'object' && val !== null ? `${val.nos || 0} x ${val.adv || 0}` : String(val);
                    } else if (key === 'cartoes1T' || key === 'cartoes2T' || key === 'cartoes') {
                      if (Array.isArray(val)) {
                        formatted = val.length > 0 
                          ? val.map(c => `${c.tipo === 'Vermelho' ? '🟥 Vermelho' : '🟨 Amarelo'}: ${c.atletaNome || 'Atleta'}`).join('; ')
                          : 'Nenhum';
                      }
                    } else if (key === 'penaltisParticipantes') {
                      if (Array.isArray(val)) {
                        const cobrancas = Array.isArray(dadosEspecificos.penaltisCobrancas) ? dadosEspecificos.penaltisCobrancas : [];
                        const nomes = val.map(id => {
                          const c = cobrancas.find(x => x.atletaId === id);
                          if (c && c.atletaNome) return c.atletaNome;
                          const a = (Array.isArray(atletas) ? atletas : []).find(x => (x._id || x) === id);
                          return a ? (a.nome || a) : id;
                        });
                        formatted = nomes.join(', ') || `${val.length} atletas`;
                      }
                    } else if (Array.isArray(val)) {
                      formatted = val.map(item => typeof item === 'object' ? JSON.stringify(item) : String(item)).join(', ');
                    } else if (typeof val === 'object') {
                      formatted = JSON.stringify(val, null, 2);
                    } else if (typeof val === 'string' && /^[A-C]\s*—\s*/.test(val)) {
                      formatted = val.replace(/^[A-C]\s*—\s*/, '');
                    } else {
                      formatted = String(val);
                    }

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
                  Observações do treinador
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
      </div>
    </Layout>
  );
};

export default VisualizarAnalise;
