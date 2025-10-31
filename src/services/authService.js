import { tokenStorage } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_CHAT_API_BASE_URL;
const AUTH_ENDPOINT = `${BASE_URL}/api/bubble/auth/`;
const REFRESH_ENDPOINT = `${BASE_URL}/api/bubble/refresh/`;
const EXTERNAL_DASHBOARD_URL = import.meta.env.VITE_EXTERNAL_DASHBOARD_URL;
const FALLBACK_SID = 'd0fe6abf-c614-4b5d-8db1-52e43b296661';

export const authService = {
  getSidForAuth: () => {
    // Prefer stored sid; if missing, try reading from current URL (query or hash), then persist
    let sid = tokenStorage.getSid();
    if (!sid) {
      try {
        const search = typeof window !== 'undefined' ? window.location.search : '';
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const fromSearch = new URLSearchParams(search).get('sid');
        const fromHash = hash && hash.includes('sid=') ? new URLSearchParams(hash.replace(/^#\/?/, '').split('?')[1] || hash.replace(/^#\/?/, '')).get('sid') : null;
        sid = fromSearch || fromHash || null;
        if (sid) tokenStorage.setSid(sid);
      } catch {}
    }
    return sid || FALLBACK_SID;
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
  // If no access token yet, authenticate first using SID
  if (!token) {
    try {
      const accessToken = await authService.initializeAuth();
      token = accessToken;
    } catch (e) {
      // proceed; server may still allow public endpoints
    }
  }
  const maxUnauthorizedAttempts = 2;
  // keep an in-memory counter across calls
  authFetch._unauthorizedAttempts = authFetch._unauthorizedAttempts || 0;
  
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
    authFetch._unauthorizedAttempts += 1;
    if (authFetch._unauthorizedAttempts >= maxUnauthorizedAttempts) {
      // redirect to external dashboard after two failed attempts (disabled for now)
      // if (EXTERNAL_DASHBOARD_URL) window.location.href = EXTERNAL_DASHBOARD_URL;
      throw new Error('Unauthorized');
    }
    const refreshToken = tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      // Try authenticating using sid once before redirecting
      try {
        const sid = authService.getSidForAuth();
        if (!sid) throw new Error('No SID');
        const { accessToken, refreshToken: newRefresh } = await authService.authenticateWithSid(sid);
        token = accessToken;
        tokenStorage.setTokens(accessToken, newRefresh, sid);
        response = await makeRequest(token);
      } catch (e) {
        // if (EXTERNAL_DASHBOARD_URL) window.location.href = EXTERNAL_DASHBOARD_URL; // disabled
        throw e;
      }
    } else {
      try {
        const newAccessToken = await authService.refreshAccessToken(refreshToken);
        tokenStorage.setTokens(newAccessToken);
        response = await makeRequest(newAccessToken);
      } catch (error) {
        console.error('Token refresh error:', error);
        // Attempt SID auth before redirect
        try {
          const sid = authService.getSidForAuth();
          if (!sid) throw new Error('No SID');
          const { accessToken, refreshToken: newRefresh } = await authService.authenticateWithSid(sid);
          tokenStorage.setTokens(accessToken, newRefresh, sid);
          response = await makeRequest(accessToken);
        } catch (e) {
          // if (EXTERNAL_DASHBOARD_URL) window.location.href = EXTERNAL_DASHBOARD_URL; // disabled
          throw e;
        }
      }
    }
  }

  return response;
};

