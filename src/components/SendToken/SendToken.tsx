import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import styles from './SendToken.module.scss';
import { toast } from 'react-toastify';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';

interface SendTokenProps {
  matrixClient: MatrixClient;
  roomId: string | null;
}

export const SendToken = ({ matrixClient, roomId }: SendTokenProps) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [mintAddress, setMintAddress] = useState<string>('');
  const [tokenType, setTokenType] = useState<'SOL' | 'SPL'>('SOL');
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

    if (tokenType === 'SPL' && !isValidPublicKey(mintAddress)) {
      setStatus('Invalid SPL token mint address.');
      return;
    }

    if (!publicKey) {
      setStatus('Please connect your wallet.');
      return;
    }

    try {
      setStatus('Preparing transaction...');
      const transaction = new Transaction();

      if (tokenType === 'SOL') {
        // SOL Transfer logic
        const recipientPublicKey = new PublicKey(recipient);
        const amountInLamports = parseFloat(amount) * 1e9; // 1 SOL = 1e9 lamports

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPublicKey,
            lamports: amountInLamports,
          }),
        );
      } else {
        // SPL Token transfer logic
        const mintPublicKey = new PublicKey(mintAddress);
        const recipientPublicKey = new PublicKey(recipient);
        const amountInDecimals = parseFloat(amount);

        // Fetch the mint account to get decimals
        const mintAccountInfo = await connection.getParsedAccountInfo(mintPublicKey);
        if (!mintAccountInfo.value) {
          setStatus('Invalid SPL token mint address.');
          return;
        }

        // Debugging: Log the fetched mint account data
        console.log('Mint Account Info:', mintAccountInfo.value.data);

        // Check if 'parsed.info.decimals' exists
        if (
          !mintAccountInfo.value.data ||
          !('parsed' in mintAccountInfo.value.data) ||
          !('info' in mintAccountInfo.value.data.parsed) ||
          !('decimals' in mintAccountInfo.value.data.parsed.info)
        ) {
          setStatus('Unable to retrieve token decimals.');
          console.error('Mint account data structure:', mintAccountInfo.value.data);
          return;
        }

        const decimals = mintAccountInfo.value.data.parsed.info.decimals;

        // Get associated token addresses
        const senderATA = await getAssociatedTokenAddress(mintPublicKey, publicKey);
        const recipientATA = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

        const instructions: TransactionInstruction[] = [];

        // Check if sender's ATA exists
        const senderAccountInfo = await connection.getAccountInfo(senderATA);
        if (!senderAccountInfo) {
          // Sender's ATA does not exist; alert user
          setStatus('Sender does not have an associated token account for this mint.');
          console.error('Sender ATA does not exist:', senderATA.toBase58());
          return;
        }

        // Check if recipient's ATA exists
        const recipientAccountInfo = await connection.getAccountInfo(recipientATA);
        if (!recipientAccountInfo) {
          // Create the recipient's ATA
          const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
            publicKey, // Payer
            recipientATA, // Associated token account address
            recipientPublicKey, // Owner of the new account
            mintPublicKey, // Mint
          );
          instructions.push(createRecipientATAInstruction);
        }

        // Create the transfer instruction
        const transferInstruction = createTransferCheckedInstruction(
          senderATA, // Source ATA
          mintPublicKey, // Mint
          recipientATA, // Destination ATA
          publicKey, // Owner of the source ATA
          amountInDecimals * Math.pow(10, decimals), // Amount in smallest units
          decimals, // Decimals
        );

        instructions.push(transferInstruction);

        // Add all instructions to the transaction
        transaction.add(...instructions);
      }

      // Send the transaction using the wallet adapter
      const signature = await sendTransaction(transaction, connection);

      // Optionally, confirm the transaction
      const confirmation = await connection.confirmTransaction(signature, 'finalized');

      if (confirmation.value.err) {
        throw new Error('Transaction failed.');
      }

      setStatus(`Transaction successful! Signature: ${signature}`);
      toast.success(`Transaction successful! Signature: ${signature}`);

      if (roomId) {
        if (tokenType === 'SOL') {
          await matrixClient.sendTextMessage(roomId, `SOL Transaction successful! Signature: ${signature}`);
        } else {
          await matrixClient.sendTextMessage(roomId, `SPL Token Transaction successful! Signature: ${signature}`);
        }
      }

      // Reset form fields
      setRecipient('');
      setAmount('');
      setMintAddress('');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error sending token:', error);
      setStatus('Transaction failed.');
      toast.error(`Transaction failed: ${error.message}`);
    }
  };

  return (
    <div className={styles.sendTokenContainer}>
      <h3>Send Tokens</h3>

      <div className={styles.tokenTypeSelector}>
        <label>
          <input type="radio" value="SOL" checked={tokenType === 'SOL'} onChange={() => setTokenType('SOL')} />
          SOL
        </label>
        <label>
          <input type="radio" value="SPL" checked={tokenType === 'SPL'} onChange={() => setTokenType('SPL')} />
          SPL Token
        </label>
      </div>

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

      {tokenType === 'SPL' && (
        <input
          type="text"
          placeholder="SPL Token Mint Address"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          className={styles.input}
        />
      )}

      <button onClick={sendToken} className={styles.sendButton} disabled={!publicKey}>
        Send
      </button>

      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
};
