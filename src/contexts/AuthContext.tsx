import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { getMatrixAuthFromLocalStorage, saveMatrixAuthToLocalStorage, clearMatrixAuthFromLocalStorage } from '../utils/utils';

interface AuthContextProps {
  matrixAccessToken: string | null;
  matrixUserId: string | null;
  loginWithMagicLink: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setMatrixAccessToken: (token: string | null) => void;
  setMatrixUserId: (userId: string | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  matrixAccessToken: null,
  matrixUserId: null,
  loginWithMagicLink: async () => {},
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

  const loginWithMagicLink = async (email: string) => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      const { accessToken, userId } = await magic.user.getMetadata();
      setMatrixAccessToken(accessToken);
      setMatrixUserId(userId);
      saveMatrixAuthToLocalStorage(accessToken, userId);
      navigate('/');
    } catch (error) {
      console.error('Magic Link login failed:', error);
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
      throw error;
    }
  };

  const logout = async () => {
    setMatrixAccessToken(null);
    setMatrixUserId(null);
    clearMatrixAuthFromLocalStorage();
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        matrixAccessToken,
        matrixUserId,
        loginWithMagicLink,
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
