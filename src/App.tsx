import { useContext, useState } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { Login, Chat, LogoutButton, SendSol, Wallet } from './components';
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import useMatrixClient from './utils/matrix';
import styles from './App.module.scss';
import { WalletSetup } from './components/WalletSetup';

export const App = () => {
  const { user } = useContext(AuthContext);
  const { matrixClient, loading } = useMatrixClient();
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleRoomIdChange = (selectedRoomId: string | null) => {
    setRoomId(selectedRoomId);
  };

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
    <div>
      <header className={styles.content}>
        <h1>Matrix Solana Client</h1>
      </header>
      <div className={styles.content}>
        <Chat matrixClient={matrixClient} onRoomIdChange={handleRoomIdChange} />
        <WalletSetup matrixClient={matrixClient} roomId={roomId} />
        <LogoutButton />
      </div>
    </div>
  );
};

export default App;
