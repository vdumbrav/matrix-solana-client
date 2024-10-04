import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { AuthContext } from '../contexts/AuthContext';

export const OAuthCallback = () => {
  const { setUser, setAccessToken } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await magic.oauth.getRedirectResult();
        const userInfo = result.magic.userMetadata;
        const oauthAccessToken = result.oauth.accessToken;

        localStorage.setItem('user', JSON.stringify(userInfo));
        localStorage.setItem('accessToken', oauthAccessToken);

        setUser(userInfo);
        setAccessToken(oauthAccessToken);

        const matrixSSORedirectUrl = `https://matrix.org/_matrix/client/r0/login/sso/redirect?redirectUrl=${encodeURIComponent(window.location.origin + '/matrix-callback')}`;
        window.location.href = matrixSSORedirectUrl;
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, setAccessToken]);

  return <div>Processing login...</div>;
};
