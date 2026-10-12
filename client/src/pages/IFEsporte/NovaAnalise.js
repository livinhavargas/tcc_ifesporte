import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import SportIcon from '../../components/SportIcon';
import { addNotification } from '../../utils/notifications';
import { apiUrl } from '../../services/api';
import { ArrowLeft, Save, Users, Trophy, AlertCircle } from 'lucide-react';

import FutebolFutsalForm from './components/FutebolFutsalForm';
import BasqueteForm from './components/BasqueteForm';
import HandebolForm from './components/HandebolForm';
import VoleiForm from './components/VoleiForm';
import BadmintonTenisMesaForm from './components/BadmintonTenisMesaForm';
import XadrezForm from './components/XadrezForm';
import AtletismoForm from './components/AtletismoForm';

const NovaAnalise = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: editId } = useParams();

  // Query params or defaults
  const paramModalidadeRaw = searchParams.get('modalidade') || 'Futsal';
  const paramGenero = searchParams.get('genero') || searchParams.get('categoria') || 'Geral';
  const paramSubtipoRaw = searchParams.get('subtipo') || searchParams.get('subtipoProva') || '';
  const paramCat = searchParams.get('cat') || '';
  const paramSub = searchParams.get('sub') || '';
  const isEditing = Boolean(editId);

  // Parse modalidade if formatted as "Atletismo - Corridas - 200m"
  let parsedModalidade = paramModalidadeRaw;
  let parsedSubtipo = paramSubtipoRaw;
  if (paramModalidadeRaw.includes(' - ')) {
    const parts = paramModalidadeRaw.split(' - ').map(s => s.trim());
    parsedModalidade = parts[0];
    if (!parsedSubtipo && parts.length > 1) {
      parsedSubtipo = parts.length > 2 ? parts[2] : parts[1];
    }
  } else if (paramSub) {
    parsedSubtipo = paramSub;
  }

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    modalidade: parsedModalidade,
    categoria: paramGenero,
    subtipoProva: parsedSubtipo,
    data: new Date().toISOString().split('T')[0],
    equipeAdversaria: '',
    resultado: 'Vitória',
    placar: '',
    aluno: '',
    atletas: [],
    dadosEspecificos: {},
    observacoes: ''
  });

  // Carregar lista de atletas e dados da análise se estiver editando
  useEffect(() => {
    fetchInitialData();
  }, [editId]);

  const fetchInitialData = async () => {
    try {
      // 1. Carregar atletas
      const resStudents = await fetch(apiUrl('/api/students'), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (resStudents.ok) {
        const dataStudents = await resStudents.json();
        setStudents(dataStudents);
      }

      // 2. Se for edição, carregar a análise existente
      if (editId) {
        const resAnalysis = await fetch(apiUrl(`/api/analysis/${editId}`), {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (resAnalysis.ok) {
          const analysisData = await resAnalysis.json();
          const existingCat = analysisData.categoria || paramGenero;
          const normalizedCat = (existingCat || '').toLowerCase().startsWith('fem')
            ? 'Feminino'
            : (existingCat || '').toLowerCase().startsWith('masc')
            ? 'Masculino'
            : 'Geral';

          setFormData({
            modalidade: analysisData.modalidade || parsedModalidade,
            categoria: normalizedCat,
            subtipoProva: analysisData.subtipoProva || parsedSubtipo,
            data: analysisData.data ? analysisData.data.split('T')[0] : new Date().toISOString().split('T')[0],
            equipeAdversaria: analysisData.equipeAdversaria || '',
            resultado: analysisData.resultado || 'Vitória',
            placar: analysisData.placar !== undefined && analysisData.placar !== null ? analysisData.placar : '',
            aluno: analysisData.aluno?._id || analysisData.aluno || '',
            atletas: Array.isArray(analysisData.atletas) ? analysisData.atletas.map(a => a._id || a) : [],
            dadosEspecificos: analysisData.dadosEspecificos || {},
            observacoes: analysisData.observacoes || ''
          });
        } else {
          setFormError('Não foi possível carregar os dados da análise.');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setFormError('Erro de conexão ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateDadosEspecificos = (updatedDados) => {
    setFormData(prev => ({
      ...prev,
      dadosEspecificos: {
        ...prev.dadosEspecificos,
        ...updatedDados
      }
    }));
  };

  // Filtrar atletas disponíveis pelo esporte e gênero
  const filteredStudents = students.filter(student => {
    if (formData.categoria && formData.categoria !== 'Geral' && student.sexo) {
      if (student.sexo.toLowerCase() !== formData.categoria.toLowerCase()) {
        return false;
      }
    }
    const sports = student.modalidades || student.esportes || [];
    if (sports.length === 0) return true;
    const norm = (s) => (s || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const modNorm = norm(formData.modalidade);
    return sports.some(sp => norm(sp).includes(modNorm) || modNorm.includes(norm(sp)));
  });

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
    const sportRouteId = getSportRouteId(formData.modalidade || parsedModalidade);
    let query = `tab=analises&genero=${encodeURIComponent(formData.categoria || 'Geral')}`;
    
    if (paramCat) query += `&cat=${encodeURIComponent(paramCat)}`;
    if (paramSub) query += `&sub=${encodeURIComponent(paramSub)}`;
    else if (paramModalidadeRaw.includes(' - ')) {
      const parts = paramModalidadeRaw.split(' - ').map(s => s.trim());
      if (parts.length > 1) query += `&cat=${encodeURIComponent(parts[1])}`;
      if (parts.length > 2) query += `&sub=${encodeURIComponent(parts[2])}`;
    }
    
    return `/esportes/${sportRouteId}?${query}`;
  };

  const validateForm = () => {
    const mod = (formData.modalidade || '').toLowerCase();
    const dados = formData.dadosEspecificos || {};

    if (!formData.data) {
      return 'Informe a data da partida/prova.';
    }

    // 1. ATLETISMO
    if (mod.includes('atletismo')) {
      const subtipo = (formData.subtipoProva || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]/g, "");
      const isRevezamento = subtipo.includes('revezamento') || subtipo.includes('4x100') || subtipo.includes('4x400');

      if (isRevezamento) {
        const atletas = Array.isArray(dados.atletasRevezamento) ? dados.atletasRevezamento.filter(Boolean) : [];
        if (atletas.length !== 4) {
          return 'No revezamento, é obrigatório selecionar exatamente os 4 atletas da equipe.';
        }
        if (dados.quantidadeEquipes === undefined || dados.quantidadeEquipes === null || dados.quantidadeEquipes === '') {
          return 'Informe quantas equipes participaram do revezamento.';
        }
        if (!dados.colocacao || !String(dados.colocacao).trim()) {
          return 'Informe a colocação da equipe no revezamento.';
        }
      } else {
        // Todas as demais provas individuais do Atletismo (Corridas, Barreiras, Saltos, Lançamentos, Pentatlo)
        if (!formData.aluno) {
          return 'Selecione o atleta participante da prova.';
        }
        if (dados.quantidadeAdversarios === undefined || dados.quantidadeAdversarios === null || dados.quantidadeAdversarios === '') {
          return 'Informe a quantidade de adversários.';
        }
        if (!dados.colocacao || !String(dados.colocacao).trim()) {
          return 'Informe a colocação do atleta.';
        }
      }

      return null;
    }

    // 2. VOLEIBOL E VÔLEI DE PRAIA
    if (mod.includes('volei') || mod.includes('vôlei')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe o nome da equipe adversária.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida (Vitória ou Derrota).';
      }
      return null;
    }

    // 2.1 OUTRAS MODALIDADES DE SETS: Badminton, Tênis de Mesa
    if (mod.includes('badminton') || mod.includes('tenis de mesa') || mod.includes('tênis de mesa')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe o nome da equipe/atleta adversário.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida.';
      }
      const placar = typeof formData.placar === 'object' && formData.placar !== null ? formData.placar : { nos: 0, adv: 0 };
      const totalSets = (parseInt(placar.nos, 10) || 0) + (parseInt(placar.adv, 10) || 0);
      if (totalSets <= 0) {
        return 'O placar em sets deve ser maior que zero (defina os sets da partida).';
      }
      const pontos = Array.isArray(dados.pontosCadaSet) ? dados.pontosCadaSet : [];
      if (pontos.length < totalSets || pontos.slice(0, totalSets).some(p => !p || !String(p).trim())) {
        return `É obrigatório preencher os pontos de todos os ${totalSets} sets disputados.`;
      }
      return null;
    }

    // 3. FUTEBOL E FUTSAL
    if (mod.includes('futebol') || mod.includes('futsal')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe a equipe adversária.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida.';
      }
      if (dados.foiParaPenaltis) {
        const participantes = Array.isArray(dados.penaltisParticipantes) && dados.penaltisParticipantes.length > 0
          ? dados.penaltisParticipantes
          : (Array.isArray(dados.penaltisCobrancas) ? dados.penaltisCobrancas.filter(c => c && c.atletaId) : []);
        if (participantes.length === 0) {
          return 'Quando a partida foi para os pênaltis, selecione os jogadores que participaram da cobrança.';
        }
      }
      return null;
    }

    // 4. BASQUETE
    if (mod.includes('basquete')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe a equipe adversária.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida.';
      }
      return null;
    }

    // 5. HANDEBOL
    if (mod.includes('handebol')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe a equipe adversária.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida.';
      }
      if (formData.resultado === 'Empate') {
        const cobrancas = Array.isArray(dados.desempateSeteMetrosLista) ? dados.desempateSeteMetrosLista : [];
        if (cobrancas.length === 0 || cobrancas.some(c => !c.atletaId)) {
          return 'Em caso de empate no handebol, é obrigatório registrar os atletas que realizaram as cobranças de 7 metros.';
        }
      }
      return null;
    }

    // 6. XADREZ
    if (mod.includes('xadrez')) {
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe o adversário da partida de xadrez.';
      }
      if (!formData.resultado) {
        return 'Selecione o resultado da partida.';
      }
      return null;
    }

    return null;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    try {
      const url = isEditing ? apiUrl(`/api/analysis/${editId}`) : apiUrl('/api/analysis');
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        addNotification(
          isEditing ? 'Análise Esportiva Atualizada' : 'Análise Esportiva Criada',
          `Análise de ${formData.modalidade} (${formData.categoria}) salva com sucesso.`
        );
        navigate(getBackUrl());
      } else {
        setFormError(data.message || 'Erro ao salvar análise esportiva.');
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setFormError('Erro de conexão ao salvar a análise.');
    } finally {
      setSaving(false);
    }
  };

  const renderSportForm = () => {
    const mod = (formData.modalidade || '').toLowerCase();
    const commonProps = {
      formData,
      setFormData,
      onChange: handleInputChange,
      onUpdateDados: handleUpdateDadosEspecificos,
      students: filteredStudents
    };

    if (mod.includes('futebol') || mod.includes('futsal')) {
      return <FutebolFutsalForm {...commonProps} />;
    }
    if (mod.includes('basquete')) {
      return <BasqueteForm {...commonProps} />;
    }
    if (mod.includes('handebol')) {
      return <HandebolForm {...commonProps} />;
    }
    if (mod.includes('volei') || mod.includes('vôlei')) {
      return <VoleiForm {...commonProps} />;
    }
    if (mod.includes('badminton') || mod.includes('tênis de mesa') || mod.includes('tenis de mesa')) {
      return <BadmintonTenisMesaForm {...commonProps} />;
    }
    if (mod.includes('xadrez')) {
      return <XadrezForm {...commonProps} />;
    }
    if (mod.includes('atletismo')) {
      return <AtletismoForm {...commonProps} />;
    }

    return (
      <div className="alert alert-info" style={{ borderRadius: 'var(--radius-md)' }}>
        Formulário padrão carregado para {formData.modalidade}. Preencha as informações e observações abaixo.
      </div>
    );
  };

  const normMod = (formData.modalidade || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const isAtletismo = normMod.includes('atletismo');
  const isEquipe = normMod.includes('futebol') || normMod.includes('futsal') || normMod.includes('basquete') || normMod.includes('handebol') || normMod.includes('volei') || normMod.includes('voleibol');
  const isIndividualSport = !isEquipe && !isAtletismo;

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary)' }}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto', paddingBottom: '60px' }}>
        
        {/* Breadcrumb Contextual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '16px' }} className="d-none-print">
          <Link to="/esportes" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            Esportes
          </Link>
          <span>/</span>
          <Link to={getBackUrl()} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
            {paramModalidadeRaw} ({formData.categoria})
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {isEditing ? 'Editar Análise' : 'Nova Análise'}
          </span>
        </div>

        {/* Header da Tela */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              type="button" 
              className="btn btn-secondary rounded-circle" 
              style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
              onClick={() => navigate(getBackUrl())}
              title="Voltar para a modalidade"
            >
              <ArrowLeft size={18} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <SportIcon sport={formData.modalidade} size={22} />
              </div>
              <div>
                <h1 style={{ fontWeight: 700, color: 'var(--text)', margin: 0, fontSize: '1.375rem' }}>
                  {isEditing ? `Editar Análise — ${formData.modalidade}` : `Nova Análise — ${formData.modalidade}`}
                </h1>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
                  Preencha as informações técnicas e o resultado oficial para {formData.modalidade} ({formData.categoria}).
                </p>
              </div>
            </div>
          </div>
        </div>

        {formError && (
          <div style={{
            background: 'var(--error-light)',
            color: 'var(--error-text)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <AlertCircle size={18} />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Contexto e Informações Gerais */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} style={{ color: 'var(--primary)' }} />
              1. Informações Gerais do Registro
            </h5>

            <div className="row g-3">
              {isIndividualSport && (
                <div className="col-12 col-md-4">
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Atleta / Jogador Avaliado
                  </label>
                  <select
                    className="form-select"
                    value={formData.aluno || ''}
                    onChange={(e) => handleInputChange('aluno', e.target.value)}
                    style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  >
                    <option value="">Selecione o atleta (opcional)</option>
                    {filteredStudents.map(st => (
                      <option key={st._id} value={st._id}>
                        {st.nome} {st.turma ? `(${st.turma})` : ''} {st.matricula ? `· ${st.matricula}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={isIndividualSport ? "col-12 col-md-4" : "col-12 col-md-6"}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Categoria / Gênero
                </label>
                <select
                  className="form-select"
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600 }}
                  required
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Geral">Geral / Misto</option>
                </select>
              </div>

              <div className={isIndividualSport ? "col-12 col-md-4" : "col-12 col-md-6"}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                  {isAtletismo ? 'Data da Prova' : 'Data da Partida'} <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.data}
                  onChange={(e) => handleInputChange('data', e.target.value)}
                  style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Dados Técnicos e Estatísticos Específicos do Esporte */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} />
              2. Dados Técnicos e Estatísticas de {formData.modalidade}
            </h5>

            {renderSportForm()}
          </div>

          {/* Card 3: Observações do Treinador */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '14px', fontSize: '1rem' }}>
              Observações do treinador
            </h5>

            <textarea
              className="form-control"
              rows={4}
              placeholder="Digite aqui as observações..."
              value={formData.observacoes || ''}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              style={{ borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}
            />
          </div>

          {/* Footer de Ações */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-light)'
          }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
              style={{ padding: '10px 32px', fontWeight: 700, borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={18} />
              {saving ? 'Salvando...' : isEditing ? 'Atualizar Análise' : 'Salvar Análise'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NovaAnalise;
