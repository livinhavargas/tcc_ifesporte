import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import ModalidadesSelector from '../../components/ModalidadesSelector';
import ModalidadePosicaoSelector from '../../components/ModalidadePosicaoSelector';
import SportIcon from '../../components/SportIcon';
import { getStudentPositionForSport } from '../../utils/sportPositions';
import { calculateIMC } from '../../components/IMCCard';
import PhysicalAssessmentTab from '../../components/PhysicalAssessmentTab';
import { apiUrl } from '../../services/api';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userType = localStorage.getItem('tipo'); 
  
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [activeTab, setActiveTab] = useState('perfil'); // perfil, aptidao

  const turmasDisponiveis = ['1A', '1B', '1H', '2A', '2B', '2H', '3A', '3B', '3C', '3H'];

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const response = await fetch(apiUrl(`/api/students/${id}`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cpf') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }

    if (name === 'rg') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
      if (value.length > 9) value = value.slice(0, 9);
      if (value.length > 8) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1})$/, '$1.$2.$3-$4');
      } else if (value.length > 5) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{3})([a-zA-Z0-9]{1,3})$/, '$1.$2.$3');
      } else if (value.length > 2) {
        value = value.replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9]{1,3})$/, '$1.$2');
      }
    }
    
    if (name === 'telefone' || name === 'telefoneResponsavel') {
      value = value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem('');
    try {
      const payload = { ...student, esportes: student.modalidades };

      const response = await fetch(apiUrl(`/api/students/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setMensagem('✅ Perfil atualizado com sucesso!');
        setIsEditing(false);
        fetchStudent();
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao atualizar aluno.');
      }
    } catch (error) {
      setMensagem('Erro de conexão ao servidor.');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Foto = reader.result;
      try {
        const response = await fetch(apiUrl(`/api/students/${id}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ...student, foto: base64Foto })
        });
        if (response.ok) {
          const updated = await response.json();
          setStudent(prev => ({ ...prev, foto: updated.foto || base64Foto }));
          setMensagem('✅ Foto do atleta atualizada com sucesso!');
          setTimeout(() => setMensagem(''), 3000);
        } else {
          setMensagem('Erro ao salvar foto do atleta.');
        }
      } catch (err) {
        setMensagem('Erro de conexão ao salvar foto.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoDelete = async () => {
    if (!window.confirm('Deseja realmente remover a foto do atleta?')) return;
    try {
      const response = await fetch(apiUrl(`/api/students/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...student, foto: '' })
      });
      if (response.ok) {
        setStudent(prev => ({ ...prev, foto: '' }));
        setMensagem('✅ Foto removida com sucesso!');
        setTimeout(() => setMensagem(''), 3000);
      } else {
        setMensagem('Erro ao remover foto.');
      }
    } catch (err) {
      setMensagem('Erro de conexão ao remover foto.');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDelete = async () => {
    if (!window.confirm(`Tem certeza que deseja excluir o atleta ${student.nome}?`)) return;
    try {
      const response = await fetch(apiUrl(`/api/students/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) window.location.href = '/alunos';
      else alert('Erro ao excluir aluno');
    } catch (error) {
      alert('Erro de conexão ao excluir');
    }
  };

  const handleExportPDF = () => {
    if (!student) return;
    const imc = calculateIMC(student.peso, student.altura);
    const studentSports = student.modalidades || student.esportes || [];
    const formattedSports = studentSports.map(m => {
      const pos = getStudentPositionForSport(student, m);
      const hasValidPos = pos && pos !== 'Indefinido' && pos !== 'Não sei' && pos.trim() !== '';
      return hasValidPos ? `${m} · ${pos}` : m;
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Ficha do Atleta - ${student.nome || 'Atleta'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 16mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
          }
          body {
            background: #ffffff;
            font-size: 11px;
            line-height: 1.45;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 12px;
            margin-bottom: 14px;
          }
          .brand-title {
            font-size: 22px;
            font-weight: 900;
            color: #0284c7;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 13px;
            font-weight: 700;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .photo-box {
            width: 76px;
            height: 76px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          .photo-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .photo-placeholder {
            font-size: 28px;
            font-weight: 800;
            color: #94a3b8;
          }
          .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #0369a1;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            margin-bottom: 6px;
          }
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px 12px;
          }
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px 12px;
          }
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6px 12px;
          }
          .field {
            display: flex;
            flex-direction: column;
          }
          .field-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            margin-bottom: 2px;
          }
          .field-value {
            font-size: 11.5px;
            font-weight: 600;
            color: #0f172a;
            padding: 4px 8px;
            background: #f8fafc;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            min-height: 24px;
            display: flex;
            align-items: center;
          }
          .chips-container {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }
          .chip {
            padding: 4px 10px;
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            color: #0369a1;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 11px;
          }
          .footer {
            margin-top: 18px;
            border-top: 1px solid #e2e8f0;
            padding-top: 6px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand-title">IFEsporte</div>
            <div class="brand-subtitle">Ficha Cadastral do Atleta</div>
          </div>
          <div class="photo-box">
            ${student.foto ? `<img src="${student.foto}" alt="Foto" />` : `<div class="photo-placeholder">${(student.nome || 'A').charAt(0).toUpperCase()}</div>`}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados Pessoais e Escolares</div>
          <div class="grid-3">
            <div class="field">
              <span class="field-label">Nome Completo</span>
              <div class="field-value">${student.nome || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Turma</span>
              <div class="field-value">${student.turma || student.serie || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Matrícula</span>
              <div class="field-value">${student.matricula || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">CPF</span>
              <div class="field-value">${student.cpf || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">E-mail</span>
              <div class="field-value">${student.email || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Telefone</span>
              <div class="field-value">${student.telefone || '-'}</div>
            </div>
          </div>
          <div class="grid-4" style="margin-top: 6px;">
            <div class="field">
              <span class="field-label">Data de Nascimento</span>
              <div class="field-value">${student.dataNascimento ? new Date(student.dataNascimento).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Idade</span>
              <div class="field-value">${calculateAge(student.dataNascimento)} anos</div>
            </div>
            <div class="field">
              <span class="field-label">Gênero</span>
              <div class="field-value">${student.sexo || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">RG</span>
              <div class="field-value">${student.rg || '-'}</div>
            </div>
          </div>
          <div class="grid-3" style="margin-top: 6px;">
            <div class="field" style="grid-column: span 2;">
              <span class="field-label">Logradouro</span>
              <div class="field-value">${student.endereco || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Cidade / UF</span>
              <div class="field-value">${[student.cidade, student.estado].filter(Boolean).join(' / ') || '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Dados Físicos</div>
          <div class="grid-3">
            <div class="field">
              <span class="field-label">Altura</span>
              <div class="field-value">${student.altura ? `${student.altura} m` : '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Peso</span>
              <div class="field-value">${student.peso ? `${student.peso} kg` : '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">IMC</span>
              <div class="field-value">${imc ? `${imc.formatted} (${imc.classification})` : '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Modalidades</div>
          <div class="chips-container">
            ${formattedSports.length > 0 ? formattedSports.map(s => `<span class="chip">${s}</span>`).join('') : '<span style="color: #64748b; font-style: italic;">Nenhuma modalidade vinculada.</span>'}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Vestuário e Uniforme</div>
          <div class="grid-4">
            <div class="field">
              <span class="field-label">Nº Camiseta</span>
              <div class="field-value">${student.numeroCamisa || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Nº Calçado</span>
              <div class="field-value">${student.numeroCalcado || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Tam. Camisa</span>
              <div class="field-value">${student.tamanhoCamisa || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Tam. Calção</span>
              <div class="field-value">${student.tamanhoCalcao || '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Contato de Emergência / Responsável</div>
          <div class="grid-2">
            <div class="field">
              <span class="field-label">Nome do Responsável</span>
              <div class="field-value">${student.nomeResponsavel || '-'}</div>
            </div>
            <div class="field">
              <span class="field-label">Telefone do Responsável</span>
              <div class="field-value">${student.telefoneResponsavel || '-'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Histórico Médico e Restrições</div>
          <div class="grid-2">
            <div class="field">
              <span class="field-label">Alergias</span>
              <div class="field-value">${student.alergias || 'Nenhuma declarada'}</div>
            </div>
            <div class="field">
              <span class="field-label">Lesões Anteriores</span>
              <div class="field-value">${student.lesoesAnteriores || 'Nenhuma declarada'}</div>
            </div>
            <div class="field" style="grid-column: span 2; margin-top: 6px;">
              <span class="field-label">Observações Médicas / Restrições</span>
              <div class="field-value">${student.observacoesMedicas || 'Nenhuma observação ou restrição.'}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <span>IFEsporte — Sistema de Gestão Esportiva</span>
          <span>Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) return <Layout><div className="text-center py-5"><div className="spinner-border text-primary"></div></div></Layout>;
  if (!student) return <Layout><div className="text-center py-5">Aluno não encontrado.</div></Layout>;

  const fieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font)',
    outline: 'none',
    transition: 'all var(--transition-fast)',
    background: 'var(--bg)',
    color: 'var(--text)',
    minHeight: '44px'
  };

  const readOnlyFieldStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--bg)',
    border: '1px solid var(--border-light)',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'var(--text)',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center'
  };

  const imcData = calculateIMC(student?.peso, student?.altura);
  const studentSports = student?.modalidades || student?.esportes || [];

  return (
    <Layout>
      <div style={{ width: '100%', maxWidth: 'var(--content-max-width)', margin: '0 auto', paddingBottom: '36px' }}>
        {/* Top Header com Botão Voltar Funcional */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }} className="d-none-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.875rem'
              }} 
              onClick={() => navigate('/alunos')}
              title="Voltar para Alunos"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>
            <h2 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.375rem', letterSpacing: '-0.3px' }}>
              Informações do Atleta
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {activeTab === 'perfil' && (
              <button className="btn btn-outline-secondary" onClick={handleExportPDF} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <i className="bi bi-printer-fill"></i>
                <span>Exportar Ficha (PDF)</span>
              </button>
            )}
            {userType !== 'estudante' && (
              <button className="btn btn-outline-danger" onClick={handleDelete}>
                Excluir Atleta
              </button>
            )}
          </div>
        </div>

        {mensagem && (
          <div style={{
            background: mensagem.includes('✅') ? 'var(--success-light)' : 'var(--error-light)',
            color: mensagem.includes('✅') ? 'var(--success-text)' : 'var(--error-text)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <i className={`bi ${mensagem.includes('✅') ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'}`}></i>{mensagem}
          </div>
        )}

        {/* ── Bloco Compacto de Identificação Visual (Somente Foto + Ações) ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          textAlign: 'center'
        }} className="d-none-print">
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.75rem',
            fontWeight: 800,
            overflow: 'hidden',
            border: '4px solid var(--bg-card)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '10px'
          }}>
            {student.foto ? (
              <img src={student.foto} alt={`Foto de ${student.nome || 'Atleta'}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              student.nome ? student.nome.charAt(0).toUpperCase() : 'A'
            )}
          </div>

          {/* Ações de Foto (Adicionar / Alterar / Excluir) */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input 
              type="file" 
              id="atletaFotoInput" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handlePhotoUpload} 
            />
            
            {!student.foto ? (
              <label htmlFor="atletaFotoInput" className="btn btn-secondary btn-sm" style={{ padding: '6px 14px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                <i className="bi bi-camera-fill"></i> Adicionar Foto
              </label>
            ) : (
              <>
                <label htmlFor="atletaFotoInput" className="btn btn-secondary btn-sm" style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', margin: 0, borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                  <i className="bi bi-pencil-fill"></i> Alterar Foto
                </label>
                <button 
                  type="button" 
                  onClick={handlePhotoDelete} 
                  className="btn btn-outline-danger btn-sm" 
                  style={{ padding: '5px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
                >
                  <i className="bi bi-trash-fill"></i> Excluir Foto
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Card Principal em Largura Total ── */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          width: '100%'
        }}>
          {/* Tabs Navigation */}
          <div style={{
            background: 'var(--bg)',
            padding: '16px 24px 0',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            gap: '8px'
          }} className="d-none-print">
            <button 
              onClick={() => setActiveTab('perfil')}
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: activeTab === 'perfil' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: activeTab === 'perfil' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'perfil' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-person-lines-fill"></i> Ficha do Atleta
            </button>
            <button 
              onClick={() => setActiveTab('aptidao')}
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                border: 'none',
                borderBottom: activeTab === 'aptidao' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
                background: activeTab === 'aptidao' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'aptidao' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <i className="bi bi-activity"></i> Aptidão Física
            </button>
          </div>

          <div style={{ padding: 'clamp(20px, 4vw, 36px)' }}>
            
            {/* TAB 1: PERFIL / FICHA COMPLETA */}
            {activeTab === 'perfil' && (
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                   <div>
                     <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem' }}>Ficha Completa do Atleta</h5>
                     <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '2px 0 0' }}>Dados cadastrais, acadêmicos, físicos, esportivos e médicos.</p>
                   </div>
                   {userType !== 'estudante' && !isEditing && (
                     <button type="button" className="btn btn-outline-primary" onClick={() => setIsEditing(true)} style={{ padding: '8px 20px', fontSize: '0.8125rem', fontWeight: 600, borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                       <i className="bi bi-pencil-fill"></i> Editar Dados
                     </button>
                   )}
                </div>

                <div className="row g-3">
                  {/* Section 1: Dados Escolares e Pessoais */}
                  <div className="col-12">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Dados Pessoais
                      </h6>
                    </div>
                  </div>
                  
                  {/* Linha 1: Nome, Turma, Matrícula */}
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Nome Completo {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="nome" value={student.nome || ''} onChange={handleInputChange} style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.nome || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Turma</label>
                    {isEditing ? (
                      <select className="form-select" name="turma" value={student.turma || student.serie || ''} onChange={handleInputChange} style={fieldStyle}>
                        <option value="">Selecione...</option>
                        {turmasDisponiveis.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.turma || student.serie || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Matrícula {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="matricula" value={student.matricula || ''} onChange={handleInputChange} style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.matricula || '-'}</div>
                    )}
                  </div>

                  {/* Linha 2: CPF, E-mail, Telefone */}
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">CPF {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="cpf" value={student.cpf || ''} onChange={handleInputChange} placeholder="000.000.000-00" style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.cpf || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">E-mail</label>
                    {isEditing ? (
                      <input type="email" name="email" value={student.email || ''} onChange={handleInputChange} placeholder="email@exemplo.com" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.email || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Telefone {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="telefone" value={student.telefone || ''} onChange={handleInputChange} placeholder="(00) 00000-0000" style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.telefone || '-'}</div>
                    )}
                  </div>

                  {/* Linha 3: Data de Nasc, Idade, Gênero, RG */}
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Data de Nasc. {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="date" name="dataNascimento" value={student.dataNascimento ? student.dataNascimento.split('T')[0] : ''} onChange={handleInputChange} style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.dataNascimento ? new Date(student.dataNascimento).toLocaleDateString('pt-BR') : '-'}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Idade</label>
                    <div style={readOnlyFieldStyle}>{`${calculateAge(student.dataNascimento) ?? '-'} anos`}</div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Gênero {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <select className="form-select" name="sexo" value={student.sexo || ''} onChange={handleInputChange} style={fieldStyle} required>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.sexo || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">RG</label>
                    {isEditing ? (
                      <input type="text" name="rg" value={student.rg || ''} onChange={handleInputChange} placeholder="00.000.000-0" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.rg || '-'}</div>
                    )}
                  </div>

                  {/* Linha 4: Endereço, Cidade, Estado */}
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Logradouro</label>
                    {isEditing ? (
                      <input type="text" name="endereco" value={student.endereco || ''} onChange={handleInputChange} placeholder="Rua, Bairro, Nº" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.endereco || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Cidade {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="cidade" value={student.cidade || ''} onChange={handleInputChange} placeholder="Cidade" style={fieldStyle} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.cidade || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-2">
                    <label className="form-label text-muted small fw-bold mb-1">Estado {isEditing && <span style={{ color: 'var(--error, #ef4444)' }}>*</span>}</label>
                    {isEditing ? (
                      <input type="text" name="estado" value={student.estado || ''} onChange={handleInputChange} placeholder="UF" maxLength="2" style={{ ...fieldStyle, textTransform: 'uppercase' }} required />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.estado || '-'}</div>
                    )}
                  </div>

                  {/* Section 2: Dados Físicos / Antropometria */}
                  <div className="col-12 mt-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Dados Físicos
                      </h6>
                    </div>
                  </div>

                  {/* Altura, Peso, IMC no mesmo tamanho e alinhamento */}
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Altura (m)</label>
                    {isEditing ? (
                      <input type="number" step="0.01" name="altura" value={student.altura || ''} onChange={handleInputChange} placeholder="Ex: 1.75" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.altura ? `${student.altura} m` : '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">Peso (kg)</label>
                    {isEditing ? (
                      <input type="number" step="0.1" name="peso" value={student.peso || ''} onChange={handleInputChange} placeholder="Ex: 65.5" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.peso ? `${student.peso} kg` : '-'}</div>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label text-muted small fw-bold mb-1">IMC</label>
                    <div style={{
                      ...readOnlyFieldStyle,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      {imcData ? (
                        <>
                          <span style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text)' }}>
                            {imcData.formatted}
                          </span>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 10px',
                            borderRadius: '9999px',
                            background: imcData.badgeBg,
                            color: imcData.color,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1px solid ${imcData.color}40`
                          }}>
                            <span>{imcData.dotSymbol}</span>
                            <span>{imcData.classification}</span>
                          </span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
                          Informe peso e altura
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Section 3: Modalidades */}
                  <div className="col-12 mt-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--primary)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Modalidades
                      </h6>
                    </div>

                    {isEditing ? (
                      <div>
                        <ModalidadesSelector 
                          selected={student.modalidades || student.esportes || []}
                          onChange={(novos) => setStudent(prev => ({ ...prev, modalidades: novos }))}
                          gender={student.sexo}
                        />
                        <ModalidadePosicaoSelector
                          selectedModalidades={student.modalidades || student.esportes || []}
                          posicoesPorModalidade={student.posicoesPorModalidade || []}
                          onChange={(novasPos) => setStudent(prev => ({ ...prev, posicoesPorModalidade: novasPos }))}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {studentSports.length > 0 ? (
                          studentSports.map((m, idx) => {
                            const pos = getStudentPositionForSport(student, m);
                            const hasValidPos = pos && pos !== 'Indefinido' && pos !== 'Não sei' && pos.trim() !== '';
                            return (
                              <div key={idx} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--bg)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '9999px',
                                padding: '8px 16px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--text)',
                                boxShadow: 'var(--shadow-xs)'
                              }}>
                                <SportIcon sport={m} size={16} />
                                <span>{m}{hasValidPos ? ` · ${pos}` : ''}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                            Nenhuma modalidade vinculada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 4: Vestuário e Uniforme */}
                  <div className="col-12 mt-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--accent)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Vestuário e Uniforme
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Nº Camiseta</label>
                    {isEditing ? (
                      <input type="number" name="numeroCamisa" value={student.numeroCamisa || ''} onChange={handleInputChange} placeholder="Ex: 10" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.numeroCamisa || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Nº Calçado</label>
                    {isEditing ? (
                      <input type="number" name="numeroCalcado" value={student.numeroCalcado || ''} onChange={handleInputChange} placeholder="Ex: 40" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.numeroCalcado || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Tamanho Camisa</label>
                    {isEditing ? (
                      <select className="form-select" name="tamanhoCamisa" value={student.tamanhoCamisa || ''} onChange={handleInputChange} style={fieldStyle}>
                        <option value="">Selecione...</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                      </select>
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.tamanhoCamisa || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label text-muted small fw-bold mb-1">Tamanho Calção</label>
                    {isEditing ? (
                      <select className="form-select" name="tamanhoCalcao" value={student.tamanhoCalcao || ''} onChange={handleInputChange} style={fieldStyle}>
                        <option value="">Selecione...</option>
                        <option value="P">P</option>
                        <option value="M">M</option>
                        <option value="G">G</option>
                        <option value="GG">GG</option>
                      </select>
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.tamanhoCalcao || '-'}</div>
                    )}
                  </div>

                  {/* Section 5: Contato de Emergência / Responsável */}
                  <div className="col-12 mt-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--accent)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Contato de Emergência / Responsável
                      </h6>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Nome do Responsável</label>
                    {isEditing ? (
                      <input type="text" name="nomeResponsavel" value={student.nomeResponsavel || ''} onChange={handleInputChange} placeholder="Nome do responsável" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.nomeResponsavel || '-'}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Telefone do Responsável (Emergência)</label>
                    {isEditing ? (
                      <input type="text" name="telefoneResponsavel" value={student.telefoneResponsavel || ''} onChange={handleInputChange} placeholder="(00) 00000-0000" style={fieldStyle} />
                    ) : (
                      <div style={readOnlyFieldStyle}>{student.telefoneResponsavel || '-'}</div>
                    )}
                  </div>

                  {/* Section 6: Histórico Médico */}
                  <div className="col-12 mt-4">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: 'var(--error)' }}></div>
                      <h6 style={{ fontWeight: 800, color: 'var(--error)', margin: 0, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Histórico Médico e Restrições
                      </h6>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Alergias</label>
                    {isEditing ? (
                      <textarea name="alergias" rows="2" value={student.alergias || ''} onChange={handleInputChange} placeholder="Nenhuma declarada..." style={fieldStyle}></textarea>
                    ) : (
                      <div style={{ ...readOnlyFieldStyle, minHeight: '44px', whiteSpace: 'pre-wrap', alignItems: 'flex-start' }}>{student.alergias || 'Nenhuma declarada'}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label text-muted small fw-bold mb-1">Lesões Anteriores</label>
                    {isEditing ? (
                      <textarea name="lesoesAnteriores" rows="2" value={student.lesoesAnteriores || ''} onChange={handleInputChange} placeholder="Nenhuma declarada..." style={fieldStyle}></textarea>
                    ) : (
                      <div style={{ ...readOnlyFieldStyle, minHeight: '44px', whiteSpace: 'pre-wrap', alignItems: 'flex-start' }}>{student.lesoesAnteriores || 'Nenhuma declarada'}</div>
                    )}
                  </div>
                  <div className="col-md-12">
                    <label className="form-label text-muted small fw-bold mb-1">Observações Médicas / Restrições</label>
                    {isEditing ? (
                      <textarea name="observacoesMedicas" rows="2" value={student.observacoesMedicas || ''} onChange={handleInputChange} placeholder="Nenhuma observação ou restrição..." style={fieldStyle}></textarea>
                    ) : (
                      <div style={{ ...readOnlyFieldStyle, minHeight: '44px', whiteSpace: 'pre-wrap', alignItems: 'flex-start' }}>{student.observacoesMedicas || 'Nenhuma observação ou restrição registrada.'}</div>
                    )}
                  </div>

                  {isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); fetchStudent(); }}>Cancelar</button>
                      <button type="submit" className="btn btn-primary">Salvar Alterações</button>
                    </div>
                  )}
                </div>
              </form>
            )}

            {/* TAB: APTIDÃO FÍSICA (PROESP-BR 2021) */}
            {activeTab === 'aptidao' && (
              <PhysicalAssessmentTab student={student} userType={userType} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentProfile;
