import React, { useState, useMemo } from 'react';
import { 
  CheckSquare, Square, Printer, X, 
  Layers, Calendar, Activity
} from 'lucide-react';
import { calculateAge } from '../utils/proespCalculator';

// Regras de direção para testes motores
export const TEST_DIRECTION_RULES = {
  corrida6MinTotal: { label: 'Corrida/Caminhada de 6 min', unit: 'm', higherIsBetter: true },
  sentarAlcançarMelhor: { label: 'Sentar e Alcançar', unit: 'cm', higherIsBetter: true },
  abdominais1Min: { label: 'Abdominais em 1 min', unit: 'reps', higherIsBetter: true },
  arremessoMedicineBallMelhor: { label: 'Arremesso Medicine Ball', unit: 'cm', higherIsBetter: true },
  saltoHorizontalMelhor: { label: 'Salto Horizontal', unit: 'cm', higherIsBetter: true },
  quadrado4x4Melhor: { label: 'Quadrado 4×4 metros', unit: 's', higherIsBetter: false },
  corrida20mMelhor: { label: 'Corrida de 20 metros', unit: 's', higherIsBetter: false },
  imc: { label: 'IMC (Índice de Massa Corporal)', unit: 'kg/m²', isHealth: true },
  rce: { label: 'Razão Cintura-Estatura (RCE)', unit: '', isHealth: true },
  massaCorporal: { label: 'Massa Corporal', unit: 'kg', isNeutral: true },
  estatura: { label: 'Estatura', unit: 'cm', isNeutral: true },
  envergadura: { label: 'Envergadura', unit: 'cm', isNeutral: true },
  perimetroCintura: { label: 'Perímetro da Cintura', unit: 'cm', isNeutral: true }
};

export const evaluateMetricEvolution = (metricKey, valA, valB) => {
  if (valA == null || valB == null || isNaN(Number(valA)) || isNaN(Number(valB))) {
    return { delta: null, percent: null, status: 'indefinido', label: '—' };
  }
  const numA = Number(valA);
  const numB = Number(valB);
  const delta = Number((numB - numA).toFixed(2));
  const percent = numA !== 0 ? Number(((delta / numA) * 100).toFixed(1)) : 0;
  
  const rule = TEST_DIRECTION_RULES[metricKey];
  
  if (Math.abs(delta) < 0.001) {
    return { delta: 0, percent: 0, status: 'igual', label: 'Sem alteração relevante', color: '#6b7280' };
  }

  if (rule?.isNeutral) {
    return {
      delta,
      percent,
      status: delta > 0 ? 'aumento' : 'reducao',
      label: delta > 0 ? `+${delta}` : `${delta}`,
      color: '#3b82f6'
    };
  }

  if (rule?.isHealth) {
    return {
      delta,
      percent,
      status: delta < 0 ? 'reducao' : 'aumento',
      label: delta > 0 ? `+${delta}` : `${delta}`,
      color: '#3b82f6'
    };
  }

  if (rule?.higherIsBetter) {
    const improved = delta > 0;
    return {
      delta,
      percent,
      status: improved ? 'melhorou' : 'piorou',
      label: improved ? 'Melhorou' : 'Piorou',
      color: improved ? '#10b981' : '#ef4444'
    };
  } else {
    // Menor é melhor (ex: corrida 20m e quadrado 4x4)
    const improved = delta < 0;
    return {
      delta,
      percent,
      status: improved ? 'melhorou' : 'piorou',
      label: improved ? 'Melhorou' : 'Piorou',
      color: improved ? '#10b981' : '#ef4444'
    };
  }
};

