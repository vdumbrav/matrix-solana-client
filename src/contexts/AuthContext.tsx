import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagicUserMetadata } from 'magic-sdk';
import magic from '../utils/magic';

interface AuthContextProps {
  user: MagicUserMetadata | null;
  accessToken: string | null;
  matrixAccessToken: string | null;
  matrixUserId: string | null;
  loginWithPassword: (username: string, password: string) => Promise<void>;
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
  loginWithPassword: async () => {},
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
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
      setMatrixAccessToken(storedMatrixToken);
      setMatrixUserId(storedMatrixUserId);
    }
  }, []);

  const loginWithPassword = async (username: string, password: string) => {
    try {
      const response = await fetch('https://matrix.org/_matrix/client/v3/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'm.login.password',
          user: username,
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMatrixAccessToken(data.access_token);
        setMatrixUserId(data.user_id);
        localStorage.setItem('matrixAccessToken', data.access_token);
        localStorage.setItem('matrixUserId', data.user_id);

        // Navigate to home page
        navigate('/');
      } else {
        throw new Error('Login failed');
      }
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
        loginWithPassword,
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
