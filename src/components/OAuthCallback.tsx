import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const matrixSSORedirectUrl = `https://matrix.org/_matrix/client/r0/login/sso/redirect/oidc-google?redirectUrl=${encodeURIComponent(window.location.origin + '/matrix-callback')}`;
        window.location.href = matrixSSORedirectUrl;
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing login...</div>;
};
