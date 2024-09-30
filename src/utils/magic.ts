import { Magic } from 'magic-sdk';
import { SolanaExtension } from '@magic-ext/solana';

const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
  extensions: [
    new SolanaExtension({
      rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL,
    }),
  ],
});

export default magic;
