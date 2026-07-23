import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Alunos from './pages/IFesporte/Alunos';
import Agenda from './pages/IFesporte/Agenda';
import Esportes from './pages/IFesporte/Esportes';
import Analises from './pages/IFesporte/Analises';
import SportDetail from './pages/IFesporte/SportDetail';
import StudentProfile from './pages/IFesporte/StudentProfile';
import AdminDashboard from './pages/IFesporte/AdminDashboard'; // We can use this as Relatórios mock for now
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
  const isStaff = tipo !== 'estudante'; // Professor, Treinador, Coordenador, Administrador

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={token ? <Perfil /> : <Navigate to="/login" replace />} />
        
        {/* Rotas Restritas para Staff */}
        <Route path="/alunos" element={token && isStaff ? <Alunos /> : <Navigate to="/" replace />} />
        <Route path="/alunos/:id" element={token && isStaff ? <StudentProfile /> : <Navigate to="/" replace />} />
        
        {/* Rotas Comuns */}
        <Route path="/agenda" element={token ? <Agenda /> : <Navigate to="/login" replace />} />
        <Route path="/esportes" element={token && isStaff ? <Esportes /> : <Navigate to="/" replace />} />
        <Route path="/esportes/:id" element={token && isStaff ? <SportDetail /> : <Navigate to="/" replace />} />
        <Route path="/analises" element={token && isStaff ? <Analises /> : <Navigate to="/" replace />} />
        
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
  );
}
