import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { matrixLoginWithToken } from '../api/matrixApi';

export const MatrixSSOCallback = () => {
  const { setMatrixAccessToken, setMatrixUserId } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const completeMatrixLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const loginToken = urlParams.get('loginToken');

      if (!loginToken) {
        console.error('No login token found in URL');
        navigate('/login');
        return;
      }

      try {
        const matrixData = await matrixLoginWithToken(loginToken);
        console.log('Matrix SSO callback data:', matrixData);
        if (matrixData) {
          setMatrixAccessToken(matrixData.access_token);
          setMatrixUserId(matrixData.user_id);
        }
        navigate('/');
      } catch (error) {
        console.error('Matrix SSO callback error:', error);
        navigate('/login');
      }
    };

    completeMatrixLogin();
  }, [navigate, setMatrixAccessToken, setMatrixUserId]);

  return <div>Completing Matrix login...</div>;
};
