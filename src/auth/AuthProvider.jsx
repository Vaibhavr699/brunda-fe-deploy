import React, { createContext, useContext, useEffect, useState } from 'react';

const AUTH_ENDPOINT = 'https://ab60d0106817.ngrok-free.app/api/bubble/auth/';
const SID_KEY = 'sid';
const JWT_KEY = 'jwt';
const REFRESH_KEY = 'refresh_token';

export const AuthContext = createContext({ token: null, loading: true, error: null, retry: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export async function authFetch(input, init = {}) {
  const token = sessionStorage.getItem(JWT_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(input, { ...init, headers });
}

export function getSidFromUrl() {
  try {
    const sp = new URLSearchParams(window.location.search);
    return sp.get('sid') || null;
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(JWT_KEY));
  const [loading, setLoading] = useState(() => !sessionStorage.getItem(JWT_KEY));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) return;

    let cancelled = false;

    async function runAuth() {
      setLoading(true);
      setError(null);

      try {
        // primary flow: read sid from URL params or sessionStorage
        let sid = getSidFromUrl() || sessionStorage.getItem(SID_KEY) || null;
        if (!sid) throw new Error('No session id (sid) provided');

        const jwtUrl = `${AUTH_ENDPOINT}?sid=${encodeURIComponent(sid)}`;
        const res = await fetch(jwtUrl, { method: 'GET' });
        if (!res.ok) throw new Error('Failed to exchange sid for tokens');

        const json = await res.json();
        // expected shape: { message: { access, refresh } } or { message: { access, refresh } }
        const access = json?.message?.access || json?.messsage?.access || json?.access || json?.token || json?.jwt || json?.data?.access || null;
        const refresh = json?.message?.refresh || json?.messsage?.refresh || json?.refresh || json?.data?.refresh || null;

        if (!access) throw new Error('No access token returned from auth endpoint');

        try {
          sessionStorage.setItem(JWT_KEY, access);
          if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh);
          sessionStorage.setItem(SID_KEY, sid);
        } catch (e) {}

        if (!cancelled) {
          setToken(access);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          // log errors to console instead of showing UI
          console.error('[AuthProvider] authentication error:', err);
          setError(err?.message || 'Authentication failed');
          setLoading(false);
        }
      }
    }

    runAuth();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const retry = () => {
    try {
      sessionStorage.removeItem(JWT_KEY);
      sessionStorage.removeItem(REFRESH_KEY);
    } catch (e) {}
    setToken(null);
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ token, loading, error, retry }}>
      {children}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <div className="text-gray-700">Signing you in...</div>
          </div>
        </div>
      )}

      {/* errors are logged to console; no frontend error UI */}
    </AuthContext.Provider>
  );
};

export default AuthProvider;


