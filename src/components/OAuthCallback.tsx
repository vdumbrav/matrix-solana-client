import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';

export const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await magic.oauth.getRedirectResult();
        if (result) {
          localStorage.setItem('resultMagic', JSON.stringify(result));
          const matrixSSORedirectUrl = `https://matrix.org/_matrix/client/r0/login/sso/redirect/oidc-google?redirectUrl=${encodeURIComponent(window.location.origin + '/matrix-callback')}`;
          window.location.href = matrixSSORedirectUrl;
          navigate('/');
        } else {
          throw new Error('No result from Magic OAuth');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing login...</div>;
};
