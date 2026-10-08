import { authFetch, API_URL } from './api';

export const getUsers = async () => {
  return authFetch(`${API_URL}/api/users`);
};

export const getUserById = async (userId) => {
  return authFetch(`${API_URL}/api/users/${userId}`);
};

export const createUser = async (data) => {
  return authFetch(`${API_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateUserRole = async (userId, role) => {
  return authFetch(`${API_URL}/api/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  });
};

export const updateUserStatus = async (userId, isActive) => {
  return authFetch(`${API_URL}/api/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  });
};
