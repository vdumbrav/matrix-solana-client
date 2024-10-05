import { useEffect, useState } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import magic from '../utils/magic';
import { Wallet } from './Wallet/Wallet';
import { SendToken } from './SendToken/SendToken';
import { PublicKey } from '@solana/web3.js';
import { TransactionHistory } from './TransactionHistory/TransactionHistory';
import { Faucet } from './Faucet/Faucet';

interface IProps {
  matrixClient: MatrixClient;
  roomId: string | null;
}
export const WalletContent = ({ matrixClient, roomId }: IProps) => {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const metadata = await magic.user.getMetadata();
        if (metadata.publicAddress) {
          const publicKey = new PublicKey(metadata.publicAddress);
          setPublicKey(publicKey);
        } else {
          console.error('Public address is null.');
        }
      } catch (error) {
        console.error('Error fetching public address:', error);
      }
    };

    fetchPublicKey();
  }, []);

  return (
    <>
      <Wallet publicKey={publicKey} />
      <SendToken matrixClient={matrixClient} roomId={roomId} publicKey={publicKey} />
      <Faucet publicKey={publicKey} />
      <TransactionHistory publicKey={publicKey} />
    </>
  );
};
