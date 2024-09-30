import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import styles from './Wallet.module.scss';

export const Wallet = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const getWalletInfo = async () => {
      if (!publicKey) return;
      try {
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL
        setBalance(balanceSol);
      } catch (error) {
        console.error('Error fetching wallet info:', error);
      }
    };

    getWalletInfo();
  }, [connection, publicKey]);

  return (
    <div className={styles.walletContainer}>
      <h3>Solana Wallet</h3>
      {publicKey ? (
        <div className={styles.data}>
          <p><strong>Public Key:</strong> {publicKey.toBase58()}</p>
          <p><strong>Balance:</strong> {balance} SOL</p>
        </div>
      ) : (
        <p>No wallet connected.</p>
      )}
    </div>
  );
};
