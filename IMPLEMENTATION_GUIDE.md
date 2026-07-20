# IFEsporte - Guia de Implementação

## 📋 Resumo das Melhorias Implementadas

### 1. **Logo e Design**
- ✅ Nova logo criada (logo.svg) nos formatos adequados
- ✅ Favicon atualizado com a nova logo
- ✅ Telas de Login e Registro redesenhadas com novo design
- ✅ Interface melhorada com cores e ícones Bootstrap

### 2. **Sistema de Autenticação**
- ✅ Suporte para três tipos de usuários:
  - **Estudante**: Cadastro com matrícula obrigatória
  - **Treinador**: Acesso completo para gerenciar eventos e alunos
  - **Professor (Admin)**: Acesso total ao sistema

### 3. **Perfil do Usuário**
- ✅ Nova página de perfil (`/perfil`)
- ✅ Clique no nome no header para acessar o perfil
- ✅ Exibição de informações pessoais
- ✅ Botão de logout no menu de perfil

### 4. **Gerenciamento de Alunos**
- ✅ Página melhorada para listar e gerenciar alunos
- ✅ Formulário para adicionar novos alunos (apenas admin/treinador)
- ✅ Campos obrigatórios: Nome, Matrícula, Série, Sexo, Idade
- ✅ Campos opcionais: Email, Telefone, Altura, Peso (com IMC automático)
- ✅ Exibição do status IMC com indicador visual (círculo colorido)
- ✅ Busca de alunos por nome

### 5. **Modalidades Esportivas**
- ✅ Novas modalidades adicionadas:
  - **Individuais**: 
    - Atletismo (com subesportes: Corridas, Saltos, Lançamentos)
    - Tênis de Mesa
    - Xadrez
  - **Em Equipe**:
    - Futsal
    - Handebol
    - Basquete
    - Vôlei
    - Vôlei de Praia

- ✅ Subesportes para Atletismo:
  - **Corridas**: 100m, 200m, 400m, 800m, 1500m, 3000m, 5000m rasos
  - **Saltos**: Salto em altura, distância, triplo e triátlo
  - **Lançamentos**: Disco, dardo, arremesso de peso

- ✅ Página melhorada de detalhes de modalidade

### 6. **Agenda de Eventos**
- ✅ Nova funcionalidade para adicionar eventos
- ✅ Tipos de eventos: Treino, Amistoso, Competição, Outro
- ✅ Calendário interativo mostrando eventos
- ✅ Apenas admin e treinador podem criar eventos

### 7. **Análise de Desempenho**
- ✅ Nova página de análises (`/analises`)
- ✅ Painel para avaliar desempenho individual ou coletivo
- ✅ Categorias: Ataque, Defesa, Goleiro, Geral
- ✅ Métricas variáveis (12 métricas diferentes)
- ✅ Cálculo automático de avaliação (Excelente, Bom, Regular, Precisa Melhorar)
- ✅ Período e observações para cada análise

## 🚀 Instruções de Uso

### Inicializar Modalidades
Na primeira execução, acesse a rota para inicializar as modalidades padrão:
```
GET /api/sports/initialize
```

### Fazer Login
1. Acesse `/login`
2. Use email e senha cadastrados
3. Escolha o tipo de usuário durante o registro em `/register`

### Adicionar Alunos (Admin/Treinador)
1. Vá para a aba "Alunos"
2. Clique em "Novo Aluno"
3. Preencha os dados obrigatórios
4. Campos opcionais (altura/peso) calcularão IMC automaticamente

### Criar Eventos (Admin/Treinador)
1. Vá para "Agenda"
2. Clique em "Novo Evento"
3. Selecione o tipo (Treino, Amistoso, Competição)
4. Escolha data, hora e modalidade
5. O evento aparecerá no calendário

### Analisar Desempenho (Admin/Treinador)
1. Vá para "Análises"
2. Clique em "Nova Análise"
3. Selecione aluno e modalidade
4. Defina valores para as métricas (0-10)
5. A avaliação é calculada automaticamente
6. Salve com observações opcionais

## 📊 Estrutura de Dados

### Modelo de Usuário
- nome
- email (único)
- senha (hash)
- tipo (treinador, admin, estudante)
- matricula (apenas estudantes)

### Modelo de Aluno
- nome
- matricula (única)
- serie (1EM, 2EM, 3EM)
- sexo (M, F, Outro)
- idade
- esportes (array)
- email (opcional)
- telefone (opcional)
- altura (opcional)
- peso (opcional)
- imc (virtual - calculado automaticamente)

### Modelo de Evento
- titulo
- tipo (treino, amistoso, competição, outro)
- data
- hora
- local
- modalidade
- descricao (opcional)
- responsavel (ID do usuário)

### Modelo de Análise
- aluno (ID)
- modalidade
- tipoAnalise (individual, coletiva)
- categoria (ataque, defesa, goleiro, geral)
- metricas (12 campos numéricos)
- periodo
- observacoes (opcional)
- avaliador (ID do usuário)

## 🔐 Permissões

| Função | Alunos | Agenda | Esportes | Análises |
|--------|--------|--------|----------|----------|
| Estudante | Ver | Ver | Ver | Ver |
| Treinador | Criar/Editar | Criar/Editar | Ver | Criar/Editar |
| Admin | Criar/Editar | Criar/Editar | Gerenciar | Criar/Editar |

## 🎨 Cores do Sistema

- **Primário**: #1e5ba8 (Azul)
- **Secundário**: #f4a942 (Laranja)
- **Sucesso**: #28a745 (Verde)
- **Perigo**: #dc3545 (Vermelho)

## 📝 Próximos Passos

1. Implementar histórico de análises com gráficos
2. Adicionar filtros avançados na busca de alunos
3. Gerar relatórios em PDF
4. Sistema de notificações para eventos
5. App mobile

---

**Versão**: 2.0.0
**Data**: 2024
**Desenvolvido por**: IFC - IFEsporte Team
