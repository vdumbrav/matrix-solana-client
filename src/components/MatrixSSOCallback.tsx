import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

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

      console.log('Completing Matrix login...', loginToken);

      try {
        const response = await fetch('http://localhost:3000/api/matrix-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'm.login.token',
            token: loginToken,
          }),
        });

        const matrixData = await response.json();
        if (response.ok) {
          setMatrixAccessToken(matrixData.access_token);
          setMatrixUserId(matrixData.user_id);
          localStorage.setItem('matrixAccessToken', matrixData.access_token);
          localStorage.setItem('matrixUserId', matrixData.user_id);

          navigate('/');
        } else {
          console.error('Matrix login failed:', matrixData.error);
          navigate('/login');
        }
      } catch (error) {
        console.error('Matrix SSO callback error:', error);
        navigate('/login');
      }
    };

    completeMatrixLogin();
  }, [navigate, setMatrixAccessToken, setMatrixUserId]);

  return <div>Completing Matrix login...</div>;
};
