import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import magic from '../utils/magic';
import { AuthContext } from '../contexts/AuthContext';

export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await magic.oauth.getRedirectResult();

        const { idToken, userMetadata } = result.magic;

        setUser(userMetadata);
        setAccessToken(idToken);

        localStorage.setItem('user', JSON.stringify(userMetadata));
        localStorage.setItem('accessToken', idToken);

        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setUser, setAccessToken]);

  return <div>Processing login...</div>;
};
