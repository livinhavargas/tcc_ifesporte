import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const tipo = localStorage.getItem('tipo');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (tipo !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
