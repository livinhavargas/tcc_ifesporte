import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Perfil from './pages/Perfil';
import Alunos from './pages/IFEsporte/Alunos';
import Agenda from './pages/IFEsporte/Agenda';
import Esportes from './pages/IFEsporte/Esportes';
import Analises from './pages/IFEsporte/Analises';
import SportDetail from './pages/IFEsporte/SportDetail';
import StudentProfile from './pages/IFEsporte/StudentProfile';
import AdminDashboard from './pages/IFEsporte/AdminDashboard';
import AdminRoute from './components/AdminRoute';

import PrivateRoute from './components/PrivateRoute';

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/perfil" element={token ? <Perfil /> : <Navigate to="/login" replace />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" replace />} />
        
        <Route path="/alunos" element={token && tipo === 'admin' ? <Alunos /> : <Navigate to="/" replace />} />
        <Route path="/alunos/:id" element={token && tipo === 'admin' ? <StudentProfile /> : <Navigate to="/" replace />} />
        <Route path="/agenda" element={token ? <Agenda /> : <Navigate to="/login" replace />} />
        <Route path="/esportes" element={token && tipo === 'admin' ? <Esportes /> : <Navigate to="/" replace />} />
        <Route path="/esportes/:id" element={token && tipo === 'admin' ? <SportDetail /> : <Navigate to="/" replace />} />
        <Route path="/analises" element={token ? <Analises /> : <Navigate to="/login" replace />} />

        {/* Rota Administrativa (Área do Servidor) */}
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

