/**
 * IFesporte — Centralizador de Configuração de API
 * 
 * Em ambiente de desenvolvimento local (sem REACT_APP_API_URL), retorna caminhos relativos
 * que utilizam o proxy do Create React App configurado para http://localhost:7777.
 * 
 * Em produção (Render Static Site), utiliza a URL base definida em REACT_APP_API_URL.
 */

const API_BASE = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

/**
 * Constrói a URL completa para uma rota de API
 * @param {string} endpoint - Rota (ex: '/api/users/login')
 * @returns {string} - URL formatada
 */
export const apiUrl = (endpoint = '') => {
  if (!endpoint) return API_BASE;
  
  // Se já for uma URL absoluta (http/https), retorna diretamente
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return API_BASE ? `${API_BASE}${cleanEndpoint}` : cleanEndpoint;
};

export default apiUrl;
