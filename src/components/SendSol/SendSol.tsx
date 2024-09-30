import { useState } from 'react';
import { PublicKey, Transaction, SystemProgram, Connection } from '@solana/web3.js';
import styles from './SendSol.module.scss';
import magic from '../../utils/magic';
import { MatrixClient } from 'matrix-js-sdk';

interface SendSolProps {
  matrixClient: MatrixClient;
  roomId: string | null;
}

const connection = new Connection(import.meta.env.VITE_SOLANA_RPC_URL);

export const SendSol = ({ matrixClient, roomId }: SendSolProps) => {
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const sendSol = async () => {
    if (!recipient || !amount) {
      setStatus('Please enter recipient and amount.');
      return;
    }

    try {
      setStatus('Sending...');
      const accounts = await magic.rpcProvider.request({ method: 'solana_requestAccounts' }); // Get accounts
      if (accounts.length === 0) throw new Error('No Solana account found.');

      const senderPublicKey = new PublicKey(accounts[0]);
      const recipientPublicKey = new PublicKey(recipient);
      const amountInLamports = parseFloat(amount) * 1e9; // Convert SOL to lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amountInLamports,
        }),
      );

      const { rawTransaction } = await magic.solana.signTransaction(transaction); // Sign the transaction
      const signature = await connection.sendRawTransaction(rawTransaction); // Send the serialized transaction
      await connection.confirmTransaction(signature, 'processed'); // Confirm the transaction
      setStatus(`Transaction successful! Hash: ${signature}`);

      if (roomId) {
        await matrixClient.sendTextMessage(roomId, `Transaction successful! Hash: ${signature}`);
      }
    } catch (error) {
      console.error('Error sending SOL:', error);
      setStatus('Transaction failed.');
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
      <button onClick={sendSol} className={styles.sendButton}>
        Send
      </button>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};
