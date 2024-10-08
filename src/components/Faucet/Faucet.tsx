import { useState } from 'react';
import { PublicKey, Connection, clusterApiUrl } from '@solana/web3.js';
import styles from './Faucet.module.scss';
import { toast } from 'react-toastify';
import classNames from 'classnames';
import classnames from 'classnames';

interface FaucetProps {
  publicKey: PublicKey | null;
}

export const Faucet = ({ publicKey }: FaucetProps) => {
  const [status, setStatus] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);

  const requestAirdrop = async () => {
    if (!publicKey) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      setStatus(`Requesting ${amount} SOL airdrop...`);
      const connection = new Connection(clusterApiUrl('devnet'));

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const airdropSignature = await connection.requestAirdrop(publicKey, amount * 1e9);

      const confirmationStrategy = {
        signature: airdropSignature,
        blockhash,
        lastValidBlockHeight,
      };

      await connection.confirmTransaction(confirmationStrategy);

      setStatus(`Airdrop successful! You received ${amount} SOL.`);
      toast.success(`Airdrop successful! You received ${amount} SOL.`);
    } catch (error) {
      setStatus('Airdrop failed.');
      toast.error(`Airdrop failed: ${error}`);
    }
  };

  return (
    <div className={styles.faucetContainer}>
      <h3>Solana Faucet</h3>

      <div className={styles.buttonGroup}>
        <button
          onClick={() => setAmount(0.5)}
          className={classNames(styles.faucetButton, { [styles.active]: amount === 0.5 })}
        >
          0.5 SOL
        </button>
        <button
          onClick={() => setAmount(1)}
          className={classNames(styles.faucetButton, { [styles.active]: amount === 1 })}
        >
          1 SOL
        </button>
        <button
          onClick={() => setAmount(2.5)}
          className={classNames(styles.faucetButton, { [styles.active]: amount === 2.5 })}
        >
          2.5 SOL
        </button>
        <button
          onClick={() => setAmount(5)}
          className={classNames(styles.faucetButton, { [styles.active]: amount === 5 })}
        >
          5 SOL
        </button>
      </div>

      {<p className={classnames(styles.status, { [styles.hiddenStatus]: status })}>{status}</p>}

      <button onClick={requestAirdrop} className={styles.faucetButton} disabled={!publicKey}>
        Request {amount} SOL Airdrop
      </button>
    </div>
  );
};
