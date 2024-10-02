import { PublicKey, Transaction, SystemProgram, Signer } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import styles from './SendToken.module.scss';
import { toast } from 'react-toastify';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';

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
      let transaction = new Transaction();

      if (tokenType === 'SOL') {
        const recipientPublicKey = new PublicKey(recipient);
        const amountInLamports = parseFloat(amount) * 1e9;

        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipientPublicKey,
            lamports: amountInLamports,
          }),
        );
      } else {
        if (!mintAddress) {
          setStatus('Please enter SPL token mint address.');
          return;
        }

        const mintPublicKey = new PublicKey(mintAddress);
        const recipientPublicKey = new PublicKey(recipient);
        const amountInDecimals = parseFloat(amount);

        // Get or create ATA for sender
        const senderATA = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey as unknown as Signer, // The publicKey is used as payer (wallet signs the transaction)
          mintPublicKey, // Mint address of the token
          publicKey, // Owner of the ATA (in this case, the sender)
        );

        // Get or create ATA for recipient
        const recipientATA = await getOrCreateAssociatedTokenAccount(
          connection,
          publicKey as unknown as Signer, // The publicKey is used as payer
          mintPublicKey, // Mint address of the token
          recipientPublicKey, // Owner of the ATA (in this case, the recipient)
        );

        const tokenInfo = await connection.getParsedAccountInfo(mintPublicKey);
        if (!tokenInfo.value) {
          setStatus('Invalid SPL token mint address.');
          return;
        }
        const decimals = (tokenInfo.value.data as any).parsed.info.decimals;

        const transferInstruction = createTransferInstruction(
          senderATA.address,
          recipientATA.address,
          publicKey,
          amountInDecimals * Math.pow(10, decimals),
        );

        transaction.add(transferInstruction);
      }

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed',
      );

      setStatus(`Transaction successful! Signature: ${signature}`);
      toast.success(`Transaction successful! Signature: ${signature}`);

      if (roomId) {
        if (tokenType === 'SOL') {
          await matrixClient.sendTextMessage(roomId, `SOL Transaction successful! Signature: ${signature}`);
        } else {
          await matrixClient.sendTextMessage(roomId, `SPL Token Transaction successful! Signature: ${signature}`);
        }
      }

      setRecipient('');
      setAmount('');
      setMintAddress('');
    } catch (error) {
      console.error('Error sending token:', error);
      setStatus('Transaction failed.');
      toast.error('Transaction failed.');
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
