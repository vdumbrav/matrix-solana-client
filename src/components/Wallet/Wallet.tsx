import { useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import magic from '../../utils/magic';
import styles from './Wallet.module.scss';
import classnames from 'classnames';

interface WalletProps {
  publicKey: PublicKey | null;
}

export const Wallet = ({ publicKey }: WalletProps) => {
  const [balance, setBalance] = useState<number | null>(null);

  const fetchWalletData = async () => {
    if (publicKey) {
      try {
        const connection = new Connection(magic.solana.solanaConfig.rpcUrl);
        const balanceLamports = await connection.getBalance(publicKey);
        const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL
        setBalance(balanceSol);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [publicKey]);

  const revealPrivateKey = async () => {
    await magic.user.revealPrivateKey();
  };

  return (
    <div className={styles.walletContainer}>
      <h3>Solana Wallet</h3>
      {publicKey ? (
        <>
          <div className={styles.data}>
            <p>
              <strong>Public Key:</strong> {publicKey.toBase58()}
            </p>
            <p>
              <strong>Balance:</strong> {balance !== null ? balance : 'Loading...'} SOL
            </p>
          </div>
          <div className={styles.walletButtons}>
          <button className={styles.walletButton} onClick={fetchWalletData} type={'button'}>
            Refetch Balance
          </button>
          <button className={classnames(styles.walletButton, styles.revealButton)} onClick={revealPrivateKey} type={'button'}>
            Reveal Private Key
          </button>
          </div>
        </>
      ) : (
        <p>No wallet connected.</p>
      )}
    </div>
  );
};
