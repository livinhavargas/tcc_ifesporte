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
import BadmintonForm from './components/BadmintonForm';
import TenisMesaForm from './components/TenisMesaForm';
import XadrezForm from './components/XadrezForm';
import AtletismoForm, { isPrimeiroLugar } from './components/AtletismoForm';

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

  let initialGenero = paramGenero;
  const normSubInit = (parsedSubtipo || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]/g, "");
  if (normSubInit.includes('100m') && normSubInit.includes('barreiras') && !normSubInit.includes('400m')) {
    initialGenero = 'Feminino';
  } else if (normSubInit.includes('110m') && normSubInit.includes('barreiras')) {
    initialGenero = 'Masculino';
  } else if (parsedModalidade.toLowerCase().includes('atletismo')) {
    initialGenero = (paramGenero || '').toLowerCase().startsWith('masc') ? 'Masculino' : 'Feminino';
  }

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    modalidade: parsedModalidade,
    categoria: initialGenero,
    subtipoProva: parsedSubtipo,
    data: new Date().toISOString().split('T')[0],
    equipeAdversaria: '',
    resultado: parsedModalidade.toLowerCase().includes('atletismo') ? null : 'Vitória',
    placar: '',
    aluno: '',
    atletas: [],
    dadosEspecificos: {},
    observacoes: ''
  });

  // Efeito estrito de gênero para provas de barreiras de Atletismo
  useEffect(() => {
    const normSub = (formData.subtipoProva || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s_-]/g, "");
    if (normSub.includes('100m') && normSub.includes('barreiras') && !normSub.includes('400m')) {
      if (formData.categoria !== 'Feminino') {
        setFormData(prev => ({ ...prev, categoria: 'Feminino' }));
      }
    } else if (normSub.includes('110m') && normSub.includes('barreiras')) {
      if (formData.categoria !== 'Masculino') {
        setFormData(prev => ({ ...prev, categoria: 'Masculino' }));
      }
    }
  }, [formData.subtipoProva]);

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
          const isModAtletismo = (analysisData.modalidade || parsedModalidade || '').toLowerCase().includes('atletismo');
          const existingCat = analysisData.categoria || analysisData.dadosEspecificos?.genero || paramGenero;
          const normalizedCat = isModAtletismo
            ? ((existingCat || '').toLowerCase().startsWith('masc') ? 'Masculino' : 'Feminino')
            : ((existingCat || '').toLowerCase().startsWith('fem')
                ? 'Feminino'
                : (existingCat || '').toLowerCase().startsWith('masc')
                ? 'Masculino'
                : (existingCat || '').toLowerCase().startsWith('mist')
                ? 'Misto'
                : 'Geral');

          setFormData({
            modalidade: analysisData.modalidade || parsedModalidade,
            categoria: normalizedCat,
            subtipoProva: analysisData.subtipoProva || parsedSubtipo,
            data: analysisData.data ? analysisData.data.split('T')[0] : new Date().toISOString().split('T')[0],
            equipeAdversaria: analysisData.equipeAdversaria || '',
            resultado: analysisData.resultado || (isModAtletismo ? null : 'Vitória'),
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
    if (formData.categoria && formData.categoria !== 'Geral' && formData.categoria !== 'Misto' && student.sexo) {
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
        const colocacaoVal = dados.colocacao || dados.classificacaoFinalPontos;
        if (!colocacaoVal || !String(colocacaoVal).trim()) {
          return subtipo.includes('pentatlo')
            ? 'Informe a classificação final (contagem de pontos).'
            : 'Informe a colocação do atleta.';
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

    // 2.1 TÊNIS DE MESA
    if (mod.includes('tenis de mesa') || mod.includes('tênis de mesa')) {
      const isDupla = dados.formatoPartida === 'Dupla' || dados.formatoPartida === 'Em Dupla';
      if (!dados.genero && !formData.categoria) {
        return 'Selecione o gênero (Misto, Feminino ou Masculino).';
      }
      if (isDupla) {
        if (!dados.nomeDupla || !String(dados.nomeDupla).trim()) {
          return 'Informe ou selecione o nome da dupla.';
        }
      } else {
        if (!dados.nomeAtleta && !formData.aluno) {
          return 'Informe ou selecione o nome do atleta.';
        }
      }
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return isDupla ? 'Informe a dupla adversária.' : 'Informe o atleta adversário.';
      }
      if (!formData.resultado || !['Vitória', 'Derrota'].includes(formData.resultado)) {
        return 'Selecione o resultado da partida (Vitória ou Derrota).';
      }
      let setsNos = 0;
      let setsAdv = 0;
      for (let s = 1; s <= 5; s++) {
        const p = dados[`placarSet${s}`];
        if (p && typeof p === 'object') {
          const pNos = parseInt(p.nos, 10) || 0;
          const pAdv = parseInt(p.adv, 10) || 0;
          if (pNos > 0 || pAdv > 0) {
            if (pNos > pAdv) setsNos++;
            else if (pAdv > pNos) setsAdv++;
          }
        }
      }
      if (setsNos > setsAdv && formData.resultado === 'Derrota') {
        return 'O resultado selecionado (Derrota) é contraditório com os sets vencidos pela sua equipe.';
      }
      if (setsAdv > setsNos && formData.resultado === 'Vitória') {
        return 'O resultado selecionado (Vitória) é contraditório com os sets vencidos pelo adversário.';
      }
      return null;
    }

    // 2.2 BADMINTON
    if (mod.includes('badminton')) {
      const isDupla = dados.formatoPartida === 'Em Dupla' || dados.formatoPartida === 'Dupla';
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return isDupla ? 'Informe a dupla adversária.' : 'Informe o atleta adversário.';
      }
      if (!formData.resultado || !['Vitória', 'Derrota'].includes(formData.resultado)) {
        return 'Selecione o resultado da partida (Vitória ou Derrota).';
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
      if (!dados.genero && !formData.categoria) {
        return 'Selecione o gênero da partida de xadrez (Feminino ou Masculino).';
      }
      if (!dados.nomeAtleta && !formData.aluno) {
        return 'Informe ou selecione o nome do atleta da nossa equipe.';
      }
      if (!formData.equipeAdversaria || !String(formData.equipeAdversaria).trim()) {
        return 'Informe o adversário da partida de xadrez.';
      }
      if (!dados.cor && !dados.corPecas) {
        return 'Selecione a cor com a qual o atleta está jogando (Brancas ou Pretas).';
      }
      if (!formData.resultado || !['Vitória', 'Empate', 'Derrota'].includes(formData.resultado)) {
        return 'Selecione o resultado da partida (Vitória, Empate ou Derrota).';
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

      const payload = { ...formData };
      const modLower = (payload.modalidade || '').toLowerCase();
      if (modLower.includes('atletismo')) {
        const dados = { ...(payload.dadosEspecificos || {}) };
        if (dados.classificacaoFinalPontos && !dados.colocacao) {
          dados.colocacao = dados.classificacaoFinalPontos;
        }
        const colocacao = dados.colocacao || dados.classificacaoFinalPontos;
        payload.resultado = isPrimeiroLugar(colocacao) ? 'Vitória' : null;
        payload.categoria = (payload.categoria === 'Masculino' || dados.genero === 'Masculino') ? 'Masculino' : 'Feminino';
        dados.genero = payload.categoria;
        payload.dadosEspecificos = dados;
        if (!payload.data) {
          payload.data = new Date().toISOString().split('T')[0];
        }
      } else if (modLower.includes('badminton')) {
        const dados = payload.dadosEspecificos || {};
        let setsNos = 0;
        let setsAdv = 0;
        for (let s = 1; s <= 3; s++) {
          const p = dados[`placarSet${s}`];
          if (p && typeof p === 'object') {
            const pNos = parseInt(p.nos, 10) || 0;
            const pAdv = parseInt(p.adv, 10) || 0;
            if (pNos > 0 || pAdv > 0) {
              if (pNos > pAdv) setsNos++;
              else if (pAdv > pNos) setsAdv++;
            }
          }
        }
        payload.placar = { nos: setsNos, adv: setsAdv };
        if (!payload.resultado) {
          if (setsNos > setsAdv) payload.resultado = 'Vitória';
          else if (setsAdv > setsNos) payload.resultado = 'Derrota';
        }
        if (!payload.data) {
          payload.data = new Date().toISOString().split('T')[0];
        }
        if (!payload.categoria) {
          payload.categoria = 'Geral';
        }
      } else if (modLower.includes('tenis de mesa')) {
        const dados = payload.dadosEspecificos || {};
        let setsNos = 0;
        let setsAdv = 0;
        for (let s = 1; s <= 5; s++) {
          const p = dados[`placarSet${s}`];
          if (p && typeof p === 'object') {
            const pNos = parseInt(p.nos, 10) || 0;
            const pAdv = parseInt(p.adv, 10) || 0;
            if (pNos > 0 || pAdv > 0) {
              if (pNos > pAdv) setsNos++;
              else if (pAdv > pNos) setsAdv++;
            }
          }
        }
        payload.placar = { nos: setsNos, adv: setsAdv };
        if (setsNos > setsAdv) {
          payload.resultado = 'Vitória';
        } else if (setsAdv > setsNos) {
          payload.resultado = 'Derrota';
        }
        if (!payload.data) {
          payload.data = new Date().toISOString().split('T')[0];
        }
        if (dados.genero) {
          payload.categoria = dados.genero;
        } else if (!payload.categoria) {
          payload.categoria = 'Geral';
        }
      } else if (modLower.includes('xadrez')) {
        const dados = payload.dadosEspecificos || {};
        payload.placar = null;
        if (!payload.data) {
          payload.data = new Date().toISOString().split('T')[0];
        }
        if (dados.genero) {
          payload.categoria = dados.genero;
        } else if (!payload.categoria) {
          payload.categoria = 'Geral';
        }
      } else {
        if (!payload.placar || payload.placar === '') {
          const dados = payload.dadosEspecificos || {};
          if (dados.placar1Tempo || dados.placar2Tempo) {
            payload.placar = {
              nos: (dados.placar1Tempo?.nos || 0) + (dados.placar2Tempo?.nos || 0),
              adv: (dados.placar1Tempo?.adv || 0) + (dados.placar2Tempo?.adv || 0)
            };
          } else {
            payload.placar = { nos: 0, adv: 0 };
          }
        }
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
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
    if (mod.includes('tenis de mesa') || mod.includes('tênis de mesa')) {
      return <TenisMesaForm {...commonProps} />;
    }
    if (mod.includes('badminton')) {
      return <BadmintonForm {...commonProps} />;
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
  const isBadminton = normMod.includes('badminton');
  const isTenisMesa = normMod.includes('tenis de mesa');
  const isXadrez = normMod.includes('xadrez');
  const isEquipe = normMod.includes('futebol') || normMod.includes('futsal') || normMod.includes('basquete') || normMod.includes('handebol') || normMod.includes('volei') || normMod.includes('voleibol');
  const isIndividualSport = !isEquipe && !isAtletismo && !isTenisMesa && !isXadrez && !isBadminton;

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
          
          {/* Se for Atletismo: Card Único da Análise */}
          {isAtletismo ? (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--primary)' }} />
                Análise — {formData.subtipoProva || 'Atletismo'}
              </h5>

              {renderSportForm()}
            </div>
          ) : isBadminton ? (
            /* Se for Badminton: Card Único com exclusivamente os 8 campos solicitados nesta ordem */
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: 'var(--primary)' }} />
                Análise — Badminton
              </h5>

              {renderSportForm()}
            </div>
          ) : isTenisMesa ? (
            /* Se for Tênis de Mesa: Card Único com exclusivamente os 5 campos solicitados */
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: 'var(--primary)' }} />
                Análise — Tênis de Mesa
              </h5>

              {renderSportForm()}
            </div>
          ) : isXadrez ? (
            /* Se for Xadrez: Card Único com exclusivamente os 3 campos solicitados */
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h5 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '18px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: 'var(--primary)' }} />
                Análise — Xadrez
              </h5>

              {renderSportForm()}
            </div>
          ) : (
            <>
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
                      Data da Partida <span style={{ color: 'var(--error, #ef4444)' }}>*</span>
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
            </>
          )}

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
