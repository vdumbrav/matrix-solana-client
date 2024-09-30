import { useState } from 'react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MatrixClient } from 'matrix-js-sdk';
import styles from './SendSol.module.scss';
import { toast } from 'react-toastify';

interface SendSolProps {
  matrixClient: MatrixClient;
  roomId: string | null;
}

export const SendSol = ({ matrixClient, roomId }: SendSolProps) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const sendSol = async () => {
    if (!recipient || !amount) {
      setStatus('Please enter recipient and amount.');
      return;
    }

    if (!publicKey) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      setStatus('Sending...');

      const recipientPublicKey = new PublicKey(recipient);
      const amountInLamports = parseFloat(amount) * 1e9;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: amountInLamports,
        }),
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setStatus(`Transaction successful! Signature: ${signature}`);
      toast.success(`Transaction successful! Signature: ${signature}`);

      if (roomId) {
        await matrixClient.sendTextMessage(roomId, `Transaction successful! Signature: ${signature}`);
      }
    } catch (error) {
      console.error('Error sending SOL:', error);
      setStatus('Transaction failed.');
      toast.error('Transaction failed.');
    }
  };

  return (
    <div className={styles.sendSolContainer}>
      <h3>Send SOL</h3>
      <input
        type="text"
        placeholder="Recipient Public Key"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className={styles.input}
      />
      <input
        type="number"
        placeholder="Amount in SOL"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={styles.input}
      />
      <button onClick={sendSol} className={styles.sendButton} disabled={!publicKey}>
        Send
      </button>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};
