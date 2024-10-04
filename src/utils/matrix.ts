import { useState, useEffect, useContext } from 'react';
import { createClient, MatrixClient } from 'matrix-js-sdk';
import { AuthContext } from '../contexts/AuthContext';

const useMatrixClient = () => {
  const { accessToken } = useContext(AuthContext);
  const [matrixClient, setMatrixClient] = useState<MatrixClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const initializeMatrixClient = async () => {
      try {
        console.log('Initializing Matrix client...', accessToken);
        const client = createClient({
          baseUrl: 'https://matrix-client.matrix.org',
          accessToken,
          userId: "@vdumbrava:matrix.org",
        });

        await client.startClient();
        setMatrixClient(client);
        setLoading(false);
      } catch (error) {
        console.error('Matrix client initialization error:', error);
        setLoading(false);
      }
    };

    initializeMatrixClient();
  }, [accessToken]);

  return { matrixClient, loading };
};

export default useMatrixClient;
