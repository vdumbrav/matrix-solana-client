import { useContext, useEffect, useState } from 'react';
import { MatrixClient, createClient } from 'matrix-js-sdk';
import { AuthContext } from '../contexts/AuthContext';

const useMatrixClient = () => {
  const { user } = useContext(AuthContext);
  const [matrixClient, setMatrixClient] = useState<MatrixClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const initializeMatrixClient = async () => {
      try {
        const client = createClient({
          baseUrl: 'https://matrix-client.matrix.org',
          accessToken: import.meta.env.VITE_MATRIX_ACCESS_TOKEN,
          userId: import.meta.env.VITE_MATRIX_USER_ID,
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
  }, [user]);

  return { matrixClient, loading };
};

export default useMatrixClient;
