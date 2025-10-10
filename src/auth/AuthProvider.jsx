import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';

export const AuthContext = createContext({ 
  token: null, 
  loading: true, 
  error: null, 
  retry: () => {} 
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => tokenStorage.getAccessToken());
  const [loading, setLoading] = useState(() => !tokenStorage.hasValidToken());
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) return;

    let cancelled = false;

    async function authenticate() {
      setLoading(true);
      setError(null);

      try {
        const accessToken = await authService.initializeAuth();
        
        if (!cancelled) {
          setToken(accessToken);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Authentication error:', err);
          setError(err?.message || 'Authentication failed');
          setLoading(false);
        }
      }
    }

    authenticate();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const retry = () => {
    tokenStorage.clearTokens();
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
    </AuthContext.Provider>
  );
};

export default AuthProvider;

