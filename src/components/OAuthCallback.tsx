import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { AuthContext } from '../contexts/AuthContext';

export const OAuthCallback = () => {
  const { setUser, setAccessToken, setMatrixAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await magic.oauth.getRedirectResult();
        const userInfo = result.magic.userMetadata;
        const oauthAccessToken = result.oauth.accessToken;
        const magicIdToken = await magic.user.getIdToken();

        console.log('magicIdToken', magicIdToken);
        console.log('oauthAccessToken', oauthAccessToken);

        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('accessToken', oauthAccessToken);

        setUser(userInfo);
        setAccessToken(oauthAccessToken);

        const response = await fetch('http://localhost:3000/api/matrix-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: oauthAccessToken,
            type: 'm.login.token',
          }),
        });

        const matrixData = await response.json();
        console.log('Matrix login response:', matrixData);
        if (response.ok) {
          setMatrixAccessToken(matrixData.matrixAccessToken);
          localStorage.setItem('matrixAccessToken', matrixData.matrixAccessToken);
        } else {
          console.error('Matrix login failed:', matrixData.error);
        }

        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, setAccessToken, setMatrixAccessToken]);

  return <div>Processing login...</div>;
};
