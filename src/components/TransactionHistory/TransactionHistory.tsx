import { useEffect, useState } from 'react';
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import styles from './TransactionHistory.module.scss';
import magic from '../../utils/magic';
import { formatTimestamp } from '../../utils/utils';

interface TransactionHistoryProps {
  publicKey: PublicKey | null;
}

export const TransactionHistory = ({ publicKey }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<ParsedTransactionWithMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;

      setLoading(true);
      try {
        const connection = new Connection(magic.solana.solanaConfig.rpcUrl);
        const signatures = await connection.getSignaturesForAddress(publicKey);

        const parsedTransactions = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getParsedTransaction(sig.signature);
            return tx;
          }),
        );

        setTransactions(parsedTransactions.filter((tx) => tx !== null) as ParsedTransactionWithMeta[]);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [publicKey]);

  return (
    <div className={styles.transactionHistoryContainer}>
      <h3>Transaction History</h3>
      {!publicKey ? (
        <p>No wallet connected.</p>
      ) : loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul className={styles.transactionList}>
          {transactions.map((tx, index) => (
            <li key={index} className={styles.transactionItem}>
              <p>
                <strong>Signature:</strong>{' '}
                <a
                  href={`https://explorer.solana.com/tx/${tx.transaction.signatures[0]}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {tx.transaction.signatures[0]}
                </a>
              </p>
              <p>
                <strong>Block Time:</strong> {tx.blockTime ? formatTimestamp(tx.blockTime * 1000, true) : 'N/A'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
