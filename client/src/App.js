import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Alunos from './pages/IFEsporte/Alunos';
import Agenda from './pages/IFEsporte/Agenda';
import Esportes from './pages/IFEsporte/Esportes';
import SportDetail from './pages/IFEsporte/SportDetail';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login onLogin={(token) => { localStorage.setItem('token', token); setToken(token); }} />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/alunos" element={token ? <Alunos /> : <Navigate to="/login" replace />} />
        <Route path="/agenda" element={token ? <Agenda /> : <Navigate to="/login" replace />} />
        <Route path="/esportes" element={token ? <Esportes /> : <Navigate to="/login" replace />} />
        <Route path="/esportes/:id" element={token ? <SportDetail /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
