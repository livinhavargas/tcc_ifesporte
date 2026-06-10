# IFEsporte - Sistema de Gestão Esportiva (TCC)

Este projeto é um **Sistema de Gestão Esportiva**, desenvolvido como Trabalho de Conclusão de Curso (TCC). O objetivo é facilitar o gerenciamento de modalidades esportivas, alunos, agendas de treinos e análises de desempenho, utilizando a stack **MERN (MongoDB, Express, React e Node.js)**.

## Objetivo do Projeto

O sistema foi criado para centralizar as informações esportivas, permitindo:

- **Gestão de Esportes:** Cadastro e visualização de modalidades oferecidas.
- **Controle de Alunos:** Gerenciamento dos dados dos estudantes participantes.
- **Agenda de Atividades:** Organização de treinos, horários e eventos esportivos.
- **Análise de Desempenho:** Acompanhamento e análise estatística/técnica das atividades.
- **Autenticação Segura:** Sistema de Login e Registro para acesso restrito.

## Tecnologias Utilizadas

### Frontend
- **React:** Biblioteca principal para a interface.
- **React Router DOM:** Navegação entre páginas.
- **Vanilla CSS / Bootstrap:** Estilização e responsividade.

### Backend
- **Node.js & Express:** Servidor e API.
- **MongoDB & Mongoose:** Banco de dados NoSQL e modelagem de dados.
- **JWT (JSON Web Token):** Autenticação e segurança das rotas.
- **Bcrypt:** Criptografia de senhas.

## Estrutura do Projeto

```
tcc_ifesporte/
├── client/                # Frontend (React)
│   ├── src/components/    # Componentes reutilizáveis
│   └── src/pages/         # Páginas do sistema (IFEsporte, Login, etc.)
├── server/                # Backend (Node + Express)
│   ├── controllers/       # Lógica das rotas (Esportes, Alunos, Agenda, etc.)
│   ├── models/            # Esquemas do MongoDB (Sport, Student, Schedule, etc.)
│   ├── routes/            # Definição dos endpoints da API
│   ├── middleware/        # Filtros de segurança (Autenticação)
│   └── server.js          # Ponto de entrada do servidor
```

## Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/livinhavargas/tcc_ifesporte.git
    ```

2.  **Configuração do Backend:**
    - Acesse `cd server`
    - Instale as dependências: `npm install`
    - Crie um arquivo `.env` com:
      ```
      MONGO_URI=sua_conexao_mongodb
      JWT_SECRET=sua_chave_secreta
      PORT=5000
      ```
    - Inicie: `npm start`

3.  **Configuração do Frontend:**
    - Acesse `cd client`
    - Instale as dependências: `npm install`
    - Inicie: `npm start`

## Desenvolvido por
**Livinha Vargas**  
Projeto de Conclusão de Curso (TCC).
