import { tokenStorage, getSidFromUrl } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL;
const AUTH_ENDPOINT = `${BASE_URL}/api/bubble/auth/`;
const REFRESH_ENDPOINT = `${BASE_URL}/api/bubble/refresh/`;
const EXTERNAL_DASHBOARD_URL = import.meta.env.VITE_EXTERNAL_DASHBOARD_URL;

export const authService = {
  getSidForAuth: () => {
    const urlSid = getSidFromUrl();
    const storedSid = tokenStorage.getSid();
    
    if (urlSid) {
      return urlSid;
    }
    
    if (storedSid) {
      return storedSid;
    }
    
    throw new Error('No session ID available');
  },

  authenticateWithSid: async (sid) => {
    const url = `${AUTH_ENDPOINT}?sid=${encodeURIComponent(sid)}`;
    const response = await fetch(url, { method: 'GET' });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    
    const accessToken = data?.messsage?.access || data?.message?.access || data?.access;
    const refreshToken = data?.messsage?.refresh || data?.message?.refresh || data?.refresh;

    if (!accessToken) {
      throw new Error('No access token received from server');
    }

    return { accessToken, refreshToken };
  },

  refreshAccessToken: async (refreshToken) => {
    const response = await fetch(REFRESH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    const newAccessToken = data?.message?.access || data?.access || data?.token || data?.jwt;

    if (!newAccessToken) {
      throw new Error('No access token received from refresh');
    }

    return newAccessToken;
  },

  initializeAuth: async () => {
    const sid = authService.getSidForAuth();
    const { accessToken, refreshToken } = await authService.authenticateWithSid(sid);
    tokenStorage.setTokens(accessToken, refreshToken, sid);
    return accessToken;
  },

  logout: () => {
    tokenStorage.clearTokens();
    window.location.reload();
  }
};

export { EXTERNAL_DASHBOARD_URL };

export const authFetch = async (input, init = {}) => {
  let token = tokenStorage.getAccessToken();
  
  const makeRequest = (authToken) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    };

    return fetch(input, { ...init, headers });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      authService.logout();
      return;
    }

    try {
      const newAccessToken = await authService.refreshAccessToken(refreshToken);
      tokenStorage.setTokens(newAccessToken);
      response = await makeRequest(newAccessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      authService.logout();
      return;
    }
  }

  return response;
};

