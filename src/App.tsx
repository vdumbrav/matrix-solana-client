import { useContext, useEffect } from 'react';
import styles from './App.module.scss';

import { AuthContext } from './contexts/AuthContext';
import { LogoutButton, Chat, Login } from './components';
import magic from './utils/magic';

const App = () => {
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    // Check if user is being redirected back from Magic link
    const handleMagicLogin = async () => {
      try {
        if (window.location.search.includes('magic_')) {
          const didToken = await magic.auth.loginWithCredential();
          const userInfo = await magic.user.getMetadata();
          console.log('User info:', userInfo);
          console.log('didToken:', didToken);

          setUser(userInfo);
        }
      } catch (error) {
        console.error('Magic login error:', error);
      }
    };

    handleMagicLogin();
  }, [setUser]);

  return (
    <div className={styles.appContainer}>
      {user ? (
        <>
          <header className={styles.header}>
            <h1>Matrix Solana Client</h1>
            <LogoutButton />
          </header>
          <Chat />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;
