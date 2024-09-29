import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import useMatrixClient from './utils/matrix';
import { Login, Chat, LogoutButton } from './components';
import styles from './App.module.scss';

const App = () => {
  const { user } = useContext(AuthContext);
  const { matrixClient, loading } = useMatrixClient();

  if (!user) {
    return <Login />;
  }

  if (loading) {
    return <div>Loading chat...</div>;
  }

  if (!matrixClient) {
    return <div>Matrix client failed to initialize.</div>;
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.content}>
        <h1>Matrix Solana Client</h1>
      </header>
      <Chat matrixClient={matrixClient} />
      <div className={styles.content}>
        <LogoutButton />
      </div>
    </div>
  );
};

export default App;
