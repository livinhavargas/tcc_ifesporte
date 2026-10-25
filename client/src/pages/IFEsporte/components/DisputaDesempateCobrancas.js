import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/**
 * Componente oficial para registro dos atletas participantes das cobranças
 * de desempate (Pênaltis no Futsal/Futebol e Cobranças de 7m no Handebol).
 *
 * Padrão visual idêntico ao componente de seleção do card "Cartão":
 * - Dropdown com atletas da equipe (sem repetição de atletas)
 * - Controle simples de resultado: "Gol" ou "Não fez gol"
 * - Botão de exclusão para remoção de participante selecionado por engano
 */
const DisputaDesempateCobrancas = ({
  cobrancas = [],
  onChange,
  eligibleStudents = [],
  modalidade = ''
}) => {
  const isHandebol = (modalidade || '').toLowerCase().includes('handebol');
  const actionLabel = isHandebol ? 'Adicionar Cobrador (7m)' : 'Adicionar Cobrador';

  const handleAdd = () => {
    // Encontra o primeiro atleta elegível ainda não selecionado em nenhuma cobrança
    const nextStudent = eligibleStudents.find(s => !cobrancas.some(c => c.atletaId === s._id));
    const newRow = nextStudent
      ? { atletaId: nextStudent._id, atletaNome: nextStudent.nome, resultado: 'Gol' }
      : { atletaId: '', atletaNome: '', resultado: 'Gol' };

    onChange([...cobrancas, newRow]);
  };

  const handleAtletaChange = (idx, atletaId) => {
    const student = eligibleStudents.find(s => s._id === atletaId);
    const updated = [...cobrancas];
    updated[idx] = {
      ...updated[idx],
      atletaId,
      atletaNome: student ? student.nome : ''
    };
    onChange(updated);
  };

  const handleResultadoChange = (idx, resultado) => {
    const updated = [...cobrancas];
    updated[idx] = {
      ...updated[idx],
      resultado
    };
    onChange(updated);
  };

  const handleRemove = (idx) => {
    const updated = cobrancas.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div style={{ width: '100%', textAlign: 'left', marginTop: '4px' }}>
      {/* Cabeçalho da seção com botão de adicionar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Jogadores que participaram da cobrança
        </span>

        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-sm btn-secondary"
          style={{
            fontSize: '0.6875rem',
            padding: '3px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600
          }}
          aria-label={actionLabel}
        >
          <Plus size={12} /> {actionLabel}
        </button>
      </div>

      {/* Lista compacta de participantes */}
      {cobrancas.length === 0 ? (
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
          margin: '10px 0',
          textAlign: 'center'
        }}>
          Nenhum cobrador adicionado para a disputa de desempate.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          {cobrancas.map((c, idx) => {
            // Atletas disponíveis: os ainda não selecionados em outras linhas + o já selecionado nesta linha
            const availableStudents = eligibleStudents.filter(s =>
              s._id === c.atletaId || !cobrancas.some((other, oIdx) => oIdx !== idx && other.atletaId === s._id)
            );

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-card)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  flexWrap: 'wrap'
                }}
              >
                {/* Identificador da cobrança */}
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  minWidth: '76px'
                }}>
                  {idx + 1}ª Cobrança:
                </span>

                {/* Seleção do atleta da nossa equipe */}
                <select
                  className="form-select form-select-sm"
                  value={c.atletaId || ''}
                  onChange={(e) => handleAtletaChange(idx, e.target.value)}
                  style={{
                    flex: '1 1 200px',
                    minWidth: '160px',
                    textOverflow: 'ellipsis',
                    cursor: 'pointer'
                  }}
                  aria-label={`Atleta cobrança ${idx + 1}`}
                >
                  <option value="">Selecione o atleta</option>
                  {availableStudents.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.nome} {s.turma ? `(${s.turma})` : ''}
                    </option>
                  ))}
                </select>

                {/* Controle simples do resultado: Gol ou Não fez gol */}
                <select
                  className="form-select form-select-sm"
                  value={c.resultado || 'Gol'}
                  onChange={(e) => handleResultadoChange(idx, e.target.value)}
                  style={{
                    width: '140px',
                    minWidth: '130px',
                    fontWeight: 600,
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  aria-label={`Resultado cobrança ${idx + 1}`}
                >
                  <option value="Gol">Gol</option>
                  <option value="Não fez gol">Não fez gol</option>
                </select>

                {/* Botão de remoção */}
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="btn btn-sm text-danger"
                  style={{
                    padding: '4px 6px',
                    background: 'transparent',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer'
                  }}
                  title="Remover participante da cobrança"
                  aria-label={`Remover cobrança ${idx + 1}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DisputaDesempateCobrancas;
