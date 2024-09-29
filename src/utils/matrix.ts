import { createClient } from 'matrix-js-sdk';

const matrixClient = createClient({
  baseUrl: 'https://matrix.org',
  accessToken: 'syl_PBoUHFGEBZHvzBJxlanM_4LJKt5',
  userId: 'vdumbrava:matrix.org',
});

export default matrixClient;
