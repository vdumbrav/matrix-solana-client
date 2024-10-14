import { createContext, useState, useEffect, ReactNode, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { getMatrixAuthFromLocalStorage, clearMatrixAuthFromLocalStorage, saveMatrixAuthToLocalStorage } from '../utils/utils';

interface AuthContextProps {
  matrixAccessToken: string | null;
  matrixUserId: string | null;
  loginWithEmailOTP: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setMatrixAccessToken: (token: string | null) => void;
  setMatrixUserId: (userId: string | null) => void;
}

export const AuthContext = createContext<AuthContextProps>({
  matrixAccessToken: null,
  matrixUserId: null,
  loginWithEmailOTP: async () => {},
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

  const loginWithEmailOTP = async (email: string) => {
    try {
      let response = await magic.auth.loginWithEmailOTP({ email });
      localStorage.setItem('resultMagic', JSON.stringify(response));
      const {  issuer,  publicAddress} = await magic.user.getInfo();
      setMatrixAccessToken(issuer);
      setMatrixUserId(publicAddress);
      saveMatrixAuthToLocalStorage(issuer || '', publicAddress || '');
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
        loginWithEmailOTP,
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
