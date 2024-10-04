import { useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import magic from '../../utils/magic';
import styles from './Wallet.module.scss';

interface WalletProps {
  publicKey: PublicKey | null;
}

export const Wallet = ({ publicKey }: WalletProps) => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      if (publicKey) {
        try {
          // Fetching the balance from Solana Devnet
          const connection = new Connection(magic.solana.solanaConfig.rpcUrl);
          const balanceLamports = await connection.getBalance(publicKey);
          const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL
          setBalance(balanceSol);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      }
    };

    fetchWalletData();
  }, [publicKey]);

  const openMagicWallet = () => {
    magic.wallet.showUI().catch((err) => {
      console.error('Error showing Magic wallet:', err);
    });
  };

  return (
    <div className={styles.walletContainer}>
      <h3>Solana Wallet</h3>
      {publicKey ? (
        <div className={styles.data}>
          <p>
            <strong>Public Key:</strong> {publicKey.toBase58()}
          </p>
          <p>
            <strong>Balance:</strong> {balance !== null ? balance : 'Loading...'} SOL
          </p>
        </div>
      ) : (
        <p>No wallet connected.</p>
      )}
      <button className={styles.walletButton} onClick={openMagicWallet}>
        Open Magic Wallet
      </button>
    </div>
  );
};
