const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Shared authenticated fetch with automatic token refresh
export const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    credentials: 'include',
    headers
  };

  let response = await fetch(url, config);

  // Attempt silent token refresh on 401
  if (response.status === 401 && token) {
    try {
      const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          headers.Authorization = `Bearer ${refreshData.accessToken}`;
          response = await fetch(url, { ...config, headers });
        }
      } else {
        localStorage.removeItem('accessToken');
      }
    } catch {
      localStorage.removeItem('accessToken');
    }
  }

  return response;
};

export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/api/health`);
  return response.json();
};

export { API_URL };

const api = {
  get: async (url, options = {}) => {
    let finalUrl = `${API_URL}${url.startsWith('/api') ? '' : '/api'}${url}`;
    if (options.params) {
      finalUrl += '?' + new URLSearchParams(options.params).toString();
    }
    const res = await authFetch(finalUrl, { method: 'GET', ...options });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return { data };
  },
  post: async (url, body, options = {}) => {
    const finalUrl = `${API_URL}${url.startsWith('/api') ? '' : '/api'}${url}`;
    const res = await authFetch(finalUrl, { 
      method: 'POST', 
      body: JSON.stringify(body),
      ...options 
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return { data };
  },
  put: async (url, body, options = {}) => {
    const finalUrl = `${API_URL}${url.startsWith('/api') ? '' : '/api'}${url}`;
    const res = await authFetch(finalUrl, { 
      method: 'PUT', 
      body: JSON.stringify(body),
      ...options 
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return { data };
  },
  patch: async (url, body, options = {}) => {
    const finalUrl = `${API_URL}${url.startsWith('/api') ? '' : '/api'}${url}`;
    const res = await authFetch(finalUrl, { 
      method: 'PATCH', 
      body: JSON.stringify(body),
      ...options 
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return { data };
  },
  delete: async (url, options = {}) => {
    const finalUrl = `${API_URL}${url.startsWith('/api') ? '' : '/api'}${url}`;
    const res = await authFetch(finalUrl, { method: 'DELETE', ...options });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    return { data };
  }
};

export default api;
