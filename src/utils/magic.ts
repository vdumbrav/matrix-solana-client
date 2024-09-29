import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

const magic = new Magic('pk_live_6DCA31211A986C43', {
  extensions: [
    new SolanaExtension({
      rpcUrl: 'https://api.devnet.solana.com',
    }),
  ],
});

export default magic;
