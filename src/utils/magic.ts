import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import { AuthExtension } from '@magic-ext/auth';
import { SolanaExtension } from '@magic-ext/solana';
import { clusterApiUrl } from '@solana/web3.js';

const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLISHABLE_KEY, {
  extensions: [
    new OAuthExtension(),
    new AuthExtension(),
    new SolanaExtension({
      rpcUrl: clusterApiUrl('devnet'),
    }),
  ],
});

export default magic;
