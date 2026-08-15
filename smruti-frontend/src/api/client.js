// Centralized SMRUTI Real API Client

// @ts-nocheck
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '/api';

// Helper to get stored auth token
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  if (tokenFromUrl) {
    localStorage.setItem('smruti_auth_token', tokenFromUrl);
    // Clean token from url bar
    urlParams.delete('token');
    const newSearch = urlParams.toString();
    const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '') + window.location.hash;
    window.history.replaceState(null, '', newUrl);
    return tokenFromUrl;
  }
  return localStorage.getItem('smruti_auth_token');
}

/**
 * @param {string} endpoint
 * @param {RequestInit & { headers?: Record<string, string> }} [options]
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // If uploading FormData, delete Content-Type to let browser set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  /** @type {RequestInit} */
  const config = {
    ...options,
    headers,
    credentials: /** @type {RequestCredentials} */ ('include'),
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(data.message || 'API request failed', res.status, data);
    }

    return data.data !== undefined ? data.data : data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error && typeof error === 'object' && 'name' in error && error.name === 'TypeError' && String(error.message).includes('fetch')) {
      console.error('[SMRUTI Network Error]', error);
      throw new ApiError('Unable to connect to SMRUTI backend right now. Please verify server is running.', 0, null);
    }
    throw error;
  }
}

