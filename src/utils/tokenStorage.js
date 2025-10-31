const JWT_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const SID_KEY = 'session_id';

export const tokenStorage = {
  getAccessToken: () => {
    try {
      return localStorage.getItem(JWT_KEY);
    } catch {
      return null;
    }
  },

  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },

  getSid: () => {
    try {
      return localStorage.getItem(SID_KEY);
    } catch {
      return null;
    }
  },

  setTokens: (accessToken, refreshToken, sid) => {
    try {
      if (accessToken) localStorage.setItem(JWT_KEY, accessToken);
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
      if (sid) localStorage.setItem(SID_KEY, sid);
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  },

  setSid: (sid) => {
    try {
      if (sid) localStorage.setItem(SID_KEY, sid);
    } catch (error) {
      console.error('Failed to store sid:', error);
    }
  },

  clearTokens: () => {
    try {
      localStorage.removeItem(JWT_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(SID_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  },

  hasValidToken: () => {
    return !!tokenStorage.getAccessToken();
  }
};

export const getSidFromUrl = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('sid');
  } catch {
    return null;
  }
};

