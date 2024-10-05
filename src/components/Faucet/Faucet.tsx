import { useState } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import styles from './Faucet.module.scss';
import { toast } from 'react-toastify';

interface FaucetProps {
  publicKey: PublicKey | null;
}

export const Faucet = ({ publicKey }: FaucetProps) => {
  const [status, setStatus] = useState<string>('');

  const requestAirdrop = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      setStatus('Requesting airdrop...');
      const connection = new Connection(clusterApiUrl('devnet'));
      const airdropSignature = await connection.requestAirdrop(publicKey, 2 * 1e9); // 2 SOL
      await connection.confirmTransaction(airdropSignature);
      setStatus('Airdrop successful! You received 2 SOL.');
      toast.success('Airdrop successful! You received 2 SOL.');
    } catch (error) {
      setStatus('Airdrop failed.');
      toast.error(`Airdrop failed: ${error}`);
    }
  };

  return (
    <div className={styles.faucetContainer}>
      <h3>Solana Faucet</h3>
      <button onClick={requestAirdrop} className={styles.faucetButton} disabled={!publicKey}>
        Request 2 SOL Airdrop
      </button>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};
