import { useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { PublicKey, Transaction, SystemProgram, Connection } from '@solana/web3.js';
import { toast } from 'react-toastify';
import styles from './SendToken.module.scss';
import magic from '../../utils/magic';

interface SendTokenProps {
  matrixClient: MatrixClient;
  roomId: string | null;
  publicKey: PublicKey | null;
}

export const SendToken = ({ matrixClient, roomId, publicKey }: SendTokenProps) => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const isValidPublicKey = (key: string): boolean => {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  };

  const sendToken = async () => {
    if (!recipient || !amount) {
      setStatus('Please enter recipient and amount.');
      return;
    }

    if (!isValidPublicKey(recipient)) {
      setStatus('Invalid recipient public key.');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setStatus('Amount must be greater than zero.');
      return;
    }

    if (!publicKey) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      setStatus('Preparing transaction...');
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * 1e9,
        })
      );

      const connection = new Connection(magic.solana.solanaConfig.rpcUrl);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const { rawTransaction } = await magic.solana.signTransaction(transaction);
      const signedTransaction = Transaction.from(rawTransaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed during confirmation.');
      }

      setStatus(`Transaction successful! Signature: ${signature}`);
      toast.success(`Transaction successful! Signature: ${signature}`);

      if (roomId) {
        const message = `SOL Transfer Successful! Signature: ${signature}`;
        await matrixClient.sendTextMessage(roomId, message);
      }

      setRecipient('');
      setAmount('');
    } catch (error: any) {
      console.error('Error sending token:', error);
      setStatus(`Transaction failed: ${error.message}`);
      toast.error(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className={styles.sendTokenContainer}>
      <h3>Send SOL Tokens</h3>

      <input
        type="text"
        placeholder="Recipient Public Key"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className={styles.input}
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={styles.input}
      />

      <button onClick={sendToken} className={styles.sendButton} disabled={!publicKey}>
        Send
      </button>

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};
