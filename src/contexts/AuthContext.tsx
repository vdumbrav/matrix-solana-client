import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import magic from '../utils/magic';
import { useNavigate } from 'react-router-dom';
import { MagicUserMetadata } from 'magic-sdk';

interface AuthContextProps {
  user: MagicUserMetadata | null;
  accessToken: string | null;
  matrixAccessToken: string | null;
  matrixUserId: string | null;
  loginWithMagicLink: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<MagicUserMetadata | null>>;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
  setMatrixAccessToken: Dispatch<SetStateAction<string | null>>;
  setMatrixUserId: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  accessToken: null,
  matrixAccessToken: null,
  matrixUserId: null,
  loginWithMagicLink: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  setUser: () => {},
  setAccessToken: () => {},
  setMatrixAccessToken: () => {},
  setMatrixUserId: () => {},
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MagicUserMetadata | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [matrixAccessToken, setMatrixAccessToken] = useState<string | null>(null);
  const [matrixUserId, setMatrixUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    const storedMatrixToken = localStorage.getItem('matrixAccessToken');
    const storedMatrixUserId = localStorage.getItem('matrixUserId');

    if (storedUser && storedToken && storedMatrixToken && storedMatrixUserId) {
      setUser(JSON.parse(storedUser) as MagicUserMetadata);
      setAccessToken(storedToken);
      setMatrixAccessToken(storedMatrixToken);
      setMatrixUserId(storedMatrixUserId);
    }
  }, []);

  const loginWithMagicLink = async (email: string) => {
    try {
      // Log in with Magic Link and get Magic ID token
      await magic.auth.loginWithMagicLink({ email });
      const userInfo = await magic.user.getMetadata(); // Get user information from Magic
      const magicIdToken = await magic.user.getIdToken(); // Get Magic token

      // Update the context and local storage
      setUser(userInfo);
      setAccessToken(magicIdToken);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('accessToken', magicIdToken);

      // Send the Magic OIDC token to the backend to exchange it for a Matrix token
      const response = await fetch('http://localhost:3000/api/matrix-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: magicIdToken,
          type: 'm.login.token', // Matrix token login flow
        }),
      });

      const matrixData = await response.json();
      console.log('Matrix login response:', matrixData);
      if (response.ok) {
        setMatrixAccessToken(matrixData.matrixAccessToken);
        setMatrixUserId(matrixData.userId);
        localStorage.setItem('matrixAccessToken', matrixData.matrixAccessToken);
        localStorage.setItem('matrixUserId', matrixData.userId);
      } else {
        console.error('Matrix login failed:', matrixData.error);
      }

      // Navigate to the home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Magic Link login error:', error);
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
      await magic.user.logout();
      setUser(null);
      setAccessToken(null);
      setMatrixAccessToken(null);
      setMatrixUserId(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('matrixAccessToken');
      localStorage.removeItem('matrixUserId');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        matrixAccessToken,
        matrixUserId,
        loginWithMagicLink,
        loginWithGoogle,
        logout,
        setUser,
        setAccessToken,
        setMatrixAccessToken,
        setMatrixUserId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
