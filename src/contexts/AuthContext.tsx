import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { matrixLoginWithPassword } from '../api/matrixApi';
import {
  getMatrixAuthFromLocalStorage,
  saveMatrixAuthToLocalStorage,
  clearMatrixAuthFromLocalStorage,
} from '../utils/utils';

interface AuthContextProps {
  matrixAccessToken: string | null;
  matrixUserId: string | null;
  loginWithPassword: (username: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setMatrixAccessToken: (token: string | null) => void;
  setMatrixUserId: (userId: string | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  matrixAccessToken: null,
  matrixUserId: null,
  loginWithPassword: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  setMatrixAccessToken: () => {},
  setMatrixUserId: () => {},
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [matrixAccessToken, setMatrixAccessToken] = useState<string | null>(null);
  const [matrixUserId, setMatrixUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { matrixAccessToken, matrixUserId } = getMatrixAuthFromLocalStorage();
    if (matrixAccessToken && matrixUserId) {
      setMatrixAccessToken(matrixAccessToken);
      setMatrixUserId(matrixUserId);
    }
  }, []);

  const loginWithPassword = async (username: string, password: string) => {
    try {
      const data = await matrixLoginWithPassword(username, password);
      setMatrixAccessToken(data.access_token);
      setMatrixUserId(data.user_id);

      saveMatrixAuthToLocalStorage(data.access_token, data.user_id);

      navigate('/');
    } catch (error) {
      console.error('Matrix login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await magic.oauth.loginWithRedirect({
        provider: 'google',
        redirectURI: window.location.origin + '/callback',
      });
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const logout = async () => {
    try {
      setMatrixAccessToken(null);
      setMatrixUserId(null);

      clearMatrixAuthFromLocalStorage();

      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        matrixAccessToken,
        matrixUserId,
        loginWithPassword,
        loginWithGoogle,
        logout,
        setMatrixAccessToken,
        setMatrixUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
