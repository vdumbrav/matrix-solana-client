import { useEffect, useState } from 'react';
import { PublicKey, Connection } from '@solana/web3.js';
import styles from './Wallet.module.scss';
import magic from '../../utils/magic';

const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL);

export const Wallet = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getWalletInfo = async () => {
      try {
        const accounts = await magic.rpcProvider.request({ method: 'solana_requestAccounts' }); // Get accounts
        console.log('Accounts:', accounts);
        if (accounts.length > 0) {
          const pubKey = new PublicKey(accounts[0]); // Convert to Solana PublicKey
          console.log('Public key:', pubKey.toBase58());
          setPublicKey(pubKey.toBase58()); // Set the public key

          const balanceLamports = await connection.getBalance(pubKey);
          const balanceSol = balanceLamports / 1e9; // Convert lamports to SOL
          setBalance(balanceSol);
        }
      } catch (error) {
        console.error('Error fetching wallet info:', error);
      } finally {
        setLoading(false);
      }
    };

    getWalletInfo();
  }, []);

  if (loading) {
    return <div className={styles.walletContainer}>Loading wallet...</div>;
  }

  return (
    <div className={styles.walletContainer}>
      <h3>Solana Wallet</h3>
      {publicKey ? (
        <div>
          <p>
            <strong>Public Key:</strong> {publicKey}
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
