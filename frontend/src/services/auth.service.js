import { authFetch, API_URL } from './api';

export const registerUser = async (data) => {
  return fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
};

export const loginUser = async (data) => {
  return fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include'
  });
};

export const logoutUser = async () => {
  return authFetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
};

export const getCurrentUser = async () => {
  return authFetch(`${API_URL}/api/auth/me`, { method: 'GET' });
};
