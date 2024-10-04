import { useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import magic from '../../utils/magic';
import styles from './Wallet.module.scss';

export const Wallet = () => {
  const [publicAddress, setPublicAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Get the user's public address
        const metadata = await magic.user.getMetadata();
        if (metadata.publicAddress) {
          setPublicAddress(metadata.publicAddress);

          const connection = new Connection(magic.solana.solanaConfig.rpcUrl);

          const publicKey = new PublicKey(metadata.publicAddress);
          const balanceLamports = await connection.getBalance(publicKey);
          const balanceSol = balanceLamports / 1e9; // Convert from lamports to SOL
          setBalance(balanceSol);
        } else {
          console.error('Public address is null.');
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };

    fetchWalletData();
  }, []);

  return (
    <div className={styles.walletContainer}>
      <h3>Solana Wallet</h3>
      {publicAddress ? (
        <div className={styles.data}>
          <p>
            <strong>Public Key:</strong> {publicAddress}
          </p>
          <p>
            <strong>Balance:</strong> {balance} SOL
          </p>
        </div>
      ) : (
        <p>No wallet connected.</p>
      )}
    </div>
  );
};
