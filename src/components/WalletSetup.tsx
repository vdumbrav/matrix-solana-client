import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { Wallet } from './Wallet/Wallet';
import { MatrixClient } from 'matrix-js-sdk';
import { SendToken } from './SendToken/SendToken';

interface IProps {
  matrixClient: MatrixClient;
  roomId: string | null;
}

export const WalletSetup = ({ matrixClient, roomId }: IProps) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new SolflareWalletAdapter({ network })], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Wallet />
          <SendToken matrixClient={matrixClient} roomId={roomId} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
