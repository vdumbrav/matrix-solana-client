import { useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
} from '@solana/spl-token';
import { useConnection } from '@solana/wallet-adapter-react';
import { toast } from 'react-toastify';
import styles from './SendToken.module.scss';
import magic from '../../utils/magic';

interface SendTokenProps {
  matrixClient: MatrixClient;
  roomId: string | null;
  publicKey: PublicKey | null;
}

export const SendToken = ({ matrixClient, roomId, publicKey }: SendTokenProps) => {
  const { connection } = useConnection();
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
        const mintPublicKey = new PublicKey(mintAddress);
        const recipientPublicKey = new PublicKey(recipient);
        const amountInDecimals = parseFloat(amount);

        const mintAccountInfo = await connection.getParsedAccountInfo(mintPublicKey);
        if (!mintAccountInfo.value) {
          setStatus('Invalid SPL token mint address.');
          return;
        }

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
        const senderATA = await getAssociatedTokenAddress(mintPublicKey, publicKey);
        const recipientATA = await getAssociatedTokenAddress(mintPublicKey, recipientPublicKey);

        const instructions: TransactionInstruction[] = [];

        const senderAccountInfo = await connection.getAccountInfo(senderATA);
        if (!senderAccountInfo) {
          setStatus('Sender does not have an associated token account for this mint.');
          return;
        }

        const recipientAccountInfo = await connection.getAccountInfo(recipientATA);
        if (!recipientAccountInfo) {
          const createRecipientATAInstruction = createAssociatedTokenAccountInstruction(
            publicKey,
            recipientATA,
            recipientPublicKey,
            mintPublicKey,
          );
          instructions.push(createRecipientATAInstruction);
        }

        const transferInstruction = createTransferCheckedInstruction(
          senderATA,
          mintPublicKey,
          recipientATA,
          publicKey,
          amountInDecimals * Math.pow(10, decimals),
          decimals,
        );

        instructions.push(transferInstruction);
        transaction.add(...instructions);
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.feePayer = publicKey;

      const { rawTransaction } = await magic.solana.signTransaction(transaction, {
        requireAllSignatures: true,
        verifySignatures: false,
      });

      const signedTransaction = Transaction.from(rawTransaction);

      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'finalized',
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed.');
      }

      setStatus(`Transaction successful! Signature: ${signature}`);
      toast.success(`Transaction successful! Signature: ${signature}`);

      if (roomId) {
        const message = `${tokenType} Transaction successful! Signature: ${signature}`;
        await matrixClient.sendTextMessage(roomId, message);
      }

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
