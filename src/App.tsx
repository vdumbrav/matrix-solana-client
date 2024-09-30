import { useContext, useState, useMemo } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Login, Chat, LogoutButton, SendSol, Wallet } from './components';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import useMatrixClient from './utils/matrix';
import styles from './App.module.scss';

const network = WalletAdapterNetwork.Devnet;

export const App = () => {
  const { user } = useContext(AuthContext);
  const { matrixClient, loading } = useMatrixClient();
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleRoomIdChange = (selectedRoomId: string | null) => {
    setRoomId(selectedRoomId);
  };

  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ToastContainer />
          <header className={styles.content}>
            <h1>Matrix Solana Client</h1>
            <WalletMultiButton />
          </header>
          <div className={styles.content}>
            <Chat matrixClient={matrixClient} onRoomIdChange={handleRoomIdChange} />
            <Wallet />
            <SendSol matrixClient={matrixClient} roomId={roomId} />
            <LogoutButton />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