export const api = {
  // Auth
  auth: {
    me: () => request('/auth/me'),
    loginWithProvider: (provider = 'google', returnTo = window.location.href) => {
      // Use render direct or relative auth url
      const targetAuth = `${API_BASE}/auth/google?returnTo=${encodeURIComponent(returnTo)}`;
      window.location.href = targetAuth;
    },
    devLogin: (email, name) => request('/auth/dev-login', { method: 'POST', body: JSON.stringify({ email, name }) }),
    loginViaEmailPassword: async (email, password) => {
      const res = await request('/auth/dev-login', { method: 'POST', body: JSON.stringify({ email, name: email.split('@')[0] }) });
      if (res && res.token) {
        localStorage.setItem('smruti_auth_token', res.token);
      }
      return res;
    },
    register: async ({ email, password, name }) => {
      const res = await request('/auth/dev-login', { method: 'POST', body: JSON.stringify({ email, name: name || email.split('@')[0] }) });
      if (res && res.token) {
        localStorage.setItem('smruti_auth_token', res.token);
      }
      return res;
    },
    verifyOtp: async () => ({ access_token: 'session_active' }),
    resendOtp: async () => ({ success: true }),
    setToken: (token) => {
      if (token) localStorage.setItem('smruti_auth_token', token);
      else localStorage.removeItem('smruti_auth_token');
    },
    resetPasswordRequest: async () => ({ success: true }),
    resetPassword: async () => ({ success: true }),
    logout: async (redirectUrl = '/login') => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } catch (e) {
        // ignore
      }
      localStorage.removeItem('smruti_auth_token');
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (returnUrl = '/') => {
      window.location.href = '/login?returnTo=' + encodeURIComponent(returnUrl);
    },
  },

  // Users
  users: {
    getProfile: () => request('/users/me'),
    updateProfile: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Families
  families: {
    create: (data) => request('/families', { method: 'POST', body: JSON.stringify(data) }),
    get: (familyId) => request(`/families/${familyId}`),
    update: (familyId, data) => request(`/families/${familyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    invite: (familyId, data) => request(`/families/${familyId}/invite`, { method: 'POST', body: JSON.stringify(data) }),
    acceptInvite: (token) => request('/families/accept-invitation', { method: 'POST', body: JSON.stringify({ token }) }),
  },

  // Members
  members: {
    list: (familyId) => request(`/families/${familyId}/members`),
    get: (familyId, memberId) => request(`/families/${familyId}/members/${memberId}`),
    create: (familyId, data) => request(`/families/${familyId}/members`, { method: 'POST', body: JSON.stringify(data) }),
    update: (familyId, memberId, data) =>
      request(`/families/${familyId}/members/${memberId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (familyId, memberId) => request(`/families/${familyId}/members/${memberId}`, { method: 'DELETE' }),
    linkUser: (familyId, memberId, targetUserId) =>
      request(`/families/${familyId}/members/${memberId}/link-user`, { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  },

  // Family Tree
  tree: {
    get: (familyId) => request(`/families/${familyId}/tree`),
    addRelationship: (familyId, data) =>
      request(`/families/${familyId}/tree/relationships`, { method: 'POST', body: JSON.stringify(data) }),
    removeRelationship: (familyId, data) =>
      request(`/families/${familyId}/tree/relationships`, { method: 'DELETE', body: JSON.stringify(data) }),
  },

  // Memories
  memories: {
    list: (familyId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/families/${familyId}/memories${qs ? `?${qs}` : ''}`);
    },
    get: (familyId, memoryId) => request(`/families/${familyId}/memories/${memoryId}`),
    create: (familyId, data) => request(`/families/${familyId}/memories`, { method: 'POST', body: JSON.stringify(data) }),
    update: (familyId, memoryId, data) =>
      request(`/families/${familyId}/memories/${memoryId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (familyId, memoryId) => request(`/families/${familyId}/memories/${memoryId}`, { method: 'DELETE' }),
    toggleFavorite: (familyId, memoryId) =>
      request(`/families/${familyId}/memories/${memoryId}/favorite`, { method: 'POST' }),
  },

  // Stories
  stories: {
    list: (familyId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/families/${familyId}/stories${qs ? `?${qs}` : ''}`);
    },
    get: (familyId, storyId) => request(`/families/${familyId}/stories/${storyId}`),
    create: (familyId, data) => request(`/families/${familyId}/stories`, { method: 'POST', body: JSON.stringify(data) }),
    update: (familyId, storyId, data) =>
      request(`/families/${familyId}/stories/${storyId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (familyId, storyId) => request(`/families/${familyId}/stories/${storyId}`, { method: 'DELETE' }),
    toggleFavorite: (familyId, storyId) =>
      request(`/families/${familyId}/stories/${storyId}/favorite`, { method: 'POST' }),
  },

  // Recipes
  recipes: {
    list: (familyId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/families/${familyId}/recipes${qs ? `?${qs}` : ''}`);
    },
    get: (familyId, recipeId) => request(`/families/${familyId}/recipes/${recipeId}`),
    create: (familyId, data) => request(`/families/${familyId}/recipes`, { method: 'POST', body: JSON.stringify(data) }),
    update: (familyId, recipeId, data) =>
      request(`/families/${familyId}/recipes/${recipeId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (familyId, recipeId) => request(`/families/${familyId}/recipes/${recipeId}`, { method: 'DELETE' }),
    toggleFavorite: (familyId, recipeId) =>
      request(`/families/${familyId}/recipes/${recipeId}/favorite`, { method: 'POST' }),
  },

  // Timeline
  timeline: {
    list: (familyId, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/families/${familyId}/timeline${qs ? `?${qs}` : ''}`);
    },
    create: (familyId, data) => request(`/families/${familyId}/timeline`, { method: 'POST', body: JSON.stringify(data) }),
    update: (familyId, eventId, data) =>
      request(`/families/${familyId}/timeline/${eventId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (familyId, eventId) => request(`/families/${familyId}/timeline/${eventId}`, { method: 'DELETE' }),
  },

  // On This Day
  onThisDay: {
    get: (familyId) => request(`/families/${familyId}/on-this-day`),
  },

  // Global Search
  search: {
    query: (familyId, q) => request(`/families/${familyId}/search?q=${encodeURIComponent(q)}`),
  },

  // Notifications & Activity
  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
    getActivity: (familyId) => request(`/notifications/activity/${familyId}`),
  },

  // Media Upload
  media: {
    upload: (familyId, file) => {
      const formData = new FormData();
      formData.append('file', file);
      return request(`/families/${familyId}/media/upload`, { method: 'POST', body: formData });
    },
  },

  // Health
  health: () => request('/health'),
};

export const client = api;
export default api;
