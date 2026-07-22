# IFEsporte - Sistema de Gestão Esportiva do Instituto Federal Catarinense

> **ESTE DOCUMENTO É A FONTE OFICIAL DE VERDADE DO PROJETO.**
> 
> Nenhuma funcionalidade, layout, fluxo ou regra de negócio pode ser alterada sem estar documentada neste arquivo ou nas prototipações oficiais.
> 
> Caso exista conflito entre o código e este documento, ESTE DOCUMENTO PREVALECE.

## Índice
- [Objetivo](#objetivo)
- [Tecnologias](#tecnologias)
- [Design System](#design-system)
- [Tipos de Usuários](#tipos-de-usuários)
- [Autenticação e Login](#autenticação-e-login)
- [Permissões](#permissões)
- [Telas e Funcionalidades](#telas-e-funcionalidades)
  - [Home](#home)
  - [Perfil](#perfil)
  - [Alunos](#alunos)
  - [Modalidades](#modalidades)
  - [Agenda](#agenda)
  - [Análises](#análises)
  - [Cronogramas](#cronogramas)
- [Banco de Dados](#banco-de-dados)
- [Requisitos Técnicos](#requisitos-técnicos)
- [Regras Importantes para a IA](#regras-importantes-para-a-ia)

---

## OBJETIVO

O IFEsporte é um sistema web desenvolvido para gerenciamento esportivo do Instituto Federal Catarinense.

O sistema deve permitir administrar modalidades, atletas, cronogramas, eventos, treinamentos e análises técnicas de desempenho esportivo.

- Toda informação deve ser persistida em MongoDB.
- Todo CRUD deve ser funcional.
- Nenhuma tela poderá utilizar dados mockados.
- Todo dado apresentado deverá ser proveniente do banco de dados.

---

## TECNOLOGIAS

**Frontend**
- React
- React Router
- Bootstrap
- CSS

**Backend**
- Node.js
- Express

**Banco de Dados**
- MongoDB
- Mongoose

**Autenticação**
- JWT
- BCrypt

---

## DESIGN SYSTEM

Toda aplicação deve possuir exatamente a mesma identidade visual.

**Paleta de Cores:**
- Azul (principal)
- Branco
- Cinza claro
- Laranja (detalhes)
- Verde (sucesso)
- Vermelho (erro)
- Amarelo (alerta)

**Padrões Comuns:**
Todos os componentes devem possuir:
- Mesmo `border-radius`
- Mesma sombra
- Mesmo padrão de botões
- Mesma tipografia
- Mesmos inputs
- Mesma navbar
- Mesma sidebar
- Mesma identidade visual

> **Atenção:** Não criar páginas com estilos diferentes. Seguir exatamente as prototipações. Modernizar apenas mantendo a identidade criada.

---

## TIPOS DE USUÁRIOS

Existem apenas dois tipos de usuários:
1. **Administrador**
2. **Estudante**

> **Atenção:** Perfil de Treinador NÃO EXISTE.

---

## AUTENTICAÇÃO E LOGIN

- Email
- Senha
- Esqueci minha senha
- Lembrar login
- Logout
- Sessão JWT

### Cadastro de Administrador
- Nome
- Email
- Senha
- Código Escolar
- Telefone
- Foto

> **Regra de Cadastro:** O código escolar obrigatório para criar administrador é: `123`. Caso o código seja diferente, não permitir cadastro.

### Cadastro de Estudante
- Nome
- Email
- Senha
- Telefone
- Foto
- Gênero (Feminino / Masculino)
- Idade
- Turma
- Matrícula (OPCIONAL)
- Modalidades (Devem aparecer em forma de seleção. Nunca permitir digitação manual.)
- Peso
- Altura
- IMC (Calculado automaticamente: Verde = Saudável, Amarelo = Atenção, Vermelho = Não saudável)

**Turmas disponíveis:**
1A, 1B, 1H, 2A, 2B, 2H, 3A, 3B, 3C, 3H

> **Caracteres especiais:** Devem ser aceitos (Ex: João, Vitória, Luís, Érica, José).

---

## PERMISSÕES

### Administrador
Possui controle total. Pode:
- Adicionar / Editar / Excluir aluno
- Adicionar / Editar / Excluir eventos
- Adicionar / Editar / Excluir análises
- Gerenciar modalidades
- Gerenciar cronogramas
- Editar qualquer perfil

### Estudante
Pode apenas:
- Ver agenda
- Ver dashboard
- Editar seu perfil
- Visualizar suas análises
- Visualizar seus eventos
- Visualizar seus treinos

NÃO pode acessar:
- Lista de alunos
- Cadastro de alunos
- Cadastro de eventos
- Cadastro de análises
- Gerenciamento de modalidades

---

## TELAS E FUNCIONALIDADES

### HOME
Deve mostrar:
- Treinos próximos
- Eventos próximos
- Avisos
- Atalhos

> **Nota:** Os treinos e eventos devem ser carregados automaticamente da Agenda. Sem dados fixos.

### PERFIL
**Administrador:**
- Nome, Email, Telefone, Foto.
- Pode editar tudo.
- Botão sair deve ficar ao final da página.

**Estudante:**
- Nome, Foto, Telefone, Peso, Altura, IMC, Modalidades, Turma, Idade, Matrícula, Email.
- Pode editar tudo (incluindo trocar foto).
- Botão sair ao final.

### ALUNOS
- Apenas administradores têm acesso.
- Lista em ordem alfabética.
- Pesquisa e Filtros.
- Adicionar, Editar e Excluir aluno.
- Visualizar ficha completa.

**Ao abrir a ficha mostrar:**
Foto, Nome, Turma, Idade, Peso, Altura, IMC, Status IMC, Telefone, Email, Modalidades, Histórico, Análises.

**Cadastro de Aluno:**
- Obrigatório: Nome, Gênero, Modalidades
- Opcional: Telefone, Email, Peso, Altura, Foto, Idade, Turma, Matrícula

### MODALIDADES
**Individuais:**
- Atletismo, Badminton, Tênis de Mesa, Xadrez

**Equipe:**
- Basquete, Futebol, Futsal, Handebol, Vôlei, Vôlei de Praia

**Atletismo (Subdivisões):**
- Corridas: 100m, 200m, 400m, 800m, 1500m, 3000m, 5000m, Revezamento 100m, Revezamento 400m
- Saltos: Altura, Distância, Triplo
- Lançamentos: Peso, Disco, Dardo

**Tênis de Mesa (Subdivisões):**
- Individual, Dupla

**Ao abrir uma modalidade, exibir:**
Dashboard, Alunos, Análises, Cronogramas, Eventos, Relatórios.

> **Quantidade de alunos:** Sempre deve coincidir com o banco. Para modalidades com subdivisões, mostrar o total da modalidade e o total de cada subdivisão.

### AGENDA
- Calendário mensal com setas para mês anterior e próximo mês.
- Mostrar eventos dentro do calendário.
- Administrador possui CRUD (Cadastrar, Editar, Excluir evento).
- Estudante apenas visualiza.

**Tipos de Eventos:**
Treino, Amistoso, Campeonato.

**Dashboard de Agenda:**
- Treinos: Mostrar apenas Treinos.
- Eventos: Mostrar Amistosos e Campeonatos.

### ANÁLISES
- Administrador cria, Estudante apenas visualiza.
- Ao acessar pela modalidade, NÃO pedir modalidade novamente (ela já está definida).
- **Modalidades com análises:** Futebol, Futsal, Basquete, Handebol, Vôlei, Badminton, Atletismo. *(Xadrez e Tênis de Mesa não possuem análises nesta versão).*
- **Fluxo:** Seleciona atleta -> Seleciona categoria -> Preenche formulário -> Salvar.
- **Banco:** Atualizar histórico e dashboard após salvar.

### CRONOGRAMAS
- Gerador automático.
- Campos: Modalidade, Período, Data da competição, Dias por semana, Objetivo.
- Gerar automaticamente as fases: Preparatória, Competitiva, Transição.
- Cada fase deve conter: Objetivos, Semanas, Treinos, Datas.
- Integração com Agenda.

---

## BANCO DE DADOS
Persistir no MongoDB (via Mongoose):
- Usuários
- Alunos
- Modalidades
- Eventos
- Cronogramas
- Análises
- Perfis

> **Atenção:** Nunca utilizar arrays mockados. Nunca utilizar dados fixos.

---

## REQUISITOS TÉCNICOS

### Rotas
- Todas devem funcionar.
- Nenhuma tela branca.
- Nenhum erro 500.
- Nenhum erro Cannot GET.
- Nenhum erro de React.
- Nenhum erro de console.

### Responsividade
Todas as telas são obrigatórias para: Desktop, Notebook, Tablet e Celular.

### Qualidade de Entrega
Toda funcionalidade somente será considerada pronta quando possuir:
- CRUD completo
- Persistência
- Validação
- Permissões
- Tratamento de erros
- Integração frontend/backend
- Atualização automática da interface
- Sem telas brancas
- Sem dados mockados
- Sem erros de console
- Sem erros de terminal

---

## REGRAS IMPORTANTES PARA A IA

1. **Nunca inventar funcionalidades.**
2. **Nunca remover funcionalidades existentes.**
3. **Nunca alterar layout sem seguir as prototipações.**
4. **Nunca alterar o banco sem atualizar backend e frontend.**
5. Sempre analisar impacto antes de modificar arquivos.
6. Sempre corrigir a causa do problema e não apenas o sintoma.
7. Sempre validar após implementar.

**Toda entrega deve informar:**
- Arquivos alterados.
- Motivo.
- Impacto.
- Testes realizados.
- Resultado.

> **Regra de Ouro:** Nenhuma funcionalidade está concluída apenas porque compila. Ela só está concluída quando funciona integralmente no frontend, backend, banco de dados e respeita este documento.
