/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, FC } from 'react';
import magic from '../utils/magic';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  user: any;
  accessToken: string | null;
  loginWithMagicLink: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<any>>;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  accessToken: null,
  loginWithMagicLink: async () => {},
  loginWithGoogle: async () => {},
  loginWithEmailOTP: async () => {},
  logout: async () => {},
  setUser: () => {},
  setAccessToken: () => {},
});

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('accessToken');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);

  const loginWithMagicLink = async (email: string) => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      const userInfo = await magic.user.getInfo();
      const token = await magic.user.getIdToken();
      setUser(userInfo);
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Magic Link login error:', error);
    }
  };

  const loginWithEmailOTP = async (email: string) => {
    try {
      await magic.auth.loginWithEmailOTP({ email });
      const userInfo = await magic.user.getInfo();
      const token = await magic.user.getIdToken();
      setUser(userInfo);
      setAccessToken(token);
      localStorage.setItem('user', JSON.stringify(userInfo));
      localStorage.setItem('accessToken', token);
    } catch (error) {
      console.error('Email OTP login error:', error);
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
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
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
        loginWithMagicLink,
        loginWithGoogle,
        loginWithEmailOTP,
        logout,
        setUser,
        setAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