const PhysicalAssessmentPDFExport = ({ 
  isOpen, 
  onClose, 
  assessments = [], 
  student = {},
  selectedAssessmentId = null,
  initialCompareIds = []
}) => {
  // Configuração inicial de seleção
  const [selectedIds, setSelectedIds] = useState(() => {
    if (initialCompareIds && initialCompareIds.length > 0) return initialCompareIds;
    if (selectedAssessmentId) return [selectedAssessmentId];
    return assessments.length > 0 ? [assessments[0]._id] : [];
  });

  const [sections, setSections] = useState({
    dadosPratica: true,
    medidasCorporais: true,
    saudeIMC_RCE: true,
    corrida6Min: true,
    sentarAlcançar: true,
    abdominais: true,
    medicineBall: true,
    saltoHorizontal: true,
    quadrado4x4: true,
    corrida20m: true,
    tabelaComparativa: true,
    observacoes: true
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Ordenar avaliações cronologicamente
  const sortedAssessments = useMemo(() => {
    return [...assessments].sort((a, b) => new Date(a.dataAvaliacao) - new Date(b.dataAvaliacao));
  }, [assessments]);

  const selectedAssessmentsList = useMemo(() => {
    return sortedAssessments.filter(a => selectedIds.includes(a._id));
  }, [sortedAssessments, selectedIds]);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === assessments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assessments.map(a => a._id));
    }
  };

  const toggleAssessmentId = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSection = (key) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Gerar e Imprimir Documento Profissional Isolado
  const handlePrintPDF = () => {
    if (selectedAssessmentsList.length === 0) {
      alert('Selecione ao menos uma avaliação para exportar.');
      return;
    }

    setIsGenerating(true);

    // Criação de iframe isolado para impressão direta sem elementos da página
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow.document;
    doc.open();

    // Data de emissão
    const emissionDate = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const studentAge = student.dataNascimento 
      ? `${calculateAge(student.dataNascimento)} anos` 
      : (student.idade ? `${student.idade} anos` : 'Não informada');

    // Construção do HTML do Relatório
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Ficha de Aptidão Física PROESP-Br - ${student.nome || 'Aluno'}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #ffffff;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            line-height: 1.4;
          }
          .page-container {
            width: 100%;
          }
          .header-brand {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2.5px solid #1e5eff;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          .brand-title {
            font-size: 18pt;
            font-weight: 800;
            color: #1e5eff;
            letter-spacing: -0.5px;
            margin: 0;
          }
          .brand-subtitle {
            font-size: 9pt;
            color: #4b5563;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
          }
          .emission-meta {
            text-align: right;
            font-size: 8pt;
            color: #6b7280;
          }
          .student-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 8px;
            font-size: 9.5pt;
          }
          .student-card .meta-item strong {
            display: block;
            font-size: 7.5pt;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .student-card .meta-item span {
            font-weight: 700;
            color: #0f172a;
          }
          .section-title {
            font-size: 11pt;
            font-weight: 700;
            color: #1e293b;
            border-left: 4px solid #1e5eff;
            padding-left: 8px;
            margin: 18px 0 8px 0;
            text-transform: uppercase;
            letter-spacing: 0.4px;
          }
          .assessment-block {
            margin-bottom: 22px;
            page-break-inside: avoid;
          }
          .assessment-header {
            background: #1e5eff;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 4px 4px 0 0;
            font-size: 10.5pt;
            font-weight: 700;
            display: flex;
            justify-content: space-between;
          }
          table.proesp-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9.5pt;
            margin-bottom: 12px;
            border: 1px solid #cbd5e1;
          }
          table.proesp-table th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 6px 10px;
            border: 1px solid #cbd5e1;
            font-size: 8.5pt;
            text-transform: uppercase;
          }
          table.proesp-table td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
            color: #1e293b;
          }
          table.proesp-table tr:nth-child(even) td {
            background: #fafafa;
          }
          .badge-excelencia { background: #ede9fe; color: #6d28d9; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #c4b5fd; }
          .badge-muitobom { background: #d1fae5; color: #047857; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #a7f3d0; }
          .badge-bom { background: #dbeafe; color: #1d4ed8; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #bfdbfe; }
          .badge-razoavel { background: #fef3c7; color: #b45309; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #fde68a; }
          .badge-fraco { background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #fca5a5; }
          .badge-saudavel { background: #d1fae5; color: #065f46; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #a7f3d0; }
          .badge-risco { background: #fef3c7; color: #92400e; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; border: 1px solid #fde68a; }
          .badge-neutral { background: #f1f5f9; color: #475569; font-weight: 600; padding: 2px 6px; border-radius: 4px; font-size: 8pt; display: inline-block; }
          .badge-melhorou { background: #d1fae5; color: #047857; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; }
          .badge-piorou { background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 8pt; }
          
          .observations-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 8px 12px;
            font-size: 9pt;
            color: #334155;
            margin-top: 6px;
            margin-bottom: 12px;
          }
          .footer-print {
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            font-size: 8pt;
            color: #64748b;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="page-container">
          <!-- CABEÇALHO OFICIAL -->
          <div class="header-brand">
            <div>
              <h1 class="brand-title">IFesporte</h1>
              <div class="brand-subtitle">Ficha de Aptidão Física — Bateria PROESP-Br 2021</div>
            </div>
            <div class="emission-meta">
              <strong>Relatório Oficial de Avaliação</strong><br>
              Emitido em: ${emissionDate}
            </div>
          </div>

          <!-- IDENTIFICAÇÃO DO ALUNO -->
          <div class="student-card">
            <div class="meta-item">
              <strong>Aluno(a)</strong>
              <span>${student.nome || 'Não informado'}</span>
            </div>
            <div class="meta-item">
              <strong>Idade / Sexo</strong>
              <span>${studentAge} • ${student.sexo === 'M' ? 'Masculino' : student.sexo === 'F' ? 'Feminino' : student.sexo || 'N/D'}</span>
            </div>
            <div class="meta-item">
              <strong>Turma / Matrícula</strong>
              <span>${student.turma || student.matricula || '—'}</span>
            </div>
            <div class="meta-item">
              <strong>Modalidades do Aluno</strong>
              <span>${student.modalidades?.join(', ') || student.esportes?.join(', ') || 'Nenhuma'}</span>
            </div>
          </div>
    `;

    // FUNÇÃO AUXILIAR PARA RENDERIZAR CLASSIFICAÇÃO PROESP EM HTML
    const renderProespBadgeHtml = (classif) => {
      if (!classif || classif === 'Dados insuficientes' || classif === 'Sem dados') {
        return `<span class="badge-neutral">${classif || '—'}</span>`;
      }
      if (classif === 'Zona saudável') return `<span class="badge-saudavel">● Zona Saudável</span>`;
      if (classif === 'Zona de risco à saúde') return `<span class="badge-risco">▲ Risco à Saúde</span>`;
      if (classif === 'Excelência') return `<span class="badge-excelencia">★ Excelência</span>`;
      if (classif === 'Muito bom') return `<span class="badge-muitobom">▲ Muito Bom</span>`;
      if (classif === 'Bom') return `<span class="badge-bom">● Bom</span>`;
      if (classif === 'Razoável') return `<span class="badge-razoavel">■ Razoável</span>`;
      if (classif === 'Fraco') return `<span class="badge-fraco">▼ Fraco</span>`;
      return `<span class="badge-neutral">${classif}</span>`;
    };

    // SEÇÃO 1: TABELA COMPARATIVA SE HOUVER 2 OU MAIS AVALIAÇÕES SELECIONADAS E O USUÁRIO ATIVOU
    if (sections.tabelaComparativa && selectedAssessmentsList.length >= 2) {
      const first = selectedAssessmentsList[0];
      const last = selectedAssessmentsList[selectedAssessmentsList.length - 1];
      const dateFirst = new Date(first.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const dateLast = new Date(last.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

      htmlContent += `
        <div class="assessment-block">
          <div class="section-title">Quadro Comparativo de Evolução Longitudinal (${dateFirst} ➔ ${dateLast})</div>
          <table class="proesp-table">
            <thead>
              <tr>
                <th>Indicador / Teste Motor</th>
                <th>${dateFirst}</th>
                <th>${dateLast}</th>
                <th>Variação</th>
                <th>Desempenho / Evolução</th>
              </tr>
            </thead>
            <tbody>
      `;

      const comparisonMetrics = [
        { key: 'massaCorporal', label: 'Massa Corporal', val1: first.medidas?.massaCorporal, val2: last.medidas?.massaCorporal, unit: 'kg' },
        { key: 'estatura', label: 'Estatura', val1: first.medidas?.estatura, val2: last.medidas?.estatura, unit: 'cm' },
        { key: 'imc', label: 'IMC', val1: first.calculos?.imc, val2: last.calculos?.imc, unit: 'kg/m²', class1: first.classificacoes?.saude?.imc, class2: last.classificacoes?.saude?.imc },
        { key: 'rce', label: 'Razão Cintura-Estatura (RCE)', val1: first.calculos?.rce, val2: last.calculos?.rce, unit: '', class1: first.classificacoes?.saude?.rce, class2: last.classificacoes?.saude?.rce },
        { key: 'corrida6MinTotal', label: '1. Corrida 6 min (Cardiorresp.)', val1: first.testes?.corrida6Min?.totalMetros ?? first.calculos?.corrida6MinTotal, val2: last.testes?.corrida6Min?.totalMetros ?? last.calculos?.corrida6MinTotal, unit: 'm', class1: first.classificacoes?.desempenho?.corrida6Min, class2: last.classificacoes?.desempenho?.corrida6Min },
        { key: 'sentarAlcançarMelhor', label: '2. Sentar e Alcançar (Flexibilidade)', val1: first.testes?.sentarAlcançar?.melhorResultado ?? first.calculos?.sentarAlcançarMelhor, val2: last.testes?.sentarAlcançar?.melhorResultado ?? last.calculos?.sentarAlcançarMelhor, unit: 'cm', class1: first.classificacoes?.desempenho?.sentarAlcançar, class2: last.classificacoes?.desempenho?.sentarAlcançar },
        { key: 'abdominais1Min', label: '3. Abdominais 1 min (Resistência)', val1: first.testes?.abdominais1Min?.repeticoes, val2: last.testes?.abdominais1Min?.repeticoes, unit: 'reps', class1: first.classificacoes?.desempenho?.abdominais1Min, class2: last.classificacoes?.desempenho?.abdominais1Min },
        { key: 'arremessoMedicineBallMelhor', label: '4. Arremesso Medicine Ball (Força MMSS)', val1: first.testes?.arremessoMedicineBall?.melhorResultado ?? first.calculos?.arremessoMedicineBallMelhor, val2: last.testes?.arremessoMedicineBall?.melhorResultado ?? last.calculos?.arremessoMedicineBallMelhor, unit: 'cm', class1: first.classificacoes?.desempenho?.arremessoMedicineBall, class2: last.classificacoes?.desempenho?.arremessoMedicineBall },
        { key: 'saltoHorizontalMelhor', label: '5. Salto Horizontal (Força MMII)', val1: first.testes?.saltoHorizontal?.melhorResultado ?? first.calculos?.saltoHorizontalMelhor, val2: last.testes?.saltoHorizontal?.melhorResultado ?? last.calculos?.saltoHorizontalMelhor, unit: 'cm', class1: first.classificacoes?.desempenho?.saltoHorizontal, class2: last.classificacoes?.desempenho?.saltoHorizontal },
        { key: 'quadrado4x4Melhor', label: '6. Quadrado 4×4 m (Agilidade)', val1: first.testes?.quadrado4x4?.melhorResultado ?? first.calculos?.quadrado4x4Melhor, val2: last.testes?.quadrado4x4?.melhorResultado ?? last.calculos?.quadrado4x4Melhor, unit: 's', class1: first.classificacoes?.desempenho?.quadrado4x4, class2: last.classificacoes?.desempenho?.quadrado4x4 },
        { key: 'corrida20mMelhor', label: '7. Corrida 20 m (Velocidade)', val1: first.testes?.corrida20m?.melhorResultado ?? first.calculos?.corrida20mMelhor, val2: last.testes?.corrida20m?.melhorResultado ?? last.calculos?.corrida20mMelhor, unit: 's', class1: first.classificacoes?.desempenho?.corrida20m, class2: last.classificacoes?.desempenho?.corrida20m }
      ];

      comparisonMetrics.forEach(m => {
        const evo = evaluateMetricEvolution(m.key, m.val1, m.val2);
        const deltaFormatted = evo.delta != null ? (evo.delta > 0 ? `+${evo.delta}` : `${evo.delta}`) + (m.unit ? ` ${m.unit}` : '') : '—';
        let badgeHtml = '—';
        if (evo.status === 'melhorou') badgeHtml = '<span class="badge-melhorou">▲ Melhorou</span>';
        else if (evo.status === 'piorou') badgeHtml = '<span class="badge-piorou">▼ Piorou</span>';
        else if (evo.status === 'igual') badgeHtml = '<span class="badge-neutral">Sem alteração</span>';
        else if (evo.status === 'aumento' || evo.status === 'reducao') badgeHtml = `<span class="badge-neutral">${evo.label}</span>`;

        htmlContent += `
          <tr>
            <td><strong>${m.label}</strong></td>
            <td>${m.val1 != null ? `${m.val1} ${m.unit}` : '—'} ${m.class1 ? `<br>${renderProespBadgeHtml(m.class1)}` : ''}</td>
            <td>${m.val2 != null ? `${m.val2} ${m.unit}` : '—'} ${m.class2 ? `<br>${renderProespBadgeHtml(m.class2)}` : ''}</td>
            <td><strong>${deltaFormatted}</strong></td>
            <td>${badgeHtml}</td>
          </tr>
        `;
      });

      htmlContent += `
            </tbody>
          </table>
        </div>
      `;
    }

    // SEÇÃO 2: DETALHAMENTO INDIVIDUAL DE CADA AVALIAÇÃO SELECIONADA
    selectedAssessmentsList.forEach((a) => {
      const dateStr = new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      const ageAtEval = student.dataNascimento ? calculateAge(student.dataNascimento, a.dataAvaliacao) : (student.idade || '—');

      htmlContent += `
        <div class="assessment-block">
          <div class="assessment-header">
            <span>Avaliação de Aptidão Física — ${dateStr} ${a.horario ? `(${a.horario})` : ''}</span>
            <span>Idade na data: ${ageAtEval} anos</span>
          </div>
      `;

      // DADOS DA PRÁTICA
      if (sections.dadosPratica) {
        const naoPratica = a.modalidade === 'Não pratica modalidade';
        htmlContent += `
          <table class="proesp-table">
            <thead>
              <tr>
                <th colspan="4">1. Dados da Sessão e Prática Esportiva</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td width="25%"><strong>Modalidade Praticada:</strong></td>
                <td width="25%">${a.modalidade || 'Não informada'}</td>
                <td width="25%"><strong>Frequência Semanal:</strong></td>
                <td width="25%">${naoPratica ? 'Não aplicável' : (a.frequenciaSemanal ? `${a.frequenciaSemanal} sessões/sem` : 'Não informada')}</td>
              </tr>
              <tr>
                <td><strong>Duração Média:</strong></td>
                <td>${naoPratica ? 'Não aplicável' : (a.duracaoSessao ? `${a.duracaoSessao} minutos` : 'Não informada')}</td>
                <td><strong>Tempo de Prática:</strong></td>
                <td>${naoPratica ? 'Não aplicável' : (a.tempoPratica || 'Não informado')}</td>
              </tr>
              <tr>
                <td><strong>Temperatura Ambiente:</strong></td>
                <td>${a.temperatura != null ? `${a.temperatura} °C` : 'Não informada'}</td>
                <td><strong>Apresenta Deficiência:</strong></td>
                <td>${a.possuiDeficiencia ? `Sim (${a.deficienciaDescricao || 'Especificada'})` : 'Não'}</td>
              </tr>
            </tbody>
          </table>
        `;
      }

      // MEDIDAS CORPORAIS E SAÚDE
      if (sections.medidasCorporais || sections.saudeIMC_RCE) {
        htmlContent += `
          <table class="proesp-table">
            <thead>
              <tr>
                <th>Medida / Indicador Antropométrico</th>
                <th>Resultado Obtido</th>
                <th>Referência / Indicador de Saúde</th>
                <th>Classificação PROESP-Br</th>
              </tr>
            </thead>
            <tbody>
        `;

        if (sections.medidasCorporais) {
          htmlContent += `
            <tr>
              <td><strong>Massa Corporal</strong></td>
              <td>${a.medidas?.massaCorporal != null ? `${a.medidas.massaCorporal} kg` : '—'}</td>
              <td>Balança (precisão 0,1 kg)</td>
              <td><span class="badge-neutral">Antropometria</span></td>
            </tr>
            <tr>
              <td><strong>Estatura</strong></td>
              <td>${a.medidas?.estatura != null ? `${a.medidas.estatura} cm` : '—'}</td>
              <td>Estadiômetro (precisão 0,1 cm)</td>
              <td><span class="badge-neutral">Antropometria</span></td>
            </tr>
            <tr>
              <td><strong>Envergadura</strong></td>
              <td>${a.medidas?.envergadura != null ? `${a.medidas.envergadura} cm` : '—'}</td>
              <td>Fita métrica (precisão 0,1 cm)</td>
              <td><span class="badge-neutral">Antropometria</span></td>
            </tr>
            <tr>
              <td><strong>Perímetro da Cintura</strong></td>
              <td>${a.medidas?.perimetroCintura != null ? `${a.medidas.perimetroCintura} cm` : '—'}</td>
              <td>Ponto médio crista ilíaca/costela</td>
              <td><span class="badge-neutral">Antropometria</span></td>
            </tr>
          `;
        }

        if (sections.saudeIMC_RCE) {
          htmlContent += `
            <tr>
              <td><strong>Índice de Massa Corporal (IMC)</strong></td>
              <td><strong>${a.calculos?.imc != null ? `${a.calculos.imc} kg/m²` : '—'}</strong></td>
              <td>Massa / (Estatura em m)²</td>
              <td>${renderProespBadgeHtml(a.classificacoes?.saude?.imc)}</td>
            </tr>
            <tr>
              <td><strong>Razão Cintura-Estatura (RCE)</strong></td>
              <td><strong>${a.calculos?.rce != null ? a.calculos.rce : '—'}</strong></td>
              <td>Cintura / Estatura (corte risco: ≥ 0,50)</td>
              <td>${renderProespBadgeHtml(a.classificacoes?.saude?.rce)}</td>
            </tr>
          `;
        }

        htmlContent += `
            </tbody>
          </table>
        `;
      }

      // TESTES MOTORES
      const hasAnyTestSelected = sections.corrida6Min || sections.sentarAlcançar || sections.abdominais || 
        sections.medicineBall || sections.saltoHorizontal || sections.quadrado4x4 || sections.corrida20m;

      if (hasAnyTestSelected) {
        htmlContent += `
          <table class="proesp-table">
            <thead>
              <tr>
                <th>Bateria de Testes Motores</th>
                <th>Tentativas / Dados Brutos</th>
                <th>Melhor Resultado</th>
                <th>Classificação de Desempenho</th>
              </tr>
            </thead>
            <tbody>
        `;

        if (sections.corrida6Min) {
          const tot = a.testes?.corrida6Min?.totalMetros ?? a.calculos?.corrida6MinTotal;
          htmlContent += `
            <tr>
              <td><strong>1. Corrida/Caminhada de 6 min</strong><br><small style="color:#64748b">Aptidão Cardiorrespiratória</small></td>
              <td>${a.testes?.corrida6Min?.voltas ?? '—'} voltas (${a.testes?.corrida6Min?.perimetroPista ?? 200}m) + ${a.testes?.corrida6Min?.metrosUltimaVolta ?? 0}m</td>
              <td><strong>${tot != null ? `${tot} m` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.corrida6Min)}</td>
            </tr>
          `;
        }

        if (sections.sentarAlcançar) {
          const bst = a.testes?.sentarAlcançar?.melhorResultado ?? a.calculos?.sentarAlcançarMelhor;
          htmlContent += `
            <tr>
              <td><strong>2. Sentar e Alcançar</strong><br><small style="color:#64748b">Flexibilidade</small></td>
              <td>T1: ${a.testes?.sentarAlcançar?.tentativa1 ?? '—'} cm | T2: ${a.testes?.sentarAlcançar?.tentativa2 ?? '—'} cm</td>
              <td><strong>${bst != null ? `${bst} cm` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.sentarAlcançar)}</td>
            </tr>
          `;
        }

        if (sections.abdominais) {
          htmlContent += `
            <tr>
              <td><strong>3. Abdominais em 1 minuto</strong><br><small style="color:#64748b">Resistência Muscular Localizada</small></td>
              <td>Repetições completas em 60 segundos</td>
              <td><strong>${a.testes?.abdominais1Min?.repeticoes != null ? `${a.testes.abdominais1Min.repeticoes} reps` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.abdominais1Min)}</td>
            </tr>
          `;
        }

        if (sections.medicineBall) {
          const bst = a.testes?.arremessoMedicineBall?.melhorResultado ?? a.calculos?.arremessoMedicineBallMelhor;
          htmlContent += `
            <tr>
              <td><strong>4. Arremesso de Medicine Ball (2 kg)</strong><br><small style="color:#64748b">Força Explosiva MMSS</small></td>
              <td>T1: ${a.testes?.arremessoMedicineBall?.tentativa1 ?? '—'} cm | T2: ${a.testes?.arremessoMedicineBall?.tentativa2 ?? '—'} cm</td>
              <td><strong>${bst != null ? `${bst} cm` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.arremessoMedicineBall)}</td>
            </tr>
          `;
        }

        if (sections.saltoHorizontal) {
          const bst = a.testes?.saltoHorizontal?.melhorResultado ?? a.calculos?.saltoHorizontalMelhor;
          htmlContent += `
            <tr>
              <td><strong>5. Salto Horizontal</strong><br><small style="color:#64748b">Força Explosiva MMII</small></td>
              <td>T1: ${a.testes?.saltoHorizontal?.tentativa1 ?? '—'} cm | T2: ${a.testes?.saltoHorizontal?.tentativa2 ?? '—'} cm</td>
              <td><strong>${bst != null ? `${bst} cm` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.saltoHorizontal)}</td>
            </tr>
          `;
        }

        if (sections.quadrado4x4) {
          const bst = a.testes?.quadrado4x4?.melhorResultado ?? a.calculos?.quadrado4x4Melhor;
          htmlContent += `
            <tr>
              <td><strong>6. Quadrado de 4 × 4 metros</strong><br><small style="color:#64748b">Agilidade e Mudança de Direção</small></td>
              <td>T1: ${a.testes?.quadrado4x4?.tentativa1 ?? '—'} s | T2: ${a.testes?.quadrado4x4?.tentativa2 ?? '—'} s</td>
              <td><strong>${bst != null ? `${bst} s` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.quadrado4x4)}</td>
            </tr>
          `;
        }

        if (sections.corrida20m) {
          const bst = a.testes?.corrida20m?.melhorResultado ?? a.calculos?.corrida20mMelhor;
          htmlContent += `
            <tr>
              <td><strong>7. Corrida de 20 metros</strong><br><small style="color:#64748b">Velocidade de Deslocamento</small></td>
              <td>T1: ${a.testes?.corrida20m?.tentativa1 ?? '—'} s | T2: ${a.testes?.corrida20m?.tentativa2 ?? '—'} s</td>
              <td><strong>${bst != null ? `${bst} s` : '—'}</strong></td>
              <td>${renderProespBadgeHtml(a.classificacoes?.desempenho?.corrida20m)}</td>
            </tr>
          `;
        }

        htmlContent += `
            </tbody>
          </table>
        `;
      }

      // OBSERVAÇÕES
      if (sections.observacoes && a.observacoes) {
        htmlContent += `
          <div class="observations-box">
            <strong>Observações do Avaliador:</strong> ${a.observacoes}
          </div>
        `;
      }

      htmlContent += `</div>`; // fim do assessment-block
    });

    // RODAPÉ DO DOCUMENTO
    htmlContent += `
          <div class="footer-print">
            <span>IFesporte — Sistema de Gestão e Inteligência Esportiva</span>
            <span>Protocolo de Referência: PROESP-Br (GAYA et al., 2021)</span>
            <span>Assinatura do Avaliador: ___________________________</span>
          </div>
        </div>
      </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();

    // Disparar impressão
    setTimeout(() => {
      try {
        printFrame.contentWindow.focus();
        printFrame.contentWindow.print();
      } catch (err) {
        console.error('Erro ao acionar janela de impressão:', err);
      } finally {
        setTimeout(() => {
          document.body.removeChild(printFrame);
          setIsGenerating(false);
          onClose();
        }, 1000);
      }
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1050,
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '780px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* HEADER DO MODAL */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h5 style={{ fontWeight: 800, color: 'var(--text)', margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={20} style={{ color: 'var(--primary)' }} />
              <span>Exportar Ficha de Aptidão Física (PDF)</span>
            </h5>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', margin: '4px 0 0' }}>
              Selecione as avaliações e os tópicos que deseja incluir no documento oficial.
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-secondary rounded-circle" 
            style={{ width: '36px', height: '36px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* CORPO DO MODAL COM SCROLL */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          <div className="row g-4">
            
            {/* 1. SELEÇÃO DE AVALIAÇÕES */}
            <div className="col-12">
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={16} /> 1. Avaliações Disponíveis no Histórico ({selectedIds.length}/{assessments.length} selecionadas)
                  </label>
                  <button 
                    type="button" 
                    className="btn btn-link btn-sm p-0 text-decoration-none" 
                    onClick={toggleSelectAll}
                    style={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    {selectedIds.length === assessments.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </button>
                </div>

                {assessments.length === 0 ? (
                  <p className="text-muted small m-0">Nenhuma avaliação encontrada para este aluno.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {sortedAssessments.map(a => {
                      const isSelected = selectedIds.includes(a._id);
                      const dateFormatted = new Date(a.dataAvaliacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                      return (
                        <div 
                          key={a._id}
                          onClick={() => toggleAssessmentId(a._id)}
                          style={{
                            background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                            border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: '0.875rem', color: 'var(--text)', display: 'block' }}>
                              {dateFormatted}
                            </strong>
                            <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                              {a.modalidade || 'Geral'} {a.calculos?.imc ? `• IMC ${a.calculos.imc}` : ''}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. SELEÇÃO DE CONTEÚDO DO PDF */}
            <div className="col-12">
              <div style={{
                background: 'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                padding: '16px 20px'
              }}>
                <label style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <Layers size={16} /> 2. Conteúdo e Indicadores da Ficha
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                  {[
                    { key: 'dadosPratica', label: 'Dados da Avaliação e Prática' },
                    { key: 'medidasCorporais', label: 'Medidas Corporais (Massa, Estatura)' },
                    { key: 'saudeIMC_RCE', label: 'Indicadores de Saúde (IMC e RCE)' },
                    { key: 'corrida6Min', label: '1. Corrida/Caminhada de 6 min' },
                    { key: 'sentarAlcançar', label: '2. Sentar e Alcançar (Flexibilidade)' },
                    { key: 'abdominais', label: '3. Abdominais em 1 minuto' },
                    { key: 'medicineBall', label: '4. Arremesso de Medicine Ball' },
                    { key: 'saltoHorizontal', label: '5. Salto Horizontal' },
                    { key: 'quadrado4x4', label: '6. Quadrado de 4 × 4 metros' },
                    { key: 'corrida20m', label: '7. Corrida de 20 metros' },
                    { key: 'tabelaComparativa', label: 'Tabela Comparativa (quando 2+)' },
                    { key: 'observacoes', label: 'Observações do Avaliador' }
                  ].map(item => {
                    const isChecked = !!sections[item.key];
                    return (
                      <div 
                        key={item.key}
                        onClick={() => toggleSection(item.key)}
                        style={{
                          background: isChecked ? 'var(--bg-card)' : 'transparent',
                          border: `1px solid ${isChecked ? 'var(--border)' : 'transparent'}`,
                          borderRadius: 'var(--radius-md)',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ color: isChecked ? 'var(--primary)' : 'var(--text-tertiary)' }}>
                          {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                        </div>
                        <span style={{ fontSize: '0.8125rem', color: isChecked ? 'var(--text)' : 'var(--text-secondary)', fontWeight: isChecked ? 600 : 400 }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* AVISO INFORMATIVO SOBRE O FORMATO */}
            <div className="col-12">
              <div style={{
                background: 'var(--primary-lighter)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--primary-light)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Activity size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <strong>Documento Oficial PROESP-Br:</strong> A exportação gera um PDF formatado como ficha física técnica do atleta, contendo cabeçalho institucional, identificação e tabelas de classificação, sem elementos visuais do sistema.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER DO MODAL */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--bg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <strong>{selectedIds.length}</strong> avaliação(ões) selecionada(s)
          </span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancelar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handlePrintPDF}
              disabled={isGenerating || selectedIds.length === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 20px' }}
            >
              <Printer size={16} />
              {isGenerating ? 'Preparando PDF...' : 'Gerar PDF / Imprimir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicalAssessmentPDFExport;
