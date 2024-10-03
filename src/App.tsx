import { useContext, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import useMatrixClient from './utils/matrix';
import styles from './App.module.scss';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Login, Chat, LogoutButton } from './components';
import { OAuthCallback } from './components/OAuthCallback';
import { WalletSetup } from './components/WalletSetup';

const App = () => {
  const { user } = useContext(AuthContext);
  const { matrixClient, loading } = useMatrixClient();
  const [roomId, setRoomId] = useState<string | null>(null);

  const handleRoomIdChange = (selectedRoomId: string | null) => {
    setRoomId(selectedRoomId);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.appContainer}>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/callback" element={<OAuthCallback />} />
        <Route
          path="/"
          element={
            user ? (
              <div className={styles.content}>
                <h1>Matrix Solana Client</h1>
                {matrixClient ? (
                  <>
                    <Chat matrixClient={matrixClient} onRoomIdChange={handleRoomIdChange} />
                    <WalletSetup matrixClient={matrixClient} roomId={roomId} />
                    <LogoutButton />
                  </>
                ) : (
                  <div>Failed to initialize Matrix client.</div>
                )}
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
