import { useState, useEffect, useContext } from 'react';
import { createClient, MatrixClient } from 'matrix-js-sdk';
import { AuthContext } from '../contexts/AuthContext';

const useMatrixClient = () => {
  const { matrixAccessToken, matrixUserId } = useContext(AuthContext);
  const [matrixClient, setMatrixClient] = useState<MatrixClient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let client: MatrixClient;

    const initializeMatrixClient = async () => {
      if (matrixAccessToken && matrixUserId) {
        client = createClient({
          baseUrl: 'https://matrix.org',
          accessToken: matrixAccessToken,
          userId: matrixUserId,
        });

        client.startClient();
        setMatrixClient(client);
      }
      setLoading(false);
    };

    initializeMatrixClient();

    return () => {
      if (client) {
        client.stopClient();
      }
    };
  }, [matrixAccessToken, matrixUserId]);

  return { matrixClient, loading };
};

export default useMatrixClient;
