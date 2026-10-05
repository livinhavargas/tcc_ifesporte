import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Trophy, ArrowRight, 
  CalendarX, Clock, MapPin, GraduationCap
} from 'lucide-react';
import { apiUrl } from '../../services/api';
import SportIcon, { detectSport } from '../../components/SportIcon';
import { getStudentPositionForSport, isSportWithPositions } from '../../utils/sportPositions';

const StudentHome = ({ userName }) => {
  const [events, setEvents] = useState([]);
  const [sports, setSports] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [peData, setPeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    try {
      setLoading(true);

      // 1. Perfil do Estudante (Esportes cadastrados e posições)
      const resProfile = await fetch(apiUrl(`/api/users/${userId}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataProfile = resProfile.ok ? await resProfile.json() : null;
      setStudentProfile(dataProfile);

      const studentMods = dataProfile?.modalidades || dataProfile?.esportes || [];
      const uniqueSports = Array.from(new Set(studentMods.filter(Boolean)));
      setSports(uniqueSports);

      // 2. Próximos eventos da Agenda
      const resEvents = await fetch(apiUrl('/api/events'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataEvents = resEvents.ok ? await resEvents.json() : [];
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const futuros = Array.isArray(dataEvents) 
        ? dataEvents.filter(ev => ev.data && ev.data.split('T')[0] >= todayStr)
        : [];
      futuros.sort((a, b) => (a.data || '').localeCompare(b.data || ''));
      setEvents(futuros.slice(0, 6));

      // 3. Próxima aula de Educação Física (se aplicável para 1º e 2º ano)
      try {
        const resPe = await fetch(apiUrl('/api/educacao-fisica/proxima-aula'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resPe.ok) {
          const dataPe = await resPe.json();
          setPeData(dataPe);
        }
      } catch (peErr) {
        console.error('Erro ao buscar dados da aula de Educação Física:', peErr);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da página inicial do estudante:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return '';
    const dateStr = dataString.split('T')[0];
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  const getEventBadgeColor = (tipo) => {
    const t = (tipo || '').toLowerCase();
    if (t === 'treino') return { bg: 'var(--primary-light)', color: 'var(--primary)' };
    if (t === 'jogo' || t === 'amistoso') return { bg: 'var(--success-light)', color: 'var(--success)' };
    if (t === 'campeonato') return { bg: 'var(--accent-light)', color: 'var(--accent)' };
    if (t === 'educação física') return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
    return { bg: 'var(--bg-hover)', color: 'var(--text-secondary)' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto', paddingBottom: '32px' }}>
      
      {/* ── Saudação ao Estudante ── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.5rem', letterSpacing: '-0.3px' }}>
          Olá, <span style={{ color: 'var(--primary)' }}>{userName ? userName.split(' ')[0] : 'Estudante'}</span> 👋
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', margin: '4px 0 0' }}>
          Confira seus próximos eventos e as modalidades esportivas nas quais você está cadastrado.
        </p>
      </div>

      <div className="row g-4">
        {/* Coluna Principal: Próximos Eventos e Meus Esportes */}
        <div className={peData && !peData.isThirdYear && peData.hasTurma ? "col-lg-8" : "col-12"}>
          
          {/* ── SEÇÃO: Próximos Eventos ── */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                  Próximos eventos
                </h3>
              </div>
              <Link 
                to="/agenda" 
                style={{
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'opacity var(--transition-fast)'
                }}
              >
                Ver Agenda completa <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              {events.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <CalendarX size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '12px' }} />
                  <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>Sem próximos eventos</h6>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
                    Não há treinos, jogos ou compromissos programados no momento.
                  </p>
                </div>
              ) : (
                events.map((ev, i) => {
                  const badgeStyle = getEventBadgeColor(ev.tipo);
                  return (
                    <div
                      key={ev._id || i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        gap: '16px',
                        borderBottom: i < events.length - 1 ? '1px solid var(--border-light)' : 'none',
                        transition: 'background var(--transition-fast)'
                      }}
                      className="hover-bg-subtle"
                    >
                      {/* Data Box */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text)', lineHeight: 1 }}>
                          {formatarData(ev.data).split('/')[0]}
                        </span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-tertiary)', marginTop: '2px', lineHeight: 1 }}>
                          {formatarData(ev.data).split('/')[1]}
                        </span>
                      </div>

                      {/* Event Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <h5 style={{
                            fontWeight: 700,
                            fontSize: '0.9375rem',
                            color: 'var(--text)',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {ev.titulo}
                          </h5>
                          {ev.tipo && (
                            <span style={{
                              background: badgeStyle.bg,
                              color: badgeStyle.color,
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)'
                            }}>
                              {ev.tipo}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} />
                            {ev.horaInicial || ev.hora || '12:00'}{ev.horaFinal ? ` - ${ev.horaFinal}` : ''}
                          </span>
                          {ev.modalidade && (
                            <span>• {ev.modalidade}</span>
                          )}
                          {ev.localNome && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={13} /> {ev.localNome}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        flexShrink: 0
                      }}>
                        {detectSport(`${ev.titulo} ${ev.descricao || ''} ${ev.modalidade || ''}`) ? (
                          <SportIcon text={`${ev.titulo} ${ev.descricao || ''} ${ev.modalidade || ''}`} size={20} />
                        ) : (
                          <CalendarIcon size={18} />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── SEÇÃO: Meus Esportes ── */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '18px', borderRadius: '2px', background: 'var(--accent)' }}></div>
                <h3 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>
                  Meus Esportes
                </h3>
              </div>
              <Link 
                to="/perfil" 
                style={{
                  textDecoration: 'none',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Gerenciar no Perfil <ArrowRight size={15} />
              </Link>
            </div>

            {sports.length === 0 ? (
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed var(--border)',
                padding: '40px 24px',
                textAlign: 'center'
              }}>
                <Trophy size={32} style={{ color: 'var(--text-tertiary)', opacity: 0.5, marginBottom: '10px' }} />
                <h6 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                  Nenhum esporte cadastrado
                </h6>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '0 0 16px' }}>
                  Você ainda não possui modalidades vinculadas ao seu perfil.
                </p>
                <Link to="/perfil" className="btn btn-outline-primary btn-sm rounded-pill px-4">
                  Cadastrar Modalidades
                </Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))',
                gap: '16px'
              }}>
                {sports.map((mod, idx) => {
                  const pos = studentProfile ? getStudentPositionForSport(studentProfile, mod) : null;
                  const hasPos = isSportWithPositions(mod);

                  return (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-light)',
                        padding: '18px 16px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '10px',
                        transition: 'all var(--transition-fast)'
                      }}
                      className="hover-lift"
                    >
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-xs)'
                      }}>
                        <SportIcon sport={mod} size={28} />
                      </div>

                      <div style={{ width: '100%' }}>
                        <h5 style={{
                          fontWeight: 800,
                          fontSize: '0.9375rem',
                          color: 'var(--text)',
                          margin: '0 0 4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {mod}
                        </h5>

                        {hasPos && pos && pos !== 'Indefinido' && (
                          <span style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: 'var(--primary-light)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-block'
                          }}>
                            {pos}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Coluna Lateral: Educação Física (Quando aplicável) */}
        {peData && !peData.isThirdYear && peData.hasTurma && (
          <div className="col-lg-4">
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '24px',
              position: 'sticky',
              top: '84px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-light)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <GraduationCap size={18} />
                  </div>
                  <h5 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '0.9375rem' }}>
                    Educação Física
                  </h5>
                </div>

                {peData?.proximaAula?.status === 'em_andamento' && (
                  <span className="badge" style={{
                    background: 'var(--success-light)',
                    color: 'var(--success-text)',
                    border: '1px solid var(--success)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '4px 8px'
                  }}>
                    Em andamento
                  </span>
                )}
                {peData?.proximaAula?.status === 'hoje' && (
                  <span className="badge" style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '4px 8px'
                  }}>
                    Hoje
                  </span>
                )}
              </div>

              {!peData.hasHorarios ? (
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}>
                    Turma {peData.turma} • {peData.curso}
                  </div>
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: 0 }}>
                    Os horários de Educação Física ainda não foram configurados para sua turma.
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{
                    background: peData.proximaAula?.status === 'em_andamento'
                      ? 'var(--success-light)'
                      : 'var(--bg)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px',
                    marginBottom: '14px',
                    border: peData.proximaAula?.status === 'em_andamento'
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid var(--border-light)'
                  }}>
                    <span style={{
                      display: 'block',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: peData.proximaAula?.status === 'em_andamento' ? 'var(--success-text)' : 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '4px'
                    }}>
                      {peData.proximaAula?.label}
                    </span>
                    <strong style={{
                      fontSize: '1rem',
                      color: peData.proximaAula?.status === 'em_andamento' ? 'var(--success-text)' : 'var(--text)',
                      display: 'block'
                    }}>
                      {peData.proximaAula?.textoFormatado}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      Turma {peData.turma} • {peData.curso} (45 min)
                    </span>
                  </div>

                  <Link
                    to="/agenda"
                    className="btn btn-outline-primary btn-sm"
                    style={{ width: '100%', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <CalendarIcon size={14} /> Ver na Agenda
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentHome;
