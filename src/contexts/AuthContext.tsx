import { createContext, useState, useEffect, ReactNode, SetStateAction, Dispatch } from 'react';
import magic from '../utils/magic';

interface AuthContextProps {
  user: any;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: Dispatch<SetStateAction<any>>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  login: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const userInfo = await magic.user.getMetadata();
        setUser(userInfo);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email: string) => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      const userInfo = await magic.user.getMetadata();
      setUser(userInfo);
    } catch (error) {
      console.error('login error:', error);
    }
  };

  const logout = async () => {
    try {
      await magic.user.logout();
      setUser(null);
    } catch (error) {
      console.error('logout error:', error);
    }
  };

  return <AuthContext.Provider value={{ user, login, logout, setUser }}>{children}</AuthContext.Provider>;
};
