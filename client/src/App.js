import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Perfil from './pages/Perfil';
import Alunos from './pages/IFEsporte/Alunos';
import Agenda from './pages/IFEsporte/Agenda';
import Esportes from './pages/IFEsporte/Esportes';
import NovaAnalise from './pages/IFEsporte/NovaAnalise';
import VisualizarAnalise from './pages/IFEsporte/VisualizarAnalise';
import SportDetail from './pages/IFEsporte/SportDetail';
import StudentProfile from './pages/IFEsporte/StudentProfile';
import EducacaoFisica from './pages/IFEsporte/EducacaoFisica';
import AdminDashboard from './pages/IFEsporte/AdminDashboard'; // We can use this as Relatórios mock for now
import AdminRoute from './components/AdminRoute';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tipo, setTipo] = useState(localStorage.getItem('tipo'));

  const handleLogin = (token, tipo, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('tipo', tipo);
    if (email) localStorage.setItem('userEmail', email);
    setToken(token);
    setTipo(tipo);
  };

  // Funções de verificação de papel
  const currentTipo = (tipo || localStorage.getItem('tipo') || '').toLowerCase();
  const isStaff = currentTipo !== '' && currentTipo !== 'estudante'; // Professor, Treinador, Coordenador, Administrador

  return (
    <ThemeProvider>
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verificar-email" element={<VerifyEmail />} />
        <Route path="/perfil" element={token ? <Perfil /> : <Navigate to="/login" replace />} />
        
        {/* Rotas Restritas para Staff */}
        <Route path="/alunos" element={token && isStaff ? <Alunos /> : <Navigate to="/" replace />} />
        <Route path="/alunos/:id" element={token && isStaff ? <StudentProfile /> : <Navigate to="/" replace />} />
        
        {/* Rotas Comuns */}
        <Route path="/agenda" element={token ? <Agenda /> : <Navigate to="/login" replace />} />
        <Route path="/educacao-fisica" element={token && isStaff ? <EducacaoFisica /> : <Navigate to="/" replace />} />
        <Route path="/esportes" element={token && isStaff ? <Esportes /> : <Navigate to="/" replace />} />
        <Route path="/esportes/:id" element={token && isStaff ? <SportDetail /> : <Navigate to="/" replace />} />
        <Route path="/analises" element={token ? (isStaff ? <Navigate to="/esportes" replace /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />} />
        <Route path="/analises/nova" element={token && isStaff ? <NovaAnalise /> : <Navigate to="/" replace />} />
        <Route path="/analises/editar/:id" element={token && isStaff ? <NovaAnalise /> : <Navigate to="/" replace />} />
        <Route path="/analises/:id" element={token ? (isStaff ? <VisualizarAnalise /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />} />
        
        {/* Relatórios */}
        <Route path="/relatorios" element={token && isStaff ? <AdminDashboard /> : <Navigate to="/" replace />} />

        {/* Rota Administrativa (Configurações) */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}
